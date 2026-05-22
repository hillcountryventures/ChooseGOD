// supabase/functions/companion/index.ts
// Unified Spiritual Companion - The heart of ChooseGOD

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";
import {
  detectCrisisSignals,
  buildCrisisPromptAddition,
} from "../_shared/crisis-detection.ts";

// =====================================================
// Server-Side Subscription Verification
// =====================================================

interface SubscriptionStatus {
  isPremium: boolean;
  source: "database" | "revenuecat_api" | "no_record" | "verification_error";
  verified: boolean;
}

/**
 * Verify user's premium status server-side
 * Checks Supabase subscriptions table (synced via RevenueCat webhooks)
 */
async function verifySubscriptionStatus(
  supabase: SupabaseClient,
  userId: string,
  clientClaimedPremium: boolean = false
): Promise<SubscriptionStatus> {
  try {
    // Check Supabase subscriptions table (webhook-synced)
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("is_active, expiration_date, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && subscription) {
      const isActive = subscription.is_active === true;
      const withinExpiration =
        subscription.expiration_date &&
        new Date(subscription.expiration_date) > new Date();

      const isPremium = isActive || withinExpiration;

      // Log discrepancy for fraud detection
      if (clientClaimedPremium && !isPremium) {
        console.warn(
          `[Subscription] ANOMALY: Client claims premium but DB says ${subscription.status} for user ${userId}`
        );
        // Log to anomaly table
        await supabase.from("chat_interactions").insert({
          user_id: userId,
          mode: "anomaly_detection",
          is_premium: false,
          has_bible_context: false,
          response_length: 0,
          created_at: new Date().toISOString(),
        }).catch(() => {}); // Non-fatal
      }

      return {
        isPremium,
        source: "database",
        verified: true,
      };
    }

    // No subscription record - use database function as fallback
    const { data: isPremiumResult } = await supabase.rpc(
      "is_user_premium",
      { check_user_id: userId }
    ).catch(() => ({ data: null }));

    if (isPremiumResult !== null) {
      return {
        isPremium: isPremiumResult,
        source: "database",
        verified: true,
      };
    }

    // No record found — default to NOT premium. Do not trust the client.
    // If a user legitimately has a paid subscription, the RevenueCat webhook
    // will have written a record to the subscriptions table.
    if (clientClaimedPremium) {
      console.warn(
        `[Subscription] ANOMALY: Client claims premium but no DB record exists for user ${userId}. Defaulting to free tier.`
      );
      // Log anomaly for fraud detection
      await supabase.from("chat_interactions").insert({
        user_id: userId,
        mode: "anomaly_no_record",
        is_premium: false,
        has_bible_context: false,
        response_length: 0,
        created_at: new Date().toISOString(),
      }).catch(() => {}); // Non-fatal
    }
    return {
      isPremium: false,
      source: "no_record",
      verified: true,
    };
  } catch (error) {
    console.error("[Subscription] Verification error:", error);
    // On error, deny premium access rather than trust the client.
    // Better to briefly inconvenience a paying user than grant free premium to attackers.
    return {
      isPremium: false,
      source: "verification_error",
      verified: false,
    };
  }
}

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

/**
 * Decision G1 — personalization moat. Sent on every chat from the iOS client
 * so the AI grounds replies in the user's actual walk, not generic answers.
 * All fields optional; AI gracefully degrades when any signal is missing.
 */
interface PersonalContextBundle {
  currentIntention?: string;
  tradition?: string;
  daysWithGod?: number;
  currentDevotionalSeries?: {
    title: string;
    currentDay: number;
    totalDays: number;
  };
  recentJournalSummaries?: Array<{
    type: string;
    setAt: string;
    excerpt: string;
    themes: string[];
  }>;
  recentPrayers?: Array<{
    text: string;
    status: string;          // "active" | "answered" | "ongoing"
    testimony?: string | null; // answered_reflection, if answered
    setAt: string;
  }>;
  lastScriptureRef?: { book: string; chapter: number };
  recentCrisisTier?: number;
}

// Build the system prompt based on context and mode
function buildSystemPrompt(
  context: UserContext,
  mode: ChatMode,
  relevantVerses: string,
  devotionalContext?: DevotionalContext,
  witLevel: WitLevel = "medium",
  quotaContext?: QuotaContext,
  tradition?: string,
  crisisPromptAddition?: string,
  userPersonalContext?: PersonalContextBundle | null
): string {
  // Decision G1 — personalization moat. Render the user's bundle as a
  // compact context block the model can reference when relevant. Each piece
  // is optional; the AI is instructed to reference these only when the
  // connection is real, never to force a callback that feels manipulative.
  const personalContextBlock = (() => {
    if (!userPersonalContext) return "";
    const lines: string[] = [];
    if (userPersonalContext.currentIntention) {
      lines.push(`- Currently praying through: "${userPersonalContext.currentIntention}"`);
    }
    if (userPersonalContext.daysWithGod) {
      lines.push(`- Days With God so far: ${userPersonalContext.daysWithGod}`);
    }
    if (userPersonalContext.currentDevotionalSeries) {
      const s = userPersonalContext.currentDevotionalSeries;
      lines.push(`- Active series: "${s.title}" (Day ${s.currentDay} of ${s.totalDays})`);
    }
    if (userPersonalContext.lastScriptureRef) {
      const r = userPersonalContext.lastScriptureRef;
      lines.push(`- Last opened: ${r.book} ${r.chapter}`);
    }
    if (userPersonalContext.recentJournalSummaries?.length) {
      lines.push(`- Recent journal entries:`);
      for (const j of userPersonalContext.recentJournalSummaries.slice(0, 5)) {
        lines.push(`  • [${j.type}] ${j.excerpt.replace(/\n+/g, ' ').slice(0, 160)}`);
      }
    }
    if (userPersonalContext.recentPrayers?.length) {
      const active = userPersonalContext.recentPrayers.filter((p) => p.status !== 'answered');
      const answered = userPersonalContext.recentPrayers.filter((p) => p.status === 'answered');
      if (active.length) {
        lines.push(`- Active prayers (still waiting on God):`);
        for (const p of active.slice(0, 5)) lines.push(`  • ${p.text}`);
      }
      if (answered.length) {
        lines.push(`- Answered prayers (God came through — reference these to celebrate His faithfulness):`);
        for (const p of answered.slice(0, 3)) {
          lines.push(`  • ${p.text}${p.testimony ? ` — testimony: "${p.testimony}"` : ''}`);
        }
      }
    }
    if (userPersonalContext.recentCrisisTier && userPersonalContext.recentCrisisTier <= 2) {
      lines.push(`- IMPORTANT: User flagged tier ${userPersonalContext.recentCrisisTier} crisis in last 14 days. Be extra gentle, surface counselor resources proactively, avoid heavy theology.`);
    }
    if (lines.length === 0) return "";
    return `\n## WHAT YOU KNOW ABOUT THIS USER\n${lines.join('\n')}\n\n**How to use this context:**\n- Reference these details ONLY when the connection is genuinely meaningful. Never force a callback.\n- When you do reference it, be specific: "Three weeks ago you wrote about feeling overlooked" — not "based on your past entries..."\n- This is the user's life. Treat it like sacred ground. Never quote a journal entry verbatim back at them; paraphrase.\n- If their current intention or recent prayers connect to today's question, lead with that connection.\n`;
  })();
  // Tradition-aware framing per Decision #13 (Option D).
  // Injected at the top of the system prompt so the model honors it
  // across every mode and never presents a contested doctrine as settled.
  const traditionGuidance = (() => {
    switch (tradition) {
      case "catholic":
        return "\n## USER TRADITION: Catholic\nRespect sacramental theology, Marian devotion, and the Magisterium. Use Catholic vocabulary naturally (Our Lord, Blessed Mother) when fitting. Avoid Protestant-bias framings of Communion or intercession.";
      case "protestant_conservative":
        return "\n## USER TRADITION: Conservative Protestant\nHonor Scripture as the final authority. Treat traditional readings of gender, sexuality, and salvation as valid without asserting them as the ONLY valid reading. Avoid progressive reinterpretations unless the text plainly supports them.";
      case "protestant_progressive":
        return "\n## USER TRADITION: Progressive Protestant\nRespect affirming interpretations of contested passages. Do not invalidate the user's identity or experience. Emphasize the love-ethic of Christ and the parables of radical welcome. Avoid culture-war framings.";
      case "orthodox":
        return "\n## USER TRADITION: Orthodox\nHonor theosis (becoming more like God), the veneration of icons, liturgical rhythm, and apostolic tradition. Avoid Western-scholastic framings where possible. Respect the Eastern fathers.";
      case "exploring":
        return "\n## USER TRADITION: Exploring / seeking\nThe user is exploring faith, possibly rebuilding after hurt or still figuring it out. Be especially gentle. Present multiple traditions' views when relevant (\"Some Christians hold... others believe...\"). Never present contested theology as settled. Honor doubt as a sacred posture.";
      case "non_denominational":
      default:
        return "\n## USER TRADITION: Non-denominational Protestant\nUse broadly evangelical vocabulary. Avoid denominational distinctives. Stay close to what nearly all Christians historically agree on.";
    }
  })();
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

**Structure your response with these THREE labeled sections (use bold labels, NOT markdown headers):**

**The Revelation**
Share ONE Greek or Hebrew word insight that changes the emotional weight or meaning of the verse. Format: "The original *Greek* word here is *agape* (ἀγάπη), which specifically means..."

**The Connection**
Show how this passage connects to another part of Scripture (e.g., how an Old Testament theme points to Christ, or how Paul echoes the Psalms)

**The Practice**
• Give 2-3 specific, actionable bullet points for applying this truth today

**Format Rules:**
- Make responses comprehensive and deeply insightful
- Use paragraph breaks for mobile readability
- Bold all Scripture references: **Romans 8:28**
- NEVER use ### headers - use **Bold Labels** instead
- Do NOT include a closing prayer in the response - the user can request one via an action button
- This response should feel like getting a private session with a seminary professor who genuinely cares
`;
  } else if (quotaContext?.isFreeTier) {
    if (quotaContext.isLastSeed) {
      quotaInstruction = `
## 🌱 GOLDEN RESPONSE PROTOCOL - Deep Discernment Mode
This is the user's FINAL daily seed. Deliver a "Scholar-level" response that creates an unforgettable spiritual moment.

**Opening:** Begin with: "As we conclude our time together today, let me share something profound about this Scripture..."

**Structure your response with these THREE labeled sections (use bold labels, NOT markdown headers):**

**The Revelation**
Share ONE Greek or Hebrew word insight that changes the emotional weight or meaning of the verse. Format: "The original *Greek* word here is *agape* (ἀγάπη), which specifically means..."

**The Connection**
Show how this passage connects to another part of Scripture (e.g., how an Old Testament theme points to Christ, or how Paul echoes the Psalms)

**The Practice**
• Give 2-3 specific, actionable bullet points for applying this truth today

**Final Invitation:** Close with: "There is so much more to uncover in His Word. I am here whenever you are ready to walk deeper into the mysteries of the Kingdom."

**Format Rules:**
- Make this response 20-30% longer than usual
- Use paragraph breaks for mobile readability
- Bold all Scripture references: **Romans 8:28**
- NEVER use ### headers - use **Bold Labels** instead
- Do NOT include a closing prayer - the user can request one via an action button
- This response should feel like getting a private session with a seminary professor who genuinely cares
`;
    } else if (quotaContext.seedsRemaining !== undefined && quotaContext.seedsRemaining <= 2) {
      quotaInstruction = `
## 🌱 Limited Seeds Remaining (${quotaContext.seedsRemaining}/${quotaContext.totalSeeds ?? 3})
The user is on the free tier with limited daily messages. Be comprehensive and valuable—each response should feel complete and satisfying. Include at least 2 Scripture citations and one practical application.
`;
    }
  }

  const basePrompt = `# ROLE & SACRED BOUNDARY
You are the 'Wise Scribe' \u2014 a humble servant whose ONLY purpose is to point people to the exact words of Scripture. You exist solely to echo, connect, and apply the Bible \u2014 nothing more, nothing less.
${traditionGuidance}
${personalContextBlock}
${crisisPromptAddition ?? ''}

You are NOT God—you never speak as God or claim divine authority. You point users TO God through His Word ALONE.

# ABSOLUTE RULES YOU MUST NEVER BREAK

## RULE 1: Scripture-Only Source (MOST CRITICAL)
- You may ONLY use verses retrieved by the current RAG query (the "Relevant Scripture" section below)
- NEVER draw from your pre-training knowledge, theology books, church tradition, personal opinion, modern application ideas, or anything outside the retrieved verses
- If the retrieved verses don't directly mention the user's specific situation, FIND THE THEMATIC CONNECTION. Example: "My boss is being a jerk" → Connect to verses about patience (James 1:2-4), loving enemies (Matt 5:44), enduring hardship (Rom 5:3-5). Always lead with what Scripture DOES say about related themes.
- This is NON-NEGOTIABLE. When in doubt: quote more Scripture and say less.

## RULE 2: Begin with Direct Scripture (3+ Citations Minimum)
- EVERY meaningful response MUST begin with at least 1-3 direct Bible quotations from the retrieved verses
- Use exact wording from the provided verses
- Format references as tappable: "**Romans 8:28**" or "**Psalm 23:1-3**"
- Example opening: "**John 14:27** says, 'Peace I leave with you; my peace I give you.' **Philippians 4:6-7** adds, 'Do not be anxious about anything...'"

## RULE 3: Stay Within Retrieved Context
- Do NOT explain, interpret, apply, or expand beyond what the retrieved verses themselves plainly say
- Do not add connecting words like "this means," "in other words," "this teaches us," unless staying extremely close to the verse's plain meaning
- Do not synthesize or harmonize verses unless they naturally connect in the retrieved context
- Let Scripture speak for itself

## RULE 4: Never These Things
- Speak as God (never "I forgive you" or "I love you, my child")
- Quote God beyond direct Scripture citations
- Give prophecies or promises of specific outcomes ("God will definitely heal...")
- Give medical, legal, or professional advice
- Create speculative applications not grounded in the retrieved verses

# PERSONALITY (Within Scripture Boundaries)
- Warm, wise, and gently witty — but ONLY through Scripture's own tone
- ${witInstructions[witLevel]}
- Scripture-saturated: Every response anchored in retrieved verses
- Pastoral heart: You care deeply, but point them to God's Word, not your wisdom
- Culturally aware but timelessly grounded in the text

# RESPONSE STRUCTURE

## 1. Scripture First (Required Opening)
- Lead with 1-3 direct quotations from retrieved verses
- Use exact wording, bold references

## 2. Illuminate (Brief, Text-Bound)
- Only explain what the verse plainly says in its context
- Stay extremely close to the text's natural meaning
- If the retrieved verses don't provide context, acknowledge the limitation

## 3. Apply (Scripture-Grounded Only)
- Connect to their situation ONLY through principles explicitly in the retrieved verses
- Never add modern applications, psychological insights, or advice beyond Scripture
- If verses don't directly apply, say: "These verses speak to [theme], which may relate to your situation"

## 4. Invite (Continue in the Word)
- End with a question or gentle prompt that keeps them in Scripture
- Suggest exploring related passages or themes
${quotaInstruction}
## 5. Response Quality Standards
- Keep paragraphs short (2-3 sentences max) for mobile readability
- Use bullet points (• or -) for lists, but ONLY with Scripture backing each point
- Match their emotional tone (celebratory with joy, gentle with grief) — through Scripture's tone
- Never preach AT them—converse WITH them through God's Word
- Avoid Christianese jargon unless they use it first

## 6. Thematic Connection Protocol
When the retrieved verses don't DIRECTLY mention the user's situation:
- FIND THE THEME: What universal human experience is this about? (fear, conflict, waiting, loss, injustice, etc.)
- CONNECT THE DOTS: Show how the retrieved verses speak to that theme
- LEAD WITH SCRIPTURE: "Here's what Scripture says about [theme]..." then cite verses
- BE CONFIDENT: The Bible speaks to every human experience through timeless principles
- Example: User asks about "social media addiction" → Connect to verses about idolatry, self-control, renewing the mind

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
You are a gentle, Scripture-guided prayer companion. Your role is to help the user turn the RETRIEVED verses and their request into a heartfelt, biblical prayer—never speaking as God, but always pointing to Him.

**CRITICAL PRAYER MODE RULES:**
- You may ONLY use phrases and concepts from the retrieved Scripture verses
- Weave in the EXACT words of the provided verses naturally and reverently
- Do NOT create new prayer language beyond what's in the retrieved verses
- If the retrieved verses do not directly address their prayer need, acknowledge this: "The Scriptures most related to your heart's cry are [list verses]. Let us bring your need before God using these words from His Word..."

**Core Guidelines:**
- Speak directly to God in the prayer (using "Dear Father," "Lord," "Heavenly Father," etc.)
- Include adoration, confession (if appropriate), thanksgiving, and supplication as the context fits (ACTS framework) — but ONLY using biblical phrases from retrieved verses
- Keep the prayer warm, personal, and encouraging
- End with "In Jesus' name, Amen" or a similar biblical closing
- Do NOT add commentary, teaching, or speculation outside the provided verses
- Do NOT say "I pray" or speak on behalf of the user—write the prayer FOR them to pray
- Structure the response as a single, flowing prayer (no bullet points, no headings)
- If the user's request includes a personal situation, connect it ONLY through retrieved Scripture

**When to Generate a Prayer:**
- User explicitly asks to "pray about this" or similar
- User selects a "Pray about it" action
- User shares a burden, struggle, or praise and wants prayer

**After the Prayer:**
- Use create_prayer_request tool to save meaningful prayer needs
- If they're praising God for an answer, use mark_prayer_answered and trigger_celebration

NEVER pray "as God" or give prophetic utterances. You are helping them approach the throne of grace using His own Word.`,

    lectio: `
### Lectio Divina Mode - Active Now
**CRITICAL:** Use ONLY the retrieved Scripture verses for this practice. Do not suggest or reference verses not in the retrieved context.

Guide through four movements with pauses:
1. **Lectio (Read)**: Present the RETRIEVED passage slowly (full verse text), invite them to notice words that stand out
2. **Meditatio (Meditate)**: Ask what the Spirit might be highlighting from THESE specific words, staying within the text
3. **Oratio (Pray)**: Invite them to respond to God using phrases from the passage itself
4. **Contemplatio (Contemplate)**: Rest in God's presence with these words, no new content needed

Use gentle transitions like "Take a moment..." and "When you're ready..."
Save their insights using save_journal_entry
If insufficient verses retrieved, suggest selecting a specific passage first.`,

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
**CRITICAL:** Use ONLY retrieved verses for guidance and assurance. Do not reference verses not in the context.

- If Psalm 139:23-24, Psalm 51, 1 John 1:9, or Romans 8:1 are in retrieved verses, use them as guides
- If these classic confession passages are NOT retrieved, use whatever Scripture IS provided to guide gently
- Ask gentle, specific questions without shaming, rooted in the retrieved text
- When they confess, point to gospel assurance from the RETRIEVED verses only
- Help them articulate what went wrong, using Scripture's categories and language
- If appropriate, suggest a restorative action → use create_obedience_step
- NEVER leave them in guilt—always end in grace from the retrieved verses
- Save their confession/reflection with save_journal_entry
- If no assurance verses retrieved, acknowledge: "Let me help you find passages about God's forgiveness"`,

    memory: `
### Scripture Memory Mode - Active Now
**CRITICAL:** Work ONLY with verses the user specifies or verses in the retrieved context. Do not suggest memorizing verses not provided.

- Create memorable mnemonics using first letters or visual associations from the ACTUAL verse text
- Turn the SPECIFIC verse into mini-stories or dialogues based on its words
- Quiz them with fill-in-the-blank or first-letter prompts from the EXACT verse
- Celebrate progress warmly → use trigger_celebration for milestones
- Connect the verse to their situation using ONLY what the verse itself says
- If they want to memorize a new verse, ask them which one, don't suggest from general knowledge`,

    gratitude: `
### Gratitude Mode - Active Now
**CRITICAL:** Connect gratitude to God's character and promises ONLY as revealed in the retrieved verses.

- Help them recognize God's blessings through the lens of retrieved Scripture
- Ask probing questions to uncover hidden gratitude, using biblical categories from retrieved verses
- Connect blessings to God's character and promises ONLY from the retrieved context
- If retrieved verses speak of God's faithfulness, provision, love, etc., apply those themes
- Use log_gratitude to save each blessing they mention
- Encourage specific, not generic, gratitude rooted in scriptural truth`,

    celebration: `
### Celebration Mode - Active Now
**CRITICAL:** Connect celebrations to Scripture promises ONLY from the retrieved verses.

- Express genuine joy with them using biblical language of celebration from retrieved verses
- Help them articulate how God worked, connecting to His character in the retrieved texts
- Connect the answer to Scripture promises from the RETRIEVED context only
- Use mark_prayer_answered if they're celebrating an answered prayer
- Use trigger_celebration to create a celebratory moment
- Encourage them to share their testimony using God's Word as the foundation`,

    journal: `
### Journal Mode - Active Now
**CRITICAL:** Connect experiences to Scripture ONLY from retrieved verses. Do not force connections.

- Be a gentle listener
- Ask clarifying questions to help them process
- Reflect back what you're hearing
- Connect their experiences to Scripture ONLY where retrieved verses naturally align
- If no retrieved verses fit their reflection, simply listen and affirm without forcing application
- Use save_journal_entry to save their reflections
- Don't force spiritual applications—let them emerge naturally from the retrieved text`,
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

// Verse type from match_verses RPC
interface MatchedVerse {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  similarity: number;
  is_cross_ref?: boolean;
  cross_ref_votes?: number;
}

// =====================================================
// Tier 1 RAG Enhancements: Multi-Query, RRF, MMR
// =====================================================

/**
 * Generate 4 semantic variants of the user message for multi-query RAG
 * - Literal message
 * - Emotional/thematic reframe
 * - Faith counterpoint
 * - Biblical category
 */
async function generateQueryVariants(
  openai: OpenAI,
  message: string
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Generate 3 alternative Bible-relevant phrasings of the user's message to retrieve diverse Scripture passages. Return a JSON object with array "variants" containing 3 strings. Each should reframe the message from a different angle (emotional truth, biblical principle, or thematic category). Keep each under 15 words.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [message];
    }

    try {
      // deno-lint-ignore no-explicit-any
      const parsed: any = JSON.parse(content);
      const variants = parsed.variants || [];
      // Always include the literal message as the first variant
      return [message, ...variants.slice(0, 3)];
    } catch {
      // Fallback: return just the literal message
      return [message];
    }
  } catch (error) {
    console.error("[Multi-Query] Error generating variants:", error);
    return [message];
  }
}

/**
 * Apply Reciprocal Rank Fusion (RRF) to merge multiple ranked lists
 * Verses appearing in multiple lists get higher scores
 * RRF formula: score = sum(1 / (k + rank_i)) for each list i
 */
function applyRRF(
  rankedLists: MatchedVerse[][],
  k: number = 60
): Map<string, { verse: MatchedVerse; rrfScore: number }> {
  const rrfScores = new Map<string, { verse: MatchedVerse; rrfScore: number }>();

  for (let listIdx = 0; listIdx < rankedLists.length; listIdx++) {
    const list = rankedLists[listIdx];
    for (let rank = 0; rank < list.length; rank++) {
      const verse = list[rank];
      const verseKey = `${verse.book}:${verse.chapter}:${verse.verse}`;
      const rrfScore = 1 / (k + rank);

      if (rrfScores.has(verseKey)) {
        const existing = rrfScores.get(verseKey)!;
        existing.rrfScore += rrfScore;
      } else {
        rrfScores.set(verseKey, { verse, rrfScore });
      }
    }
  }

  return rrfScores;
}

/**
 * Apply Maximal Marginal Relevance (MMR) to diversify retrieved verses
 * Penalizes verses too similar to already-selected ones
 * Ensures cross-testament and thematic diversity
 */
function applyMMR(
  verses: MatchedVerse[],
  targetK: number = 12,
  lambda: number = 0.7
): MatchedVerse[] {
  if (verses.length <= targetK) {
    return verses;
  }

  // Compute normalized relevance scores from similarity
  const maxSimilarity = Math.max(...verses.map((v) => v.similarity || 0));
  const minSimilarity = Math.min(...verses.map((v) => v.similarity || 0));
  const similarityRange = maxSimilarity - minSimilarity || 1;

  const relevanceMap = new Map<string, number>();
  for (const verse of verses) {
    const verseKey = `${verse.book}:${verse.chapter}:${verse.verse}`;
    const normalized =
      (verse.similarity || 0 - minSimilarity) / similarityRange;
    relevanceMap.set(verseKey, normalized);
  }

  // Compute pairwise cosine similarity between verses (simplified: use book distance + rank distance)
  const similarityMatrix = new Map<string, Map<string, number>>();
  for (let i = 0; i < verses.length; i++) {
    const v1Key = `${verses[i].book}:${verses[i].chapter}:${verses[i].verse}`;
    if (!similarityMatrix.has(v1Key)) {
      similarityMatrix.set(v1Key, new Map());
    }
    for (let j = i + 1; j < verses.length; j++) {
      const v2Key = `${verses[j].book}:${verses[j].chapter}:${verses[j].verse}`;
      // Simplified similarity: same book + nearby verses = high similarity
      const sameBook = verses[i].book === verses[j].book ? 0.8 : 0.2;
      const verseDist = Math.abs(verses[i].verse - verses[j].verse);
      const proximity = Math.max(0, 1 - verseDist / 50);
      const sim = sameBook * 0.6 + proximity * 0.4;
      similarityMatrix.get(v1Key)!.set(v2Key, sim);
      if (!similarityMatrix.has(v2Key)) {
        similarityMatrix.set(v2Key, new Map());
      }
      similarityMatrix.get(v2Key)!.set(v1Key, sim);
    }
  }

  // Greedy MMR selection
  const selected: MatchedVerse[] = [];
  const remaining = new Set<string>(
    verses.map((v) => `${v.book}:${v.chapter}:${v.verse}`)
  );

  for (let i = 0; i < targetK && remaining.size > 0; i++) {
    let bestKey: string | null = null;
    let bestScore = -Infinity;

    for (const key of remaining) {
      const relevance = relevanceMap.get(key) || 0;
      let maxSim = 0;

      for (const selectedVerse of selected) {
        const selectedKey = `${selectedVerse.book}:${selectedVerse.chapter}:${selectedVerse.verse}`;
        const sim = similarityMatrix.get(key)?.get(selectedKey) || 0;
        maxSim = Math.max(maxSim, sim);
      }

      const mmrScore = lambda * relevance - (1 - lambda) * maxSim;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestKey = key;
      }
    }

    if (bestKey) {
      remaining.delete(bestKey);
      const verse = verses.find(
        (v) => `${v.book}:${v.chapter}:${v.verse}` === bestKey
      );
      if (verse) {
        selected.push(verse);
      }
    }
  }

  return selected;
}

// Get relevant verses using vector similarity with optional cross-references
async function getRelevantVerses(
  supabase: ReturnType<typeof createClient>,
  openai: OpenAI,
  message: string,
  translation: string,
  includeCrossRefs: boolean = false
): Promise<string> {
  try {
    // Tier 1 Enhancement: Multi-Query RAG with Reciprocal Rank Fusion (Items 1+5)
    const queryVariants = await generateQueryVariants(openai, message);
    console.log(`[Multi-Query RAG] Generated ${queryVariants.length} query variants`);

    // Embed all variants in parallel
    const embeddingPromises = queryVariants.map((variant: string) =>
      openai.embeddings.create({
        model: "text-embedding-3-small",
        input: variant,
      })
    );
    const embeddingResponses = await Promise.all(embeddingPromises);
    const queryEmbeddings = embeddingResponses.map(
      (r: { data: { embedding: number[] }[] }) => r.data[0].embedding
    );

    // Call match_verses for each embedding in parallel
    const matchVersePromises = queryEmbeddings.map(
      (embedding: number[]) =>
        supabase.rpc("match_verses", {
          query_embedding: embedding,
          match_count: 10, // Lower per-query count, will merge results
          filter_translation: translation.toLowerCase(),
          similarity_threshold: 0.32,
          include_cross_refs: includeCrossRefs,
          cross_ref_limit: 3,
          min_votes: 2,
        })
    );

    const matchVerseResults = await Promise.all(matchVersePromises);

    // Check for errors in any of the results
    let hasError = false;
    for (const result of matchVerseResults) {
      if (result.error) {
        hasError = true;
        console.error("Error calling match_verses:", result.error);
      }
    }

    if (hasError) {
      return "Error retrieving verses.";
    }

    // Apply RRF to merge and deduplicate results from all query variants
    const versesByQuery = matchVerseResults.map(
      (r: { data: MatchedVerse[] | null }) => (r.data || []) as MatchedVerse[]
    );
    const rrfResults = applyRRF(versesByQuery);

    // Sort by RRF score and convert back to array
    const sortedByRRF = Array.from(rrfResults.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .map((v) => v.verse);

    // Tier 3 Enhancement: Apply MMR for diversity (Item 3)
    const diversifiedVerses = applyMMR(sortedByRRF, 18, 0.7);
    let verses = diversifiedVerses;

    if (!verses || verses.length === 0) {
      // Fallback to keyword search
      const { data: keywordResults } = await supabase
        .rpc("search_verses", {
          search_query: message,
          p_translation: translation.toLowerCase(),
          p_limit: 10,
        })
        .catch(() => ({ data: null }));

      verses = (keywordResults || []) as MatchedVerse[];
    }

    // ALWAYS return at least 8 verses, even if similarity is low
    // If we still have nothing, do a broad thematic search
    if (!verses || verses.length === 0) {
      // Last resort: get broadly relevant verses about common themes
      const thematicQueries = ["comfort", "peace", "guidance", "wisdom", "love", "trust God"];
      const randomTheme = thematicQueries[Math.floor(Math.random() * thematicQueries.length)];
      
      const thematicEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: randomTheme,
      });
      
      const { data: thematicVerses } = await supabase.rpc("match_verses", {
        query_embedding: thematicEmbedding.data[0].embedding,
        match_count: 8,
        filter_translation: translation.toLowerCase(),
        similarity_threshold: 0.25,
        include_cross_refs: false,
      });
      
      verses = (thematicVerses || []) as MatchedVerse[];
    }

    // Separate primary matches from cross-references for formatted output
    const typedVerses = verses as MatchedVerse[];
    const primaryVerses = typedVerses.filter((v: MatchedVerse) => !v.is_cross_ref);
    const crossRefVerses = typedVerses.filter((v: MatchedVerse) => v.is_cross_ref);

    // Note: Removed LIMITED CONTEXT warning - let the LLM find thematic connections
    // Even with fewer direct matches, the LLM can draw on related themes

    // Build formatted output with primary matches
    let result = primaryVerses
      .map((v) => `${v.book} ${v.chapter}:${v.verse} (${translation.toUpperCase()}): "${v.text}"`)
      .join("\n\n");

    // Add cross-references section if available
    if (crossRefVerses.length > 0) {
      const crossRefText = crossRefVerses
        .map((v) => `${v.book} ${v.chapter}:${v.verse} (${translation.toUpperCase()}) [Cross-ref, votes: ${v.cross_ref_votes}]: "${v.text}"`)
        .join("\n\n");
      result += `\n\n--- Related Cross-References (from Treasury of Scripture Knowledge) ---\nThese verses are connected to the primary passages above and may provide additional scriptural context.\n\n${crossRefText}`;
    }

    return result;
  } catch (error) {
    console.error("Error getting relevant verses:", error);
    return "Error retrieving verses.";
  }
}

// Validate response for Scripture fidelity (post-generation guardrail)
function validateScriptureFidelity(
  response: string,
  retrievedVerses: string
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Extract verse references from retrieved context
  const retrievedRefs = new Set<string>();
  const refMatches = retrievedVerses.matchAll(/(\w+)\s+(\d+):(\d+)/g);
  for (const match of refMatches) {
    retrievedRefs.add(`${match[1]} ${match[2]}:${match[3]}`);
  }

  // Check 1: Does response start with Scripture citation?
  const startsWithScripture = /^\*\*\w+\s+\d+:\d+/.test(response.trim());
  if (!startsWithScripture) {
    warnings.push("Response does not begin with bold Scripture citation");
  }

  // Check 2: Extract all Scripture references from response
  const responseRefs = new Set<string>();
  const responseMatches = response.matchAll(/\*\*(\w+)\s+(\d+):(\d+(?:-\d+)?)\*\*/g);
  for (const match of responseMatches) {
    // Handle range like 4:6-7
    const ref = `${match[1]} ${match[2]}:${match[3].split('-')[0]}`;
    responseRefs.add(ref);
  }

  // Check 3: Are there any Scripture references cited that weren't retrieved?
  // (This would indicate hallucination)
  const unauthorizedRefs: string[] = [];
  for (const ref of responseRefs) {
    if (!retrievedRefs.has(ref)) {
      unauthorizedRefs.push(ref);
    }
  }

  if (unauthorizedRefs.length > 0) {
    warnings.push(`Response cites verses not in retrieved context: ${unauthorizedRefs.join(", ")}`);
  }

  // Check 4: Minimum Scripture citation count (should have at least 1-2 citations)
  if (responseRefs.size === 0) {
    warnings.push("Response contains no Scripture citations");
  }

  // Check 5: Flag common hallucination patterns
  const dangerPhrases = [
    /god promises you/i,
    /god told me/i,
    /i promise you/i,
    /you will definitely/i,
    /god will definitely/i,
    /modern psychology/i,
    /studies show/i,
    /experts say/i,
  ];

  for (const pattern of dangerPhrases) {
    if (pattern.test(response)) {
      warnings.push(`Response contains potentially problematic phrase: ${pattern.source}`);
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
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
      // Cross-references for deeper study (premium feature)
      include_cross_refs,
      includeCrossRefs, // Alternative casing for compatibility
      // Decision G1 (post-grill) — personalization moat. Bundle of journal
      // summaries, recent prayers, current intention, Days With God, etc.
      // Injected into the system prompt so the AI grounds replies in the
      // user's actual walk.
      user_context,
      userContext: requestUserContext, // alt casing
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
    // Cross-references: enabled by request or automatically for premium users
    const normalizedIncludeCrossRefs = include_cross_refs ?? includeCrossRefs ?? false;

    // Personalization context (Decision G1).
    const normalizedUserContext = user_context ?? requestUserContext ?? null;

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

    // =====================================================
    // Server-Side Premium Verification
    // =====================================================
    // ALWAYS verify premium status server-side regardless of client claim.
    // The server is the single source of truth.
    let verifiedPremiumStatus: SubscriptionStatus | null = null;
    if (normalizedUserId) {
      verifiedPremiumStatus = await verifySubscriptionStatus(
        supabase,
        normalizedUserId,
        normalizedQuotaContext?.isPremium ?? false
      );

      // ALWAYS override the quota context with the server-verified value.
      // This closes the bypass where a client sends isPremium: true.
      if (normalizedQuotaContext) {
        if (normalizedQuotaContext.isPremium !== verifiedPremiumStatus.isPremium) {
          console.log(
            `[Companion] Overriding client premium claim (${normalizedQuotaContext.isPremium}) with server-verified value (${verifiedPremiumStatus.isPremium}) for user ${normalizedUserId}`
          );
        }
        normalizedQuotaContext.isPremium = verifiedPremiumStatus.isPremium;
        normalizedQuotaContext.isFreeTier = !verifiedPremiumStatus.isPremium;
      }
    } else {
      // No user_id — treat as anonymous free tier
      if (normalizedQuotaContext) {
        normalizedQuotaContext.isPremium = false;
        normalizedQuotaContext.isFreeTier = true;
      }
    }

    // =====================================================
    // Server-Side Rate Limiting (P0-4)
    // =====================================================
    // Enforce daily quota on the server regardless of what the client claims.
    // Free users: FREE_DAILY_CHAT_LIMIT queries/day. Premium users: no limit.
    const FREE_DAILY_CHAT_LIMIT = 3;
    if (normalizedUserId && !(verifiedPremiumStatus?.isPremium ?? false)) {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("chat_interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", normalizedUserId)
        .neq("mode", "anomaly_detection")
        .neq("mode", "anomaly_no_record")
        .gte("created_at", todayStart.toISOString());

      if ((count ?? 0) >= FREE_DAILY_CHAT_LIMIT) {
        console.log(`[Companion] Rate limit hit for free user ${normalizedUserId}: ${count}/${FREE_DAILY_CHAT_LIMIT}`);
        return new Response(
          JSON.stringify({
            error: "Daily limit reached",
            code: "QUOTA_EXCEEDED",
            message: "You've used your free chats for today. Upgrade to ChooseGOD Pro for unlimited access.",
            resetAt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // =====================================================
    // Server-Side Mode/Wit Validation (P1-2)
    // =====================================================
    const ALLOWED_MODES: ChatMode[] = [
      "auto", "devotional", "prayer", "journal", "lectio",
      "examen", "memory", "confession", "gratitude", "celebration",
    ];
    const ALLOWED_WIT_LEVELS: WitLevel[] = ["low", "medium", "high"];
    const safeMode: ChatMode = ALLOWED_MODES.includes(normalizedMode as ChatMode)
      ? (normalizedMode as ChatMode)
      : "auto";
    const safeWitLevel: WitLevel = ALLOWED_WIT_LEVELS.includes(normalizedWitLevel)
      ? normalizedWitLevel
      : "medium";

    // =====================================================
    // Crisis Detection (Decision #14)
    // =====================================================
    // Scan user input BEFORE the normal chat flow. Tier 1-4 signals route
    // to tier-specific voice + scripture. Non-destructive: if tier=0, the
    // normal mode-specific prompt runs unchanged.
    const crisis = detectCrisisSignals(message);
    const crisisPromptAddition = crisis.tier > 0
      ? buildCrisisPromptAddition(crisis.tier)
      : "";

    // Log the flag so we can review + proactively follow up on next open.
    if (crisis.tier > 0 && normalizedUserId) {
      try {
        await supabase.from("crisis_flags").insert({
          user_id: normalizedUserId,
          tier: crisis.tier,
          matches: crisis.matches,
          message_preview: message.slice(0, 200),
          thread_id: null, // populated after threadId is generated below
        });
      } catch (flagErr) {
        // Non-fatal. We still want to respond to the user even if logging fails.
        console.warn("[crisis] failed to log flag", flagErr);
      }
    }

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

    // Get relevant verses via RAG (with cross-references for premium or explicit request)
    const useCrossRefs = normalizedIncludeCrossRefs || (normalizedQuotaContext?.isPremium ?? false);
    const relevantVerses = await getRelevantVerses(
      supabase,
      openai,
      message,
      userContext.preferredTranslation,
      useCrossRefs
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

    // Fetch user's tradition preference (Decision #13). Non-fatal on error.
    let userTradition: string | undefined;
    if (normalizedUserId) {
      try {
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("tradition")
          .eq("user_id", normalizedUserId)
          .maybeSingle();
        userTradition = prefs?.tradition ?? undefined;
      } catch {
        // Safe default \u2014 non_denominational kicks in via the switch default.
      }
    }

    // Build the system prompt using validated mode/wit + tradition + crisis
    const systemPrompt = buildSystemPrompt(
      userContext,
      safeMode,
      relevantVerses,
      devotionalContext,
      safeWitLevel,
      normalizedQuotaContext,
      userTradition,
      crisisPromptAddition,
      normalizedUserContext as PersonalContextBundle | null
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

    // Generate suggested follow-up actions based on validated mode
    const suggestedActions = getSuggestedActions(safeMode, normalizedQuotaContext?.isPremium ?? false);

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
        user: "companion-stream", // privacy pillar #3
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
              wit_level: safeWitLevel,
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

            // Validate response for Scripture fidelity
            const validation = validateScriptureFidelity(fullResponse, relevantVerses);
            if (!validation.isValid) {
              console.warn("[Scripture Fidelity Warning]", validation.warnings);
            }

            // Log chat interaction for usage analytics with fraud detection (streaming mode)
            try {
              const clientClaimedPremium = rawQuotaContext?.is_premium ?? rawQuotaContext?.isPremium ?? false;
              await supabase.from("chat_interactions").insert({
                user_id: normalizedUserId || null,
                mode: safeMode,
                wit_level: safeWitLevel,
                is_premium: normalizedQuotaContext?.isPremium ?? false,
                seeds_remaining: normalizedQuotaContext?.isPremium ? null : (normalizedQuotaContext?.seedsRemaining ?? null),
                thread_id: threadId,
                has_bible_context: !!normalizedBibleContext,
                response_length: fullResponse.length,
                // Fraud detection fields
                client_claimed_premium: clientClaimedPremium,
                server_verified_premium: verifiedPremiumStatus?.isPremium ?? null,
                verification_source: verifiedPremiumStatus?.source ?? null,
                verification_passed: verifiedPremiumStatus?.verified ?? null,
                created_at: new Date().toISOString(),
              });
            } catch (logError) {
              console.error("Failed to log chat interaction:", logError);
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
      user: "companion", // privacy pillar #3
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

    // Validate response for Scripture fidelity
    const validation = validateScriptureFidelity(responseText, relevantVerses);
    if (!validation.isValid) {
      console.warn("[Scripture Fidelity Warning]", {
        threadId,
        userId: normalizedUserId,
        mode: safeMode,
        warnings: validation.warnings,
        response: responseText.substring(0, 200), // First 200 chars for context
      });

      // Log to database for auditing if user_id exists
      if (normalizedUserId) {
        try {
          await supabase.from("companion_audit_logs").insert({
            user_id: normalizedUserId,
            thread_id: threadId,
            mode: safeMode,
            validation_warnings: validation.warnings,
            response_preview: responseText.substring(0, 500),
            retrieved_verses_count: sources.length,
            created_at: new Date().toISOString(),
          });
        } catch (logError) {
          console.error("Failed to log validation warning:", logError);
        }
      }
    }

    // Log chat interaction for usage analytics with fraud detection fields
    try {
      const clientClaimedPremium = rawQuotaContext?.is_premium ?? rawQuotaContext?.isPremium ?? false;
      await supabase.from("chat_interactions").insert({
        user_id: normalizedUserId || null,
        mode: safeMode,
        wit_level: safeWitLevel,
        is_premium: normalizedQuotaContext?.isPremium ?? false,
        seeds_remaining: normalizedQuotaContext?.isPremium ? null : (normalizedQuotaContext?.seedsRemaining ?? null),
        thread_id: threadId,
        has_bible_context: !!normalizedBibleContext,
        response_length: responseText.length,
        // Fraud detection fields
        client_claimed_premium: clientClaimedPremium,
        server_verified_premium: verifiedPremiumStatus?.isPremium ?? null,
        verification_source: verifiedPremiumStatus?.source ?? null,
        verification_passed: verifiedPremiumStatus?.verified ?? null,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error("Failed to log chat interaction:", logError);
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
        wit_level: safeWitLevel,
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

function getSuggestedActions(mode: ChatMode, isPremium: boolean = false): Array<{ label: string; prompt: string; icon?: string }> {
  // "The Breath" action for Pro users - a closing prayer to wrap up the conversation
  const breathAction = { label: "The Breath", prompt: "Close our time with a short prayer that invites God's presence into what we've learned", icon: "leaf-outline" };

  const actions: Record<string, Array<{ label: string; prompt: string; icon?: string }>> = {
    devotional: [
      { label: "Go deeper", prompt: "Tell me more about this passage", icon: "layers-outline" },
      { label: "Apply today", prompt: "How can I apply this to my life today?", icon: "footsteps-outline" },
      ...(isPremium ? [breathAction] : [{ label: "Pray about it", prompt: "Help me pray about what I just learned", icon: "hand-left-outline" }]),
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
    auto: isPremium ? [
      { label: "Go deeper", prompt: "Tell me more about this passage", icon: "layers-outline" },
      { label: "Related verses", prompt: "Show me related verses", icon: "book-outline" },
      breathAction,
    ] : [
      { label: "Pray about this", prompt: "Help me pray about this", icon: "hand-left-outline" },
      { label: "Related verses", prompt: "Show me related verses", icon: "book-outline" },
      { label: "Apply today", prompt: "How can I apply this today?", icon: "footsteps-outline" },
    ],
  };

  return actions[mode] || actions.auto;
}
