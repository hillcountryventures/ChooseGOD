// supabase/functions/query-bible/index.ts
// RAG-powered Bible query handler

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Strict system prompt - Bible-only answers
const SYSTEM_PROMPT = `You are a faithful Bible study companion called ChooseGOD. Your purpose is to help people understand Scripture.

CRITICAL RULES:
1. Answer ONLY using the provided scripture passages below. Do not use external knowledge.
2. Always cite verse references exactly (e.g., "John 3:16 KJV").
3. Do not add theology, commentary, opinions, or speculation beyond what the text says.
4. If the question cannot be answered from the provided verses, say so gently and suggest the person read related scripture.
5. Be encouraging, warm, and insightful while staying true to the text.
6. Keep responses clear and focused - don't ramble.
7. If asked about topics not in Scripture (like modern events), politely redirect to what Scripture does say about related principles.

Remember: Your goal is to point people TO the Word, not to replace it.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      query,
      translation = "KJV",
      userId,
      include_cross_refs = false,
      includeCrossRefs = false, // Alternative casing
    } = await req.json();

    // Normalize cross-refs flag
    const useCrossRefs = include_cross_refs || includeCrossRefs;

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Normalize translation to lowercase for database queries
    const normalizedTranslation = translation.toLowerCase();

    // Initialize clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    // Step 1: Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 2: Find relevant verses using vector similarity
    // Enhanced: Increased match_count to 15 for richer context
    // Optional: Include cross-references from Treasury of Scripture Knowledge
    const { data: verses, error: matchError } = await supabase.rpc(
      "match_verses",
      {
        query_embedding: queryEmbedding,
        match_count: 15,
        filter_translation: normalizedTranslation,
        similarity_threshold: 0.30, // Lower threshold for broader thematic matching
        include_cross_refs: useCrossRefs,
        cross_ref_limit: 3,
        min_votes: 2,
      }
    );

    if (matchError) {
      console.error("Match error:", matchError);
      throw new Error("Failed to search scripture");
    }

    // Step 3: If no verses found, try keyword search as fallback
    let contextVerses = verses || [];
    if (contextVerses.length === 0) {
      const { data: keywordResults } = await supabase.rpc("search_verses", {
        search_query: query,
        p_translation: normalizedTranslation,
        p_limit: 10,
      });
      contextVerses = keywordResults || [];
    }

    // Step 4: Build context from retrieved verses
    // Separate primary matches from cross-references if enabled
    interface VerseResult {
      book: string;
      chapter: number;
      verse: number;
      text: string;
      is_cross_ref?: boolean;
      cross_ref_votes?: number;
    }

    let context = "";
    if (contextVerses.length > 0) {
      const primaryVerses = contextVerses.filter((v: VerseResult) => !v.is_cross_ref);
      const crossRefVerses = contextVerses.filter((v: VerseResult) => v.is_cross_ref);

      // Build primary context
      context = primaryVerses
        .map(
          (v: VerseResult) =>
            `${v.book} ${v.chapter}:${v.verse} (${translation.toUpperCase()}): "${v.text}"`
        )
        .join("\n\n");

      // Add cross-references section if present
      if (crossRefVerses.length > 0) {
        const crossRefContext = crossRefVerses
          .map(
            (v: VerseResult) =>
              `${v.book} ${v.chapter}:${v.verse} (${translation.toUpperCase()}) [Cross-reference]: "${v.text}"`
          )
          .join("\n\n");
        context += `\n\n--- Related Cross-References ---\n${crossRefContext}`;
      }
    } else {
      // Even with no direct matches, provide helpful context
      context = "The verses above represent thematic connections to your question. Use these biblical principles to guide your response.";
    }

    // Step 5: Generate response using LLM.
    // Privacy pillar #3 (Decision #16): anonymized `user` field so the
    // OpenAI API doesn't associate queries with our user IDs. No training.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      user: "query-bible",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here are the relevant Scripture passages I found:\n\n${context}\n\nUser's question: ${query}`,
        },
      ],
      temperature: 0.5, // Lower = more focused/factual
      max_tokens: 800,
    });

    const response = completion.choices[0].message.content;

    // Step 6: Format sources for the frontend
    const sources = contextVerses.slice(0, 8).map(
      (v: {
        book: string;
        chapter: number;
        verse: number;
        text: string;
        translation: string;
        similarity?: number;
        is_cross_ref?: boolean;
        cross_ref_votes?: number;
      }) => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        translation: v.translation?.toUpperCase() || translation.toUpperCase(),
        similarity: v.similarity,
        isCrossRef: v.is_cross_ref || false,
        crossRefVotes: v.cross_ref_votes,
      })
    );

    // Step 7: Log the query (optional, for analytics)
    if (userId) {
      await supabase.from("query_logs").insert({
        user_id: userId,
        query,
        translation: normalizedTranslation,
        response,
        sources,
      });
    }

    // Return the response
    return new Response(
      JSON.stringify({
        response,
        sources,
        versesSearched: contextVerses.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error:
          "An error occurred while processing your question. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
