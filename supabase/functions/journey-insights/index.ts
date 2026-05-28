// supabase/functions/journey-insights/index.ts
// Real AI Journey Insights — replaces the rule-based regex string-matching
// that was previously presented to users as "AI-powered" insights.
//
// Behavior:
// - Pulls the user's last 30 days of spiritual_moments, prayer_requests,
//   verse_highlights, and chat_interactions.
// - Asks OpenAI for: recurring themes, sentiment arc, one specific growth
//   observation, one gentle growth opportunity.
// - Caches per-user for 7 days in user_insights table so we don't pay for
//   a fresh call on every Journey tab open.
// - Honors tradition context per Decision #13.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4";
import { requireAuthedUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Tradition =
  | "catholic"
  | "protestant_conservative"
  | "protestant_progressive"
  | "orthodox"
  | "non_denominational"
  | "exploring";

interface RequestBody {
  userId: string;
  tradition?: Tradition;
  force?: boolean; // bypass cache
}

interface AIInsight {
  themes: Array<{ label: string; summary: string }>;
  sentimentArc: string;
  growthObservation: string;
  growthOpportunity: string;
  suggestedVerse?: string;
  generatedAt: string;
}

const CACHE_TTL_DAYS = 7;

function traditionNote(t?: Tradition): string {
  switch (t) {
    case "catholic":
      return "User is Catholic. Honor Marian / sacramental / Magisterial framing naturally.";
    case "protestant_conservative":
      return "User is Conservative Protestant. Honor Scripture authority and traditional readings.";
    case "protestant_progressive":
      return "User is Progressive Protestant. Honor affirming readings and social love-ethic.";
    case "orthodox":
      return "User is Orthodox. Honor theosis, icons, liturgy; avoid Western-specific framings.";
    case "exploring":
      return "User is exploring. Present traditions as 'one tradition holds...' not settled truth.";
    case "non_denominational":
    default:
      return "User is non-denominational. Use broadly evangelical vocabulary.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    // Identity comes from the verified JWT, never the request body. Reading a
    // body `userId` here over the service-role client was an IDOR (any caller
    // could read/overwrite any user's journal, prayers, highlights, insights).
    const auth = await requireAuthedUser(req, corsHeaders);
    if (auth instanceof Response) return auth;
    const { userId, admin: supabase } = auth;

    const openai = new OpenAI({ apiKey: openaiKey });

    const body: RequestBody = await req.json().catch(() => ({} as RequestBody));
    const { tradition, force } = body;

    // ---- Cache lookup ----
    if (!force) {
      const { data: cached } = await supabase
        .from("user_insights")
        .select("payload, generated_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (cached?.generated_at) {
        const ageMs = Date.now() - new Date(cached.generated_at).getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        if (ageDays < CACHE_TTL_DAYS) {
          return new Response(
            JSON.stringify({ insight: cached.payload, cached: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // ---- Gather signals (last 30 days) ----
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: moments },
      { data: prayers },
      { data: highlights },
      { data: chatCounts },
    ] = await Promise.all([
      supabase
        .from("spiritual_moments")
        .select("content, moment_type, created_at, themes, linked_verses, sentiment_score")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true })
        .limit(100),
      supabase
        .from("prayer_requests")
        .select("request, status, created_at, answered_at, answered_reflection")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo),
      supabase
        .from("verse_highlights")
        .select("book, chapter, verse, color, created_at")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo)
        .limit(50),
      supabase
        .from("chat_interactions")
        .select("mode, created_at")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo)
        .limit(200),
    ]);

    const momentCount = moments?.length ?? 0;
    if (momentCount < 3) {
      const minimal: AIInsight = {
        themes: [],
        sentimentArc: "You're at the start of your journey with ChooseGOD. Keep going \u2014 the patterns emerge over a few weeks.",
        growthObservation: "Not enough data yet for a personalized observation. Write a few journal entries and I'll notice what emerges.",
        growthOpportunity: "Try one gratitude reflection today \u2014 it anchors the rest of the week.",
        generatedAt: new Date().toISOString(),
      };
      return new Response(
        JSON.stringify({ insight: minimal, cached: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- Build the analysis payload (bounded) ----
    const momentsFormatted = (moments ?? [])
      .slice(0, 40)
      .map((m, i) => {
        const date = String(m.created_at).slice(0, 10);
        const type = m.moment_type ?? "journal";
        const content = (m.content ?? "").slice(0, 400);
        const themes = Array.isArray(m.themes) && m.themes.length
          ? ` [themes: ${m.themes.join(", ")}]`
          : "";
        return `#${i + 1} [${date}] (${type})${themes}: ${content}`;
      })
      .join("\n");

    const activePrayers = (prayers ?? []).filter((p) => p.status === "active").length;
    const answeredPrayers = (prayers ?? []).filter((p) => p.status === "answered").length;

    const topHighlightColors = (() => {
      const tally: Record<string, number> = {};
      for (const h of highlights ?? []) {
        tally[h.color] = (tally[h.color] ?? 0) + 1;
      }
      return Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([c, n]) => `${c}:${n}`)
        .join(", ");
    })();

    const chatModeTally = (() => {
      const tally: Record<string, number> = {};
      for (const c of chatCounts ?? []) {
        tally[c.mode ?? "unknown"] = (tally[c.mode ?? "unknown"] ?? 0) + 1;
      }
      return Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([m, n]) => `${m}:${n}`)
        .join(", ");
    })();

    const systemPrompt = `You are a trusted friend who reads someone's spiritual journal for 30 days and notices what God seems to be doing in their life.

${traditionNote(tradition)}

VOICE:
- Specific, not generic. Reference their actual words where powerful.
- Honest. Name real patterns, both growth and struggle.
- Pastoral, not clinical. No "from the data we observed..."
- No platitudes. "Keep pressing on" is banned.
- No toxic positivity. Struggle is sacred too.

SAFETY:
- If entries show self-harm / suicidal ideation / abuse / active crisis, acknowledge
  gently in sentimentArc and include "988" or professional-help mention in
  growthOpportunity.

OUTPUT FORMAT (JSON only, exact shape):
{
  "themes": [
    { "label": "short theme name (2-4 words)", "summary": "1-2 sentence description of how this showed up in their entries" }
  ],  // 3-5 themes. Must emerge from actual content, not generic list.
  "sentimentArc": "2-3 sentences describing the emotional trajectory week-by-week. Use their actual patterns.",
  "growthObservation": "1 specific, non-generic observation about how they are growing. Must be earned from the data.",
  "growthOpportunity": "1 gentle invitation \u2014 never critique \u2014 phrased as 'what if you tried...' or 'I wonder if...'",
  "suggestedVerse": "OPTIONAL. One verse reference (e.g., 'Psalm 42:11') that speaks to their arc.",
  "generatedAt": "ISO timestamp"
}`;

    const userPrompt = `Here are this user's last 30 days.

Active prayers: ${activePrayers}
Answered prayers: ${answeredPrayers}
Top highlight colors: ${topHighlightColors || "none yet"}
Chat modes used: ${chatModeTally || "none yet"}

Spiritual moments (most recent 40):
${momentsFormatted}

Return JSON only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1400,
      response_format: { type: "json_object" },
      user: "journey-insights",
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: AIInsight;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Model returned invalid JSON");
    }

    const insight: AIInsight = {
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 5) : [],
      sentimentArc: typeof parsed.sentimentArc === "string" && parsed.sentimentArc.trim()
        ? parsed.sentimentArc
        : "Your journey is unfolding \u2014 keep going.",
      growthObservation: typeof parsed.growthObservation === "string" && parsed.growthObservation.trim()
        ? parsed.growthObservation
        : "You showed up. That's not small.",
      growthOpportunity: typeof parsed.growthOpportunity === "string" && parsed.growthOpportunity.trim()
        ? parsed.growthOpportunity
        : "What if you set aside 5 minutes today to notice where God showed up?",
      suggestedVerse: typeof parsed.suggestedVerse === "string" ? parsed.suggestedVerse : undefined,
      generatedAt: new Date().toISOString(),
    };

    // ---- Cache ----
    await supabase.from("user_insights").upsert(
      {
        user_id: userId,
        payload: insight,
        generated_at: insight.generatedAt,
      },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({ insight, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[journey-insights] error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate insights",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
