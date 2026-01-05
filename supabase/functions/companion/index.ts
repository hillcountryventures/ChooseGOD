// supabase/functions/companion/index.ts
// Unified Spiritual Companion - The heart of ChooseGOD

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Chat mode types
type ChatMode =
  | "auto"
  | "devotional"
  | "prayer"
  | "journal"
  | "lectio"
  | "examen"
  | "memory"
  | "confession"
  | "gratitude"
  | "celebration";

// User context gathered from database
interface UserContext {
  preferredTranslation: string;
  maturityLevel: string;
  recentThemes: string[];
  recentStruggles: string[];
  activePrayers: Array<{ id: string; request: string; created_at: string }>;
  versesDueForReview: Array<{
    id: string;
    book: string;
    chapter: number;
    verse_start: number;
    text: string;
  }>;
  pendingObedienceSteps: Array<{ id: string; commitment: string }>;
  currentSeason?: string;
  onboardingResponses?: {
    lifeAreaFocus?: string;
    timeAvailable?: string;
    experienceLevel?: string;
    lifeStage?: string;
  };
}

// Devotional-specific context from the client
interface DevotionalContext {
  seriesTitle?: string;
  dayNumber?: number;
  scriptureRefs?: Array<{
    book: string;
    chapter: number;
    verseStart: number;
    verseEnd?: number;
  }>;
  reflectionQuestions?: string[];
  prayerFocus?: string;
}

// Tool definitions for the LLM
const spiritualTools = [
  {
    type: "function" as const,
    function: {
      name: "save_journal_entry",
      description:
        "Save a journal reflection from the user. Use when user shares personal reflections, feelings, or spiritual insights.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The journal entry content",
          },
          themes: {
            type: "array",
            items: { type: "string" },
            description:
              "Themes extracted from the entry (e.g., trust, anxiety, gratitude)",
          },
          linked_verses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                book: { type: "string" },
                chapter: { type: "number" },
                verse: { type: "number" },
              },
            },
            description: "Scripture references related to this entry",
          },
        },
        required: ["content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_prayer_request",
      description:
        "Create a new prayer request. Use when user expresses a need or desire they want to pray about.",
      parameters: {
        type: "object",
        properties: {
          request: {
            type: "string",
            description: "The prayer request",
          },
          scripture_anchor: {
            type: "object",
            properties: {
              book: { type: "string" },
              chapter: { type: "number" },
              verse: { type: "number" },
              text: { type: "string" },
            },
            description: "A relevant scripture promise to stand on",
          },
        },
        required: ["request"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "mark_prayer_answered",
      description:
        "Mark a prayer as answered when user reports God has answered. Triggers celebration!",
      parameters: {
        type: "object",
        properties: {
          prayer_id: {
            type: "string",
            description: "The ID of the answered prayer",
          },
          reflection: {
            type: "string",
            description: "User's reflection on how the prayer was answered",
          },
        },
        required: ["prayer_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_obedience_step",
      description:
        "Create an actionable commitment when user expresses conviction or desire to change/act.",
      parameters: {
        type: "object",
        properties: {
          commitment: {
            type: "string",
            description: "The specific action or commitment",
          },
          due_date: {
            type: "string",
            description: "Optional deadline (ISO date string)",
          },
          source_verse: {
            type: "object",
            properties: {
              book: { type: "string" },
              chapter: { type: "number" },
              verse: { type: "number" },
            },
            description: "Scripture that prompted this commitment",
          },
        },
        required: ["commitment"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "log_gratitude",
      description:
        "Record something the user is thankful for. Use when user expresses gratitude or blessing.",
      parameters: {
        type: "object",
        properties: {
          blessing: {
            type: "string",
            description: "What the user is grateful for",
          },
          related_theme: {
            type: "string",
            description: "Theme category (provision, relationships, health, etc.)",
          },
        },
        required: ["blessing"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "trigger_celebration",
      description:
        "Trigger a celebration animation in the UI for special moments.",
      parameters: {
        type: "object",
        properties: {
          celebration_type: {
            type: "string",
            enum: [
              "answered_prayer",
              "memory_milestone",
              "growth_insight",
              "obedience_completed",
            ],
            description: "Type of celebration",
          },
          message: {
            type: "string",
            description: "Celebration message to display",
          },
        },
        required: ["celebration_type", "message"],
      },
    },
  },
];

// Build the system prompt based on context and mode
function buildSystemPrompt(
  context: UserContext,
  mode: ChatMode,
  relevantVerses: string,
  devotionalContext?: DevotionalContext
): string {
  const basePrompt = `You are a faithful, warm, and wise Bible study companion. You speak with the tenderness of a loving shepherd and the wisdom of a seasoned pastor. Your role is to help users encounter God through His Word—never speaking as God, but always pointing to Him.

## Your Core Identity
- You are NOT God. You never say "I forgive you" or speak as if you are divine.
- You ARE a knowledgeable, Spirit-led guide who knows Scripture deeply.
- You celebrate with genuine joy when users experience God's faithfulness.
- You gently probe the heart without shame or condemnation.
- You always ground responses in actual Scripture, citing chapter and verse.

## User Context (personalize responses based on this)
- Preferred Translation: ${context.preferredTranslation.toUpperCase()}
- Spiritual Maturity: ${context.maturityLevel}
- Recent Themes in Their Journey: ${context.recentThemes.join(", ") || "Still learning about them"}
- Recent Struggles: ${context.recentStruggles.join(", ") || "None shared yet"}
- Active Prayer Requests: ${context.activePrayers?.length || 0} ongoing
- Verses Due for Review: ${context.versesDueForReview?.map((v) => `${v.book} ${v.chapter}:${v.verse_start}`).join(", ") || "None"}
- Pending Obedience Steps: ${context.pendingObedienceSteps?.map((s) => s.commitment).join("; ") || "None"}
${context.currentSeason ? `- Currently Observing: ${context.currentSeason}` : ""}

## Relevant Scripture for This Conversation
${relevantVerses}

## Response Style
- Warm but not saccharine
- Deep but accessible
- Brief when appropriate, thorough when needed
- Always end with an invitation to continue or a gentle question
- Match their emotional register (celebratory with celebration, gentle with grief)

## Tool Usage
IMPORTANT: Actively use the provided tools to save meaningful moments:
- When they share a reflection or feeling → use save_journal_entry
- When they express a need to pray about → use create_prayer_request
- When they report answered prayer → use mark_prayer_answered AND trigger_celebration
- When they express conviction/commitment → use create_obedience_step
- When they express gratitude → use log_gratitude

Remember: You're helping them encounter the Living God through His Word. Every interaction should leave them closer to Him.`;

  // Build devotional-specific context string
  let devotionalContextString = "";
  if (devotionalContext && mode === "devotional") {
    devotionalContextString = `
## Current Devotional Series Context
- Series: ${devotionalContext.seriesTitle || "General Devotional"}
- Day: ${devotionalContext.dayNumber || "N/A"}
${devotionalContext.scriptureRefs?.length ? `- Today's Scripture: ${devotionalContext.scriptureRefs.map(ref =>
  `${ref.book} ${ref.chapter}:${ref.verseStart}${ref.verseEnd && ref.verseEnd !== ref.verseStart ? `-${ref.verseEnd}` : ""}`
).join(", ")}` : ""}
${devotionalContext.reflectionQuestions?.length ? `- Reflection Questions for Today: ${devotionalContext.reflectionQuestions.join("; ")}` : ""}
${devotionalContext.prayerFocus ? `- Prayer Focus: ${devotionalContext.prayerFocus}` : ""}

## User's Spiritual Background (from onboarding)
${context.onboardingResponses?.lifeAreaFocus ? `- Primary Growth Area: ${context.onboardingResponses.lifeAreaFocus}` : ""}
${context.onboardingResponses?.experienceLevel ? `- Faith Journey Stage: ${context.onboardingResponses.experienceLevel}` : ""}
${context.onboardingResponses?.lifeStage ? `- Life Stage: ${context.onboardingResponses.lifeStage}` : ""}
${context.onboardingResponses?.timeAvailable ? `- Time Available: ${context.onboardingResponses.timeAvailable}` : ""}
`;
  }

  // Add mode-specific instructions
  const modeInstructions: Record<string, string> = {
    devotional: `
### Devotional Mode - Active Now
${devotionalContextString}

You are generating a personalized devotional reflection for the user. Your task:

1. **Open with warmth**: Greet them gently, acknowledging where they are in their journey (Day ${devotionalContext?.dayNumber || "X"} of "${devotionalContext?.seriesTitle || "their devotional"}").

2. **Engage the Scripture**: Based on the scripture references provided, write a thoughtful 2-3 paragraph reflection that:
   - Explains the context and meaning of the passage
   - Connects it to the series theme
   - Makes it personal and applicable to their life situation
   - Consider their spiritual maturity level and life stage

3. **Personalize the application**: Tailor insights based on:
   - Their primary growth area (${context.onboardingResponses?.lifeAreaFocus || "general spiritual growth"})
   - Their life stage (${context.onboardingResponses?.lifeStage || "various"})
   - Their experience level (${context.onboardingResponses?.experienceLevel || "growing"})

4. **Inspire action**: End with an encouraging word that invites them to carry this truth through their day.

5. **Keep it focused**: If their time is limited (${context.onboardingResponses?.timeAvailable || "moderate"}), be concise but impactful.

Do NOT include the reflection questions or prayer focus in your response—those are displayed separately in the UI.
Write in second person ("you") and maintain a warm, pastoral tone throughout.`,

    prayer: `
### Prayer Companion Mode - Active Now
- Mirror their prayer language with empathy
- Suggest Scripture-based ways to pray (ACTS: Adoration, Confession, Thanksgiving, Supplication)
- Offer biblical promises that apply to their situation
- If they're struggling to pray, gently guide them into words
- Use create_prayer_request to save their prayer needs
- NEVER pray "as God" or give prophetic utterances`,

    lectio: `
### Lectio Divina Mode - Active Now
Guide through four movements with pauses:
1. **Lectio (Read)**: Present the passage slowly, invite them to notice words that stand out
2. **Meditatio (Meditate)**: Ask what the Spirit might be highlighting, why this word/phrase
3. **Oratio (Pray)**: Invite them to respond to God from what arose
4. **Contemplatio (Contemplate)**: Rest in God's presence, no words needed

Use gentle transitions like "Take a moment..." and "When you're ready..."
Save their insights using save_journal_entry`,

    examen: `
### Evening Examen Mode - Active Now
Guide through Ignatian reflection:
1. "Where did you sense God's presence today?"
2. "What brought you life or joy?"
3. "Where did you feel resistance, distance, or struggle?"
4. "Is there anything to confess or release to Him?"
5. Close with assurance of grace and rest

Keep it warm, never clinical. This is a bedtime conversation with a loving Father.
Use save_journal_entry to record their reflections
Use log_gratitude for things they're thankful for`,

    confession: `
### Confession/Heart-Check Mode - Active Now
- Use Psalm 139:23-24 or Psalm 51 as guides
- Ask gentle, specific questions without shaming
- When they confess, immediately point to gospel assurance (1 John 1:9, Romans 8:1)
- Help them articulate what went wrong and why, fostering self-awareness
- If appropriate, suggest a restorative action → use create_obedience_step
- NEVER leave them in guilt—always end in grace
- Save their confession/reflection with save_journal_entry`,

    memory: `
### Scripture Memory Mode - Active Now
- Create memorable mnemonics using first letters or visual associations
- Turn verses into mini-stories or dialogues
- Quiz them with fill-in-the-blank or first-letter prompts
- Celebrate progress warmly → use trigger_celebration for milestones
- Connect the verse to their current life situation`,

    gratitude: `
### Gratitude Mode - Active Now
- Help them recognize God's blessings
- Ask probing questions to uncover hidden gratitude
- Connect blessings to God's character and promises
- Use log_gratitude to save each blessing they mention
- Encourage specific, not generic, gratitude`,

    celebration: `
### Celebration Mode - Active Now
- Express genuine joy with them!
- Help them articulate how God worked
- Connect the answer to Scripture promises
- Use mark_prayer_answered if they're celebrating an answered prayer
- Use trigger_celebration to create a celebratory moment
- Encourage them to share their testimony`,

    journal: `
### Journal Mode - Active Now
- Be a gentle listener
- Ask clarifying questions to help them process
- Reflect back what you're hearing
- Connect their experiences to Scripture where natural
- Use save_journal_entry to save their reflections
- Don't force spiritual applications—let them emerge naturally`,
  };

  if (mode !== "auto" && modeInstructions[mode]) {
    return basePrompt + "\n" + modeInstructions[mode];
  }

  return (
    basePrompt +
    `

### Auto Mode - Active Now
Detect the user's spiritual intent and respond appropriately:
- Question about Scripture → Answer with citations
- Prayer language or need → Enter prayer companion mode
- Reflective/journaling language → Enter journal mode
- Expressing gratitude → Use log_gratitude and celebrate with them
- Expressing struggle/confession → Be gentle, point to grace
- Reporting answered prayer → Celebrate! Use mark_prayer_answered
- Seeking guidance → Offer wisdom grounded in Scripture
- Expressing commitment → Use create_obedience_step

Always use the appropriate tools to save meaningful moments.`
  );
}

// Gather user context from database
async function gatherUserContext(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<UserContext> {
  const [profileResult, momentsResult, prayersResult, memoryResult, stepsResult, onboardingResult] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("spiritual_moments")
        .select("themes, moment_type, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("prayer_requests")
        .select("id, request, created_at")
        .eq("user_id", userId)
        .eq("status", "active")
        .limit(10),
      supabase
        .from("memory_verses")
        .select("id, book, chapter, verse_start, text")
        .eq("user_id", userId)
        .lte("next_review", new Date().toISOString())
        .limit(5),
      supabase
        .from("obedience_steps")
        .select("id, commitment")
        .eq("user_id", userId)
        .eq("completed", false)
        .limit(5),
      supabase
        .from("onboarding_responses")
        .select("life_area_focus, time_available, experience_level, life_stage")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  // Extract themes from recent moments
  const allThemes: string[] = [];
  const struggles: string[] = [];

  momentsResult.data?.forEach((m) => {
    if (m.themes) allThemes.push(...m.themes);
    if (m.moment_type === "confession" && m.content) {
      struggles.push(m.content.substring(0, 50));
    }
  });

  // Count theme frequency
  const themeCount: Record<string, number> = {};
  allThemes.forEach((t) => {
    themeCount[t] = (themeCount[t] || 0) + 1;
  });

  const recentThemes = Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  return {
    preferredTranslation: profileResult.data?.preferred_translation || "kjv",
    maturityLevel: profileResult.data?.maturity_level || "growing",
    recentThemes,
    recentStruggles: struggles.slice(0, 3),
    activePrayers: prayersResult.data || [],
    versesDueForReview: memoryResult.data || [],
    pendingObedienceSteps: stepsResult.data || [],
    currentSeason: profileResult.data?.current_rhythm,
    onboardingResponses: onboardingResult.data ? {
      lifeAreaFocus: onboardingResult.data.life_area_focus,
      timeAvailable: onboardingResult.data.time_available,
      experienceLevel: onboardingResult.data.experience_level,
      lifeStage: onboardingResult.data.life_stage,
    } : undefined,
  };
}

// Get relevant verses using vector similarity
async function getRelevantVerses(
  supabase: ReturnType<typeof createClient>,
  openai: OpenAI,
  message: string,
  translation: string
): Promise<string> {
  try {
    // Generate embedding for the message
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for similar verses
    const { data: verses } = await supabase.rpc("match_verses", {
      query_embedding: queryEmbedding,
      match_count: 8,
      filter_translation: translation.toLowerCase(),
      similarity_threshold: 0.35,
    });

    if (!verses || verses.length === 0) {
      return "No directly relevant verses found for this specific query.";
    }

    return verses
      .map(
        (v: { book: string; chapter: number; verse: number; text: string }) =>
          `${v.book} ${v.chapter}:${v.verse} (${translation.toUpperCase()}): "${v.text}"`
      )
      .join("\n\n");
  } catch (error) {
    console.error("Error getting relevant verses:", error);
    return "Error retrieving verses.";
  }
}

// Process tool calls from the LLM response
async function processToolCalls(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  toolCalls: Array<{
    id: string;
    function: { name: string; arguments: string };
  }>
): Promise<{
  toolsUsed: string[];
  celebration?: { type: string; message: string };
  savedData: Record<string, string>;
}> {
  const toolsUsed: string[] = [];
  let celebration: { type: string; message: string } | undefined;
  const savedData: Record<string, string> = {};

  for (const toolCall of toolCalls) {
    const name = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    toolsUsed.push(name);

    try {
      switch (name) {
        case "save_journal_entry": {
          const { data } = await supabase
            .from("spiritual_moments")
            .insert({
              user_id: userId,
              moment_type: "journal",
              content: args.content,
              themes: args.themes || [],
              linked_verses: args.linked_verses || [],
            })
            .select("id")
            .single();
          if (data) savedData.journalId = data.id;
          break;
        }

        case "create_prayer_request": {
          const { data } = await supabase
            .from("prayer_requests")
            .insert({
              user_id: userId,
              request: args.request,
              scripture_anchor: args.scripture_anchor,
              status: "active",
            })
            .select("id")
            .single();
          if (data) savedData.prayerId = data.id;
          break;
        }

        case "mark_prayer_answered": {
          await supabase
            .from("prayer_requests")
            .update({
              status: "answered",
              answered_at: new Date().toISOString(),
              answered_reflection: args.reflection,
            })
            .eq("id", args.prayer_id)
            .eq("user_id", userId);
          break;
        }

        case "create_obedience_step": {
          const { data } = await supabase
            .from("obedience_steps")
            .insert({
              user_id: userId,
              commitment: args.commitment,
              due_date: args.due_date,
            })
            .select("id")
            .single();
          if (data) savedData.obedienceId = data.id;
          break;
        }

        case "log_gratitude": {
          const { data } = await supabase
            .from("spiritual_moments")
            .insert({
              user_id: userId,
              moment_type: "gratitude",
              content: args.blessing,
              themes: args.related_theme ? [args.related_theme] : ["gratitude"],
            })
            .select("id")
            .single();
          if (data) savedData.gratitudeId = data.id;
          break;
        }

        case "trigger_celebration": {
          celebration = {
            type: args.celebration_type,
            message: args.message,
          };
          break;
        }
      }
    } catch (error) {
      console.error(`Error processing tool ${name}:`, error);
    }
  }

  return { toolsUsed, celebration, savedData };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      user_id,
      userId, // Alternative casing for compatibility
      message,
      conversation_history = [],
      conversationHistory = [], // Alternative casing for compatibility
      context_mode = "auto",
      contextMode, // Alternative casing for compatibility
      additionalContext,
    } = await req.json();

    // Normalize parameters (support both snake_case and camelCase)
    const normalizedUserId = user_id || userId;
    const normalizedHistory = conversation_history.length > 0 ? conversation_history : conversationHistory;
    const normalizedMode = context_mode !== "auto" ? context_mode : (contextMode || "auto");

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    // Gather user context (use default if no user_id)
    let userContext: UserContext;
    if (normalizedUserId) {
      userContext = await gatherUserContext(supabase, normalizedUserId);
    } else {
      userContext = {
        preferredTranslation: "kjv",
        maturityLevel: "growing",
        recentThemes: [],
        recentStruggles: [],
        activePrayers: [],
        versesDueForReview: [],
        pendingObedienceSteps: [],
      };
    }

    // Parse devotional context if provided
    const devotionalContext: DevotionalContext | undefined = additionalContext ? {
      seriesTitle: additionalContext.seriesTitle,
      dayNumber: additionalContext.dayNumber,
      scriptureRefs: additionalContext.scriptureRefs,
      reflectionQuestions: additionalContext.reflectionQuestions,
      prayerFocus: additionalContext.prayerFocus,
    } : undefined;

    // Get relevant verses via RAG
    const relevantVerses = await getRelevantVerses(
      supabase,
      openai,
      message,
      userContext.preferredTranslation
    );

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(
      userContext,
      normalizedMode as ChatMode,
      relevantVerses,
      devotionalContext
    );

    // Prepare messages for API
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...normalizedHistory.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Call OpenAI with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: spiritualTools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1200,
    });

    const assistantMessage = completion.choices[0].message;
    let responseText = assistantMessage.content || "";
    let toolsUsed: string[] = [];
    let celebration: { type: string; message: string } | undefined;
    let savedData: Record<string, string> = {};

    // Process tool calls if any
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && normalizedUserId) {
      const toolResults = await processToolCalls(
        supabase,
        normalizedUserId,
        assistantMessage.tool_calls
      );
      toolsUsed = toolResults.toolsUsed;
      celebration = toolResults.celebration;
      savedData = toolResults.savedData;

      // If there's no text response but tools were called, generate a follow-up
      if (!responseText && toolsUsed.length > 0) {
        const followUp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            ...messages,
            {
              role: "assistant" as const,
              content: null,
              tool_calls: assistantMessage.tool_calls,
            },
            {
              role: "tool" as const,
              tool_call_id: assistantMessage.tool_calls[0].id,
              content: "Action completed successfully.",
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        });
        responseText = followUp.choices[0].message.content || "I've recorded that for you.";
      }
    }

    // Extract verse sources for the response
    const sourceMatches = relevantVerses.match(
      /(\w+)\s+(\d+):(\d+)\s+\([A-Z]+\):\s+"([^"]+)"/g
    );
    const sources =
      sourceMatches?.slice(0, 5).map((match) => {
        const parts = match.match(
          /(\w+)\s+(\d+):(\d+)\s+\(([A-Z]+)\):\s+"([^"]+)"/
        );
        if (parts) {
          return {
            book: parts[1],
            chapter: parseInt(parts[2]),
            verse: parseInt(parts[3]),
            translation: parts[4],
            text: parts[5],
          };
        }
        return null;
      }).filter(Boolean) || [];

    // Generate suggested follow-up actions based on mode
    const suggestedActions = getSuggestedActions(normalizedMode as ChatMode);

    return new Response(
      JSON.stringify({
        response: responseText,
        sources,
        toolsUsed,
        celebration,
        suggestedActions,
        savedData,
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
        error: "An error occurred. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getSuggestedActions(mode: ChatMode): Array<{ label: string; prompt: string }> {
  const actions: Record<string, Array<{ label: string; prompt: string }>> = {
    devotional: [
      { label: "Go deeper", prompt: "Tell me more about this passage" },
      { label: "Apply it", prompt: "How can I apply this today?" },
      { label: "Pray", prompt: "Help me pray about what I learned" },
    ],
    prayer: [
      { label: "Scripture to pray", prompt: "Give me a Scripture to pray" },
      { label: "ACTS prayer", prompt: "Guide me through ACTS prayer" },
      { label: "Intercede", prompt: "Help me pray for others" },
    ],
    examen: [
      { label: "Continue", prompt: "What's the next question?" },
      { label: "Go deeper", prompt: "I want to explore that more" },
      { label: "Confess", prompt: "I need to confess something" },
    ],
    lectio: [
      { label: "Next movement", prompt: "I'm ready for the next step" },
      { label: "Stay here", prompt: "I want to sit with this longer" },
      { label: "Share insight", prompt: "I noticed something..." },
    ],
    auto: [
      { label: "Devotional", prompt: "Give me a morning devotional" },
      { label: "Prayer help", prompt: "I want to pray about something" },
      { label: "Ask question", prompt: "I have a question about Scripture" },
    ],
  };

  return actions[mode] || actions.auto;
}
