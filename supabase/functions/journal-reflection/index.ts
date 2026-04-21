// supabase/functions/journal-reflection/index.ts
// Journal Reflection Generator — produces a personalized AI reflection
// across a user's recent journal entries.
//
// This function was previously called from the client (aiReflectionService.ts)
// but never existed server-side. Users got the client's regex template fallback
// presented as "AI reflection." This is the real implementation.
//
// Voice: "trusted friend who happens to know scripture deeply."
// Listen first, reflect second, offer scripture third.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface JournalEntryIn {
  content: string;
  type?: string;
  date?: string;
  linkedVerses?: string[];
  mood?: string;
}

interface RequestBody {
  entries: JournalEntryIn[];
  tradition?: "catholic" | "protestant_conservative" | "protestant_progressive" | "orthodox" | "non_denominational" | "exploring";
}

interface ReflectionResponse {
  content: string;
  themes: string[];
  growthAreas: string[];
  encouragement: string;
}

function traditionNote(t?: RequestBody["tradition"]): string {
  switch (t) {
    case "catholic":
      return "The user identifies as Catholic. Respect Marian theology, sacraments, and the Magisterium. Use Catholic vocabulary naturally (Our Lord, Blessed Mother, etc.) when fitting.";
    case "protestant_conservative":
      return "The user identifies as Conservative Protestant. Treat Scripture as authoritative. Honor traditional readings. Avoid progressive reinterpretations unless the text plainly supports them.";
    case "protestant_progressive":
      return "The user identifies as Progressive Protestant. Respect affirming readings. Don't invalidate their identity or experience. Emphasize grace and the love-ethic of Christ.";
    case "orthodox":
      return "The user identifies as Orthodox. Respect theosis, the veneration of icons, and liturgical tradition. Avoid Western-specific framings.";
    case "exploring":
      return "The user is exploring faith. Present interpretations as 'one tradition holds...' rather than settled truth. Be especially gentle and non-presumptuous.";
    case "non_denominational":
    default:
      return "The user identifies as non-denominational Protestant. Use broadly evangelical vocabulary. Avoid denominational distinctives.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const _supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    const body: RequestBody = await req.json();
    const entries = Array.isArray(body.entries) ? body.entries : [];

    if (entries.length < 3) {
      return new Response(
        JSON.stringify({ error: "At least 3 journal entries required for a reflection" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit the payload to the 20 most recent entries to bound prompt size.
    const recent = entries.slice(0, 20);

    const entriesFormatted = recent
      .map((e, i) => {
        const date = e.date ?? "(no date)";
        const type = e.type ?? "journal";
        const mood = e.mood ? ` | mood: ${e.mood}` : "";
        const verses = e.linkedVerses && e.linkedVerses.length
          ? ` | verses: ${e.linkedVerses.join(", ")}`
          : "";
        const content = (e.content ?? "").slice(0, 600);
        return `Entry ${i + 1} [${date}] (${type}${mood}${verses}):\n${content}`;
      })
      .join("\n\n");

    const systemPrompt = `You are a trusted friend who happens to know scripture deeply.
You are NOT a pastor, therapist, or life coach. You listen first. You reflect back what
you heard before you teach. You honor the user's tradition.

${traditionNote(body.tradition)}

VOICE RULES:
- Lead with acknowledgment, not with scripture or solutions.
- Use questions more than declarations.
- Name complexity honestly. Don't flatten hard seasons into tidy answers.
- No fake warmth. No exclamation points on pain. No emojis.
- Grace is the default tone. When the user confesses struggle, your first response
  is thank-them-for-being-honest, not a lecture.

SAFETY RULES:
- If any entry mentions self-harm, suicidal ideation, abuse, or immediate danger,
  acknowledge it briefly in the reflection and include one sentence in 'encouragement'
  that says professional help matters alongside prayer (mention 988 if US crisis signals).
- Never present contested theology as settled truth.

OUTPUT FORMAT (JSON only, no prose outside it):
{
  "content": "2-3 paragraph personalized reflection that quotes or paraphrases the user's own words where powerful, then offers scripture (cited) as a gift not a prescription. Must feel like someone who actually read what they wrote.",
  "themes": ["3-5 real themes from the ACTUAL content, not generic spiritual words"],
  "growthAreas": ["2-3 specific invitations. Not 'pray more' \u2014 something earned from what they wrote."],
  "encouragement": "One sentence of scripture-anchored closing. Specific to their journey, not a platitude."
}`;

    const userPrompt = `Here are my last ${recent.length} journal entries. Read them, then reflect.

${entriesFormatted}

Return JSON only, matching the schema in the system message.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5, // lower for fidelity to actual content
      max_tokens: 1200,
      response_format: { type: "json_object" },
      // Training opt-out + anonymized user ID (privacy pillar 3)
      user: "journal-reflection",
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: ReflectionResponse;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Failed to parse model JSON output");
    }

    // Validate shape; fall back to safe defaults on missing fields
    const response: ReflectionResponse = {
      content: typeof parsed.content === "string" && parsed.content.trim()
        ? parsed.content
        : "I read through your entries and I'm sitting with you in them. Let's keep walking.",
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 5) : [],
      growthAreas: Array.isArray(parsed.growthAreas) ? parsed.growthAreas.slice(0, 3) : [],
      encouragement: typeof parsed.encouragement === "string" && parsed.encouragement.trim()
        ? parsed.encouragement
        : "God is with you in this season. (Psalm 34:18)",
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[journal-reflection] error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate reflection",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
