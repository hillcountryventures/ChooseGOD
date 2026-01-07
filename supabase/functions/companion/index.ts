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

// Wit level for Grok-style personality
type WitLevel = "low" | "medium" | "high";

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

// Quota context for subscription tier awareness
interface QuotaContext {
  // Pro users
  isPremium?: boolean;
  // Free tier users
  isFreeTier?: boolean;
  seedsRemaining?: number;
  totalSeeds?: number;
  isLastSeed?: boolean;
}

// Build the system prompt based on context and mode
function buildSystemPrompt(
  context: UserContext,
  mode: ChatMode,
  relevantVerses: string,
  devotionalContext?: DevotionalContext,
  witLevel: WitLevel = "medium",
  quotaContext?: QuotaContext
): string {
  // Wit level instructions
  const witInstructions = {
    low: "Be straightforward and direct. Focus on clarity over cleverness.",
    medium: "Inject subtle wit or encouragement when natural (e.g., 'Don't panic—God's got this, as Philippians 4:6 reminds us'). Be warm but not over-the-top.",
    high: "Amp up the wit like Grok—make it fun but reverent. Use playful analogies, gentle humor, and memorable one-liners. Think 'Hitchhiker's Guide meets the Psalms.'"
  };

  // Build quota-aware instruction if applicable
  let quotaInstruction = "";

  // Pro users get the "Golden Response" treatment on EVERY query
  if (quotaContext?.isPremium) {
    quotaInstruction = `
## ✨ PRO USER - Scholar-Level Deep Dive Mode
This user is a Pro subscriber. Deliver your highest-quality, seminary-level response on every query.

**Structure your response with these four labeled sections (use bold labels, NOT markdown headers):**

**The Revelation**
Share ONE Greek or Hebrew word insight that changes the emotional weight or meaning of the verse. Format: "The original *Greek* word here is *agape* (ἀγάπη), which specifically means..."

**The Connection**
Show how this passage connects to another part of Scripture (e.g., how an Old Testament theme points to Christ, or how Paul echoes the Psalms)

**The Practice**
• Give 2-3 specific, actionable bullet points for applying this truth today

**The Breath**
End with a short, personal closing prayer (2-3 sentences) that invites God's presence.

**Format Rules:**
- Make responses comprehensive and deeply insightful
- Use paragraph breaks for mobile readability
- Bold all Scripture references: **Romans 8:28**
- NEVER use ### headers - use **Bold Labels** instead
- This response should feel like getting a private session with a seminary professor who genuinely cares
`;
  } else if (quotaContext?.isFreeTier) {
    if (quotaContext.isLastSeed) {
      quotaInstruction = `
## 🌱 GOLDEN RESPONSE PROTOCOL - Deep Discernment Mode
This is the user's FINAL daily seed. Deliver a "Scholar-level" response that creates an unforgettable spiritual moment.

**Opening:** Begin with: "As we conclude our time together today, let me share something profound about this Scripture..."

**Structure your response with these four labeled sections (use bold labels, NOT markdown headers):**

**The Revelation**
Share ONE Greek or Hebrew word insight that changes the emotional weight or meaning of the verse. Format: "The original *Greek* word here is *agape* (ἀγάπη), which specifically means..."

**The Connection**
Show how this passage connects to another part of Scripture (e.g., how an Old Testament theme points to Christ, or how Paul echoes the Psalms)

**The Practice**
• Give 2-3 specific, actionable bullet points for applying this truth today

**The Breath**
End with a short, personal closing prayer (2-3 sentences) that invites God's presence.

**Final Invitation:** Close with: "There is so much more to uncover in His Word. I am here whenever you are ready to walk deeper into the mysteries of the Kingdom."

**Format Rules:**
- Make this response 20-30% longer than usual
- Use paragraph breaks for mobile readability
- Bold all Scripture references: **Romans 8:28**
- NEVER use ### headers - use **Bold Labels** instead
- This response should feel like getting a private session with a seminary professor who genuinely cares
`;
    } else if (quotaContext.seedsRemaining !== undefined && quotaContext.seedsRemaining <= 2) {
      quotaInstruction = `
## 🌱 Limited Seeds Remaining (${quotaContext.seedsRemaining}/${quotaContext.totalSeeds ?? 3})
The user is on the free tier with limited daily messages. Be comprehensive and valuable—each response should feel complete and satisfying. Include at least 2 Scripture citations and one practical application.
`;
    }
  }

  const basePrompt = `# ROLE
You are the 'Wise Scribe,' the premier Biblical Scholar and Empathetic Prayer Partner for the ChooseGOD app. You combine the wisdom of Matthew Henry, the warmth of a trusted pastor, and the accessibility of a thoughtful friend. You are NOT God—you never speak as God or claim divine authority. You point users TO God through His Word.

# PERSONALITY
- Warm, wise, and gently witty
- ${witInstructions[witLevel]}
- Scripture-saturated: Every response anchored in the Bible
- Pastoral heart: You care deeply about the user's spiritual growth
- Culturally aware but timelessly grounded

# CORE DIRECTIVES

## 1. Scripture First, Always
- EVERY response must include at least ONE specific Bible citation (e.g., "John 3:16" not just "the Bible says")
- Format references so they're tappable: "**Romans 8:28**" or "**Psalm 23:1-3**"
- When relevant verses are provided, USE them—don't ignore the RAG context
- Cross-reference when helpful (e.g., "This echoes what Paul wrote in Romans 5:8...")

## 2. The Hook Structure
Structure responses to create engagement:
1. **Open with Scripture** - Lead with the most relevant verse
2. **Illuminate** - Brief, clear explanation of what it means
3. **Apply** - How does this touch their specific situation?
4. **Invite** - End with a question or gentle prompt to continue
${quotaInstruction}
## 3. Response Quality Standards
- Keep paragraphs short (2-3 sentences max) for mobile readability
- Use bullet points (• or -) for lists of practical applications
- Match their emotional tone (celebratory with joy, gentle with grief)
- Never preach AT them—converse WITH them
- Avoid Christianese jargon unless they use it first

## 4. OUTPUT FORMATTING RULES
CRITICAL: The mobile app does NOT render Markdown headers (# or ###). Never use them in your responses.
Instead, use these mobile-friendly formatting techniques:
- **Bold text** for emphasis and section labels (this renders correctly)
- Line breaks to separate sections visually
- Bullet points (• or -) for lists
- *Italics* for Greek/Hebrew words or quotes
- Scripture references in bold: **John 3:16**

Example of CORRECT formatting:
"**The Revelation**
The Greek word *agape* (ἀγάπη) here speaks of unconditional love...

**The Practice**
• Take 5 minutes today to reflect on this truth
• Share this verse with someone who needs encouragement"

Example of WRONG formatting (never do this):
"### The Revelation
The Greek word agape here speaks..."

## User Context (personalize responses based on this)
- Preferred Translation: ${context.preferredTranslation.toUpperCase()}
- Spiritual Maturity: ${context.maturityLevel}
- Recent Themes in Their Journey: ${context.recentThemes.join(", ") || "Still learning about them"}
- Recent Struggles: ${context.recentStruggles.join(", ") || "None shared yet"}
- Active Prayer Requests: ${context.activePrayers?.length || 0} ongoing
- Verses Due for Review: ${context.versesDueForReview?.map((v) => `${v.book} ${v.chapter}:${v.verse_start}`).join(", ") || "None"}
- Pending Obedience Steps: ${context.pendingObedienceSteps?.map((s) => s.commitment).join("; ") || "None"}
${context.currentSeason ? `- Currently Observing: ${context.currentSeason}` : ""}

## Relevant Scripture for This Conversation (from RAG search)
${relevantVerses}

## Tool Usage
IMPORTANT: Actively use the provided tools to save meaningful moments:
- When they share a reflection or feeling → use save_journal_entry
- When they express a need to pray about → use create_prayer_request
- When they report answered prayer → use mark_prayer_answered AND trigger_celebration
- When they express conviction/commitment → use create_obedience_step
- When they express gratitude → use log_gratitude

## DO NOT
- Speak as God (never "I forgive you" or "I love you, my child")
- Give medical, legal, or professional advice
- Make promises about specific outcomes ("God will definitely heal...")
- Use excessive emojis or exclamation marks
- Provide generic responses—always personalize to their context

## ERROR RECOVERY PROTOCOL
If the conversation history shows a failed previous attempt or contains messages about connection issues:
- Begin with: "I apologize for the interruption in our connection. Let us return to the Word with a fresh heart."
- This maintains a spiritual tone even when technical glitches occur
- Then proceed with the full response as usual

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
### Prayer Mode - Active Now
You are a gentle, Scripture-guided prayer companion. Your role is to help the user turn the provided verses and their request into a heartfelt, biblical prayer—never speaking as God, but always pointing to Him.

**Core Guidelines:**
- Speak directly to God in the prayer (using "Dear Father," "Lord," "Heavenly Father," etc.)
- Weave in the exact words of the provided Scripture naturally and reverently
- Include adoration, confession (if appropriate), thanksgiving, and supplication as the context fits (ACTS framework)
- Keep the prayer warm, personal, and encouraging
- End with "In Jesus' name, Amen" or a similar biblical closing
- Do NOT add commentary, teaching, or speculation outside the provided verses
- Do NOT say "I pray" or speak on behalf of the user—write the prayer FOR them to pray
- Structure the response as a single, flowing prayer (no bullet points, no headings)
- If the user's request includes a personal situation, reflect it gently and biblically

**When to Generate a Prayer:**
- User explicitly asks to "pray about this" or similar
- User selects a "Pray about it" action
- User shares a burden, struggle, or praise and wants prayer

**After the Prayer:**
- Use create_prayer_request tool to save meaningful prayer needs
- If they're praising God for an answer, use mark_prayer_answered and trigger_celebration

NEVER pray "as God" or give prophetic utterances. You are helping them approach the throne of grace.`,

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
- Prayer request or "pray about this" → Generate a heartfelt, Scripture-grounded prayer for them to pray (see prayer mode guidelines: speak directly to God, weave in Scripture, use ACTS framework, end with "In Jesus' name, Amen")
- Reflective/journaling language → Enter journal mode
- Expressing gratitude → Use log_gratitude and celebrate with them
- Expressing struggle/confession → Be gentle, point to grace
- Reporting answered prayer → Celebrate! Use mark_prayer_answered
- Seeking guidance → Offer wisdom grounded in Scripture
- Expressing commitment → Use create_obedience_step

**Prayer Detection Keywords:** "pray about", "help me pray", "pray for", "prayer for", "turn this into a prayer", "pray over", "want to pray"
When these are detected, generate an actual prayer (not guidance about prayer) that the user can pray aloud or silently.

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
      wit_level = "medium",
      witLevel, // Alternative casing for compatibility
      bible_context,
      bibleContext, // Alternative casing for compatibility
      stream = false, // New: Enable streaming mode
      // Quota context for free tier users
      quota_context,
      quotaContext, // Alternative casing for compatibility
    } = await req.json();

    // Normalize parameters (support both snake_case and camelCase)
    const normalizedUserId = user_id || userId;
    const normalizedHistory = conversation_history.length > 0 ? conversation_history : conversationHistory;
    const normalizedMode = context_mode !== "auto" ? context_mode : (contextMode || "auto");
    const normalizedWitLevel = (wit_level || witLevel || "medium") as WitLevel;
    const normalizedBibleContext = bible_context || bibleContext;
    const rawQuotaContext = quota_context || quotaContext;
    const normalizedQuotaContext: QuotaContext | undefined = rawQuotaContext ? {
      // Pro users send isPremium: true
      isPremium: rawQuotaContext.is_premium ?? rawQuotaContext.isPremium ?? false,
      // Free tier users send these fields
      isFreeTier: rawQuotaContext.is_free_tier ?? rawQuotaContext.isFreeTier,
      seedsRemaining: rawQuotaContext.seeds_remaining ?? rawQuotaContext.seedsRemaining,
      totalSeeds: rawQuotaContext.total_seeds ?? rawQuotaContext.totalSeeds,
      isLastSeed: rawQuotaContext.is_last_seed ?? rawQuotaContext.isLastSeed ?? false,
    } : undefined;

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

    // Enhance message with Bible context if provided
    let enhancedMessage = message;
    if (normalizedBibleContext) {
      const { book, chapter, selectedVerse } = normalizedBibleContext;
      if (selectedVerse) {
        enhancedMessage = `[Context: User is reading ${book} ${chapter}:${selectedVerse.verse} - "${selectedVerse.text}"]\n\n${message}`;
      } else if (book && chapter) {
        enhancedMessage = `[Context: User is reading ${book} chapter ${chapter}]\n\n${message}`;
      }
    }

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(
      userContext,
      normalizedMode as ChatMode,
      relevantVerses,
      devotionalContext,
      normalizedWitLevel,
      normalizedQuotaContext
    );

    // Prepare messages for API
    const apiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...normalizedHistory.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: enhancedMessage },
    ];

    // Extract verse sources for the response (prepare early for streaming)
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

    // Generate a unique thread ID for caching
    const threadId = crypto.randomUUID();

    // ============ STREAMING MODE ============
    if (stream) {
      const streamHeaders = {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      };

      // For streaming, we don't use tools (simplifies real-time response)
      // Tool processing happens in a separate non-streaming call if needed
      const streamResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1200,
        stream: true,
      });

      const encoder = new TextEncoder();
      let fullResponse = "";

      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Send initial metadata event
            const metaEvent = `data: ${JSON.stringify({
              type: "meta",
              sources,
              suggestedActions,
              thread_id: threadId,
              wit_level: normalizedWitLevel,
            })}\n\n`;
            controller.enqueue(encoder.encode(metaEvent));

            // Stream content chunks
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                fullResponse += content;
                const contentEvent = `data: ${JSON.stringify({
                  type: "content",
                  content,
                })}\n\n`;
                controller.enqueue(encoder.encode(contentEvent));
              }
            }

            // Send completion event
            const doneEvent = `data: ${JSON.stringify({
              type: "done",
              fullResponse,
            })}\n\n`;
            controller.enqueue(encoder.encode(doneEvent));

            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            const errorEvent = `data: ${JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`;
            controller.enqueue(encoder.encode(errorEvent));
            controller.close();
          }
        },
      });

      return new Response(readable, { headers: streamHeaders });
    }

    // ============ NON-STREAMING MODE (original behavior) ============
    // Call OpenAI with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
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
            ...apiMessages,
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

    return new Response(
      JSON.stringify({
        response: responseText,
        sources,
        toolsUsed,
        celebration,
        suggestedActions,
        savedData,
        thread_id: threadId,
        wit_level: normalizedWitLevel,
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

function getSuggestedActions(mode: ChatMode): Array<{ label: string; prompt: string; icon?: string }> {
  const actions: Record<string, Array<{ label: string; prompt: string; icon?: string }>> = {
    devotional: [
      { label: "Go deeper", prompt: "Tell me more about this passage", icon: "layers-outline" },
      { label: "Apply today", prompt: "How can I apply this to my life today?", icon: "footsteps-outline" },
      { label: "Pray about it", prompt: "Help me pray about what I just learned", icon: "hand-left-outline" },
    ],
    prayer: [
      { label: "Pray again", prompt: "Write another prayer for this same need", icon: "refresh-outline" },
      { label: "Add Scripture", prompt: "Add more Scripture to this prayer", icon: "book-outline" },
      { label: "Intercede", prompt: "Write a prayer I can pray for someone else going through this", icon: "people-outline" },
      { label: "Save this prayer", prompt: "Save this as a prayer I want to keep praying", icon: "bookmark-outline" },
    ],
    examen: [
      { label: "Continue", prompt: "What's the next reflection question?", icon: "arrow-forward-outline" },
      { label: "Go deeper", prompt: "I want to explore that feeling more deeply", icon: "search-outline" },
      { label: "Confess", prompt: "I need to confess something to God", icon: "heart-outline" },
    ],
    lectio: [
      { label: "Next movement", prompt: "I'm ready for the next step of Lectio Divina", icon: "arrow-forward-outline" },
      { label: "Stay here", prompt: "I want to sit with this word/phrase longer", icon: "pause-outline" },
      { label: "Share insight", prompt: "I noticed something meaningful...", icon: "bulb-outline" },
    ],
    confession: [
      { label: "I'm ready", prompt: "I'm ready to confess what's on my heart", icon: "heart-outline" },
      { label: "Help me examine", prompt: "Help me examine my heart with Psalm 139", icon: "search-outline" },
      { label: "Receive grace", prompt: "Remind me of God's forgiveness", icon: "sunny-outline" },
    ],
    gratitude: [
      { label: "More blessings", prompt: "Help me recognize more blessings I may have overlooked", icon: "gift-outline" },
      { label: "Thank God", prompt: "Help me turn this into a prayer of thanksgiving", icon: "hand-left-outline" },
      { label: "Share testimony", prompt: "I want to share what God has done", icon: "megaphone-outline" },
    ],
    celebration: [
      { label: "Tell the story", prompt: "Let me tell you how God answered this prayer", icon: "chatbubbles-outline" },
      { label: "Find Scripture", prompt: "What Scripture speaks to this answered prayer?", icon: "book-outline" },
      { label: "Share it", prompt: "Help me share this testimony with others", icon: "share-outline" },
    ],
    memory: [
      { label: "Quiz me", prompt: "Quiz me on the verse I'm memorizing", icon: "school-outline" },
      { label: "Explain context", prompt: "What's the context of this verse?", icon: "information-circle-outline" },
      { label: "Apply it", prompt: "How does this verse apply to my situation?", icon: "footsteps-outline" },
    ],
    journal: [
      { label: "Reflect deeper", prompt: "Help me reflect more deeply on this", icon: "search-outline" },
      { label: "Find Scripture", prompt: "What Scripture relates to what I'm processing?", icon: "book-outline" },
      { label: "Turn to prayer", prompt: "Help me turn this reflection into a prayer", icon: "hand-left-outline" },
    ],
    auto: [
      { label: "Pray about this", prompt: "Help me pray about this", icon: "hand-left-outline" },
      { label: "Related verses", prompt: "Show me related verses", icon: "book-outline" },
      { label: "Apply today", prompt: "How can I apply this today?", icon: "footsteps-outline" },
    ],
  };

  return actions[mode] || actions.auto;
}
