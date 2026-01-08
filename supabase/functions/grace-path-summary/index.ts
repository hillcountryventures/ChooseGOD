// supabase/functions/grace-path-summary/index.ts
// Grace Path Summary Generator - The "hand-hold" for missed readings
//
// This function generates an encouraging, spiritually-rich summary of
// chapters a user has missed, allowing them to catch up without guilt.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { userId, progressId, missedSections, preferredTranslation = "KJV" }: GracePathRequest = await req.json();

    if (!userId || !progressId || !missedSections || missedSections.length === 0) {
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

    // Build the system prompt for grace-filled summarization
    const systemPrompt = `You are an encouraging spiritual mentor and Bible scholar. A user has missed ${totalDaysMissed} days of their Bible reading plan. Your goal is to provide a "Grace Path" summary that helps them catch up quickly while feeling encouraged rather than guilty.

The user missed these readings:
${missedReadingsList}

Covering these chapters: ${uniqueChapters.join(", ")}

Please provide a summary in this structure:

1. **The Story So Far** (1-2 paragraphs)
   Summarize the main narrative arc and key events. Focus on what happened, who was involved, and the progression of events.

2. **God's Character Revealed** (1 paragraph)
   Highlight one or two aspects of God's character that shine through these chapters. What do we learn about who God is?

3. **A Word for Your Journey** (1 paragraph)
   Offer an encouraging closing thought that applies these truths to the reader's life today. Remind them that God's grace covers their journey, including the days they missed.

Keep your tone warm, encouraging, and pastoral. Avoid any language that could induce guilt. This is about grace and moving forward together.

The summary should be concise but spiritually nourishing - aim for about 300-400 words total.`;

    // Generate the summary
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective for summaries
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please provide the Grace Path summary for my missed readings." },
      ],
      temperature: 0.7,
      max_tokens: 800,
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
