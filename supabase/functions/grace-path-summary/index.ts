// supabase/functions/grace-path-summary/index.ts
// Grace Path Summary Generator - The "hand-hold" for missed readings
//
// This function generates an encouraging, spiritually-rich summary of
// chapters a user has missed, allowing them to catch up without guilt.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuthedUser } from "../_shared/auth.ts";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Missed reading section
interface MissedSection {
  dayNumber: number;
  displayTitle: string;
  versesJson: Array<{
    book: string;
    startChapter: number;
    endChapter: number;
  }>;
}

// Request body
interface GracePathRequest {
  userId: string;
  progressId: string;
  missedSections: MissedSection[];
  preferredTranslation?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Identity from the verified JWT, never the body (was an IDOR over service-role).
    const auth = await requireAuthedUser(req, corsHeaders);
    if (auth instanceof Response) return auth;
    const { userId, admin: supabase } = auth;

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Parse request (userId comes from the JWT above, not the body)
    const { progressId, missedSections, preferredTranslation = "KJV" }: GracePathRequest = await req.json();

    if (!progressId || !missedSections || missedSections.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format the missed readings for the prompt
    const missedReadingsList = missedSections
      .map((section) => `Day ${section.dayNumber}: ${section.displayTitle}`)
      .join("\n");

    // Get the chapter references for context
    const allChapters = missedSections.flatMap((section) =>
      section.versesJson.map((ref) => {
        if (ref.startChapter === ref.endChapter) {
          return `${ref.book} ${ref.startChapter}`;
        }
        return `${ref.book} ${ref.startChapter}-${ref.endChapter}`;
      })
    );

    const uniqueChapters = [...new Set(allChapters)];
    const totalDaysMissed = missedSections.length;

    // =====================================================
    // L2 FIX — Fetch actual verse text from bible_verses
    // =====================================================
    // Previous implementation passed only chapter labels to GPT. GPT
    // fabricated the "summary" of content it had never seen (hallucination).
    // Now: for each missed section, pull the actual verses from the DB and
    // feed them into the prompt so GPT summarizes what the user actually
    // would have read.
    const translation = (preferredTranslation || "KJV").toUpperCase();

    // Cap total text to keep prompts bounded.
    const MAX_CHARS_PER_CHAPTER = 1500;
    const MAX_TOTAL_CHARS = 12000;
    let totalChars = 0;

    const chapterTexts: string[] = [];
    for (const section of missedSections) {
      for (const ref of section.versesJson) {
        if (totalChars >= MAX_TOTAL_CHARS) break;
        for (
          let chapter = ref.startChapter;
          chapter <= ref.endChapter;
          chapter++
        ) {
          if (totalChars >= MAX_TOTAL_CHARS) break;

          const { data: verses, error: versesErr } = await supabase
            .from("bible_verses")
            .select("verse, text")
            .eq("translation", translation)
            .eq("book", ref.book)
            .eq("chapter", chapter)
            .order("verse");

          if (versesErr || !verses || verses.length === 0) {
            // Fallback: if translation-specific lookup fails, try without
            // translation filter (some DB rows may use lowercased codes)
            const { data: fallback } = await supabase
              .from("bible_verses")
              .select("verse, text")
              .eq("book", ref.book)
              .eq("chapter", chapter)
              .order("verse")
              .limit(200);
            if (!fallback || fallback.length === 0) continue;
            const formatted = fallback
              .map((v: { verse: number; text: string }) => `${v.verse}. ${v.text}`)
              .join(" ")
              .slice(0, MAX_CHARS_PER_CHAPTER);
            chapterTexts.push(`${ref.book} ${chapter}: ${formatted}`);
            totalChars += formatted.length;
            continue;
          }

          const formatted = verses
            .map((v: { verse: number; text: string }) => `${v.verse}. ${v.text}`)
            .join(" ")
            .slice(0, MAX_CHARS_PER_CHAPTER);
          chapterTexts.push(`${ref.book} ${chapter}: ${formatted}`);
          totalChars += formatted.length;
        }
      }
    }

    const scriptureContext = chapterTexts.length > 0
      ? chapterTexts.join("\n\n")
      : "(scripture text unavailable; summarize from chapter labels only)";

    // Build the system prompt for grace-filled summarization
    const systemPrompt = `You are an encouraging spiritual mentor. A user has missed ${totalDaysMissed} days of their Bible reading plan. Your goal is to provide a "Grace Path" summary that helps them catch up quickly while feeling encouraged rather than guilty.

The user missed these readings:
${missedReadingsList}

ACTUAL SCRIPTURE TEXT FROM THE MISSED CHAPTERS (summarize from THIS, not from memory):

${scriptureContext}

Please provide a summary in this structure:

1. **The Story So Far** (1-2 paragraphs)
   Summarize the actual narrative from the text above. Mention specific people, events, and places that appear in the provided scripture. Do NOT invent content that isn't in the text.

2. **God's Character Revealed** (1 paragraph)
   Highlight one or two aspects of God's character that emerge from the actual text above.

3. **A Word for Your Journey** (1 paragraph)
   Offer an encouraging closing thought. Remind them that God's grace covers their journey, including the days they missed.

RULES:
- Only reference content that appears in the scripture above.
- Do not invent verses, people, or events not in the text.
- Warm, encouraging, pastoral tone. No guilt language.
- About 300-400 words total.`;

    // Generate the summary
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please provide the Grace Path summary for my missed readings." },
      ],
      temperature: 0.4, // lowered from 0.7 for fidelity to source text
      max_tokens: 800,
      user: "grace-path", // privacy pillar 3
    });

    const summary = completion.choices[0]?.message?.content || "";

    if (!summary) {
      throw new Error("Failed to generate summary");
    }

    // Log the grace path usage for analytics (optional)
    await supabase.from("skipped_sessions").update({
      ai_summary: summary,
      resolution_type: "grace_summary",
      resolved_at: new Date().toISOString(),
    }).eq("progress_id", progressId).eq("resolution_type", "pending");

    // Return the summary
    return new Response(
      JSON.stringify({
        success: true,
        summary,
        daysCovered: totalDaysMissed,
        chaptersCovered: uniqueChapters,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Grace Path error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate summary",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/grace-path-summary' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{
      "userId": "user-uuid",
      "progressId": "progress-uuid",
      "missedSections": [
        {
          "dayNumber": 5,
          "displayTitle": "Genesis 13-15",
          "versesJson": [{"book": "Genesis", "startChapter": 13, "endChapter": 15}]
        },
        {
          "dayNumber": 6,
          "displayTitle": "Genesis 16-18",
          "versesJson": [{"book": "Genesis", "startChapter": 16, "endChapter": 18}]
        }
      ]
    }'

*/
