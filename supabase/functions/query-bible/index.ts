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
    const { query, translation = "KJV", userId } = await req.json();

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
    const { data: verses, error: matchError } = await supabase.rpc(
      "match_verses",
      {
        query_embedding: queryEmbedding,
        match_count: 12,
        filter_translation: normalizedTranslation,
        similarity_threshold: 0.4,
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
    let context = "";
    if (contextVerses.length > 0) {
      context = contextVerses
        .map(
          (v: {
            book: string;
            chapter: number;
            verse: number;
            text: string;
          }) =>
            `${v.book} ${v.chapter}:${v.verse} (${translation.toUpperCase()}): "${v.text}"`
        )
        .join("\n\n");
    } else {
      context = "No directly relevant verses were found for this query.";
    }

    // Step 5: Generate response using LLM
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective and capable
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
    const sources = contextVerses.slice(0, 5).map(
      (v: {
        book: string;
        chapter: number;
        verse: number;
        text: string;
        translation: string;
        similarity?: number;
      }) => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        translation: v.translation?.toUpperCase() || translation.toUpperCase(),
        similarity: v.similarity,
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
