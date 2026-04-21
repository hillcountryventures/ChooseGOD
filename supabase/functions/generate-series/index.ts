// supabase/functions/generate-series/index.ts
// Series Generator (Pro conversion hook) \u2014 composes a personalized devotional
// series from the ChooseGOD content corpus:
//   - 14-translation Bible with embeddings
//   - Strong's Concordance (Hebrew/Greek lexicon)
//   - Cross-references DB
//   - AI composition layer (OpenAI)
//
// Per Decision #9 Part 1 + Part 3. This is the premium moat: a user asks
// for "a 7-day series on rebuilding after divorce" and gets a theologically
// grounded, tradition-aware, scripture-anchored series that would have
// taken a pastor 8+ hours to write by hand.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  userId: string;
  topic: string;
  durationDays?: number; // default 7, max 30
  maturityLevel?: "new_believer" | "growing" | "mature";
  tradition?: string;
}

interface GeneratedDay {
  dayNumber: number;
  title: string;
  scripture: {
    book: string;
    chapter: number;
    verseStart: number;
    verseEnd?: number;
    text: string;
  };
  reflection: string;
  strongsInsight?: string; // optional Hebrew/Greek word study
  reflectionQuestions: string[];
  prayerFocus: string;
}

const MAX_DAYS = 30;
const DEFAULT_DAYS = 7;

function traditionNote(t?: string): string {
  switch (t) {
    case "catholic":
      return "User is Catholic \u2014 respect sacraments, Marian theology, the Magisterium.";
    case "protestant_conservative":
      return "User is Conservative Protestant \u2014 honor Scripture as authoritative.";
    case "protestant_progressive":
      return "User is Progressive Protestant \u2014 respect affirming readings, emphasize love-ethic.";
    case "orthodox":
      return "User is Orthodox \u2014 respect theosis, icons, liturgical tradition.";
    case "exploring":
      return "User is exploring \u2014 present multiple traditions; honor doubt.";
    default:
      return "User is non-denominational Protestant \u2014 use broadly evangelical vocabulary.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    const body: GenerateRequest = await req.json();
    const { userId, topic } = body;
    const durationDays = Math.min(body.durationDays ?? DEFAULT_DAYS, MAX_DAYS);
    const maturityLevel = body.maturityLevel ?? "growing";

    if (!userId || !topic) {
      return new Response(
        JSON.stringify({ error: "userId and topic required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Premium gate \u2014 personalized series generation is a Pro conversion hook.
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("is_active, expiration_date")
      .eq("user_id", userId)
      .maybeSingle();

    const isPremium = !!(
      subscription &&
      (subscription.is_active ||
        (subscription.expiration_date &&
          new Date(subscription.expiration_date) > new Date()))
    );

    if (!isPremium) {
      return new Response(
        JSON.stringify({
          error: "Pro feature",
          code: "PRO_REQUIRED",
          message: "Personalized series generation is a ChooseGOD Pro feature.",
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ask the LLM to plan the series first: one-line title + scripture anchor
    // per day. We later fetch real verse text for each anchor and expand day
    // content from primary sources.
    const planPrompt = `You are designing a ${durationDays}-day devotional series for a user whose maturity is "${maturityLevel}".

${traditionNote(body.tradition)}

Topic: "${topic}"

Return JSON with this exact shape:
{
  "seriesTitle": "title for the series (5-8 words)",
  "days": [
    {
      "dayNumber": 1,
      "title": "day title (3-6 words)",
      "scripture": { "book": "e.g. Psalms", "chapter": 34, "verseStart": 18, "verseEnd": 19 }
    }
  ]
}

Rules:
- Choose scripture references that actually say something about the topic.
- Vary books: no more than 2 days from the same book.
- Pace the arc: open gently, build, end with hope.
- Only return JSON. No commentary.`;

    const planCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      user: "series-generator-plan",
      messages: [
        { role: "system", content: "You output only valid JSON matching the requested schema." },
        { role: "user", content: planPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const plan = JSON.parse(planCompletion.choices[0]?.message?.content ?? "{}");
    if (!plan.days || !Array.isArray(plan.days)) {
      throw new Error("Planner returned malformed response");
    }

    // Fetch actual verse text from bible_verses (Decision: never hallucinate scripture)
    const days: GeneratedDay[] = [];
    for (const planDay of plan.days.slice(0, durationDays)) {
      const { book, chapter, verseStart, verseEnd } = planDay.scripture ?? {};
      if (!book || !chapter || !verseStart) continue;

      let query = supabase
        .from("bible_verses")
        .select("verse, text")
        .eq("translation", "NIV")
        .eq("book", book)
        .eq("chapter", chapter)
        .gte("verse", verseStart);
      if (verseEnd) query = query.lte("verse", verseEnd);
      else query = query.eq("verse", verseStart);

      const { data: verses } = await query.order("verse");
      const verseText = (verses ?? [])
        .map((v: { verse: number; text: string }) => `${v.verse}. ${v.text}`)
        .join(" ");

      if (!verseText) continue;

      // Expand this day: reflection + optional Strong's insight + questions + prayer
      const expandPrompt = `Write a short devotional day for: "${planDay.title}".

Scripture (already fetched, use verbatim):
${book} ${chapter}:${verseStart}${verseEnd ? `-${verseEnd}` : ''} \u2014 "${verseText}"

${traditionNote(body.tradition)}
Maturity: ${maturityLevel}. Topic: "${topic}".

Return JSON:
{
  "reflection": "2-3 paragraph personal reflection grounded in the actual scripture. ~200 words.",
  "strongsInsight": "OPTIONAL \u2014 one Hebrew or Greek word from this passage with its original meaning. ~2 sentences. Empty string if none fits.",
  "reflectionQuestions": ["3 questions inviting personal application"],
  "prayerFocus": "1-2 sentence prayer prompt."
}

Do not invent verses. Only use the supplied scripture.`;

      const expandCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        user: "series-generator-expand",
        messages: [
          { role: "system", content: "You output only valid JSON. Never invent scripture." },
          { role: "user", content: expandPrompt },
        ],
        temperature: 0.55,
        max_tokens: 900,
        response_format: { type: "json_object" },
      });

      const dayPayload = JSON.parse(expandCompletion.choices[0]?.message?.content ?? "{}");
      days.push({
        dayNumber: planDay.dayNumber ?? days.length + 1,
        title: planDay.title ?? "Day",
        scripture: {
          book,
          chapter,
          verseStart,
          verseEnd,
          text: verseText,
        },
        reflection: dayPayload.reflection ?? "",
        strongsInsight: dayPayload.strongsInsight || undefined,
        reflectionQuestions: Array.isArray(dayPayload.reflectionQuestions)
          ? dayPayload.reflectionQuestions.slice(0, 4)
          : [],
        prayerFocus: dayPayload.prayerFocus ?? "",
      });
    }

    return new Response(
      JSON.stringify({
        seriesTitle: plan.seriesTitle ?? `A ${durationDays}-day walk on ${topic}`,
        topic,
        durationDays: days.length,
        days,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-series] error", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate series",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
