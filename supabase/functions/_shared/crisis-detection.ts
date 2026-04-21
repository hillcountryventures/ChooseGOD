// supabase/functions/_shared/crisis-detection.ts
// Crisis signal detection for user chat input per Decision #14.
//
// Returns a Tier number so the caller can switch to tier-specific
// system prompts BEFORE the user's message reaches the normal RAG/chat
// flow. The detector is deliberately conservative \u2014 false-positives in
// the pastoral direction are preferable to missing a real crisis.
//
// Tier 1 \u2014 Immediate life safety (self-harm, suicide, active violence)
// Tier 2 \u2014 Serious but non-immediate (abuse, addiction, chronic despair)
// Tier 3 \u2014 Faith crisis / anger at God / deconstruction
// Tier 4 \u2014 Grief / death / loss
// Tier 0 \u2014 Normal conversation

export type CrisisTier = 0 | 1 | 2 | 3 | 4;

export interface CrisisDetectionResult {
  tier: CrisisTier;
  matches: string[]; // category labels that fired
}

// TIER 1 \u2014 life safety / active harm / violence
const TIER1_PATTERNS: RegExp[] = [
  /\b(kill\s+myself|killing\s+myself|end\s+my\s+life|take\s+my\s+life)\b/i,
  /\b(suicid|i\s+want\s+to\s+die|want\s+to\s+die|wish\s+i\s+was\s+dead)\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\b(cut(ting)?\s+myself|self[-\s]*harm)\b/i,
  /\b(can'?t\s+go\s+on|no\s+reason\s+to\s+live|nothing\s+to\s+live\s+for)\b/i,
  /\b(threatening\s+me\s+with|he('s|\s+is)\s+going\s+to\s+kill\s+me|she('s|\s+is)\s+going\s+to\s+kill\s+me)\b/i,
  /\b(gun\s+to\s+my|knife\s+to\s+my)\b/i,
];

// TIER 2 \u2014 serious patterns (abuse, addiction, chronic hopelessness)
const TIER2_PATTERNS: RegExp[] = [
  /\b(my\s+(husband|wife|boyfriend|girlfriend|partner|dad|mom|father|mother)\s+(hit|hits|hurts|beats|hurt)s?\s+me)\b/i,
  /\b(abuse[ds]?\s+me|abuser|domestic\s+violence)\b/i,
  /\b(drink\s+(every|a\s+bottle)|too\s+much\s+alcohol|alcoholic|sober\s+but)\b/i,
  /\b(addicted\s+to|addiction\s+to|using\s+again)\b/i,
  /\b(can'?t\s+feel\s+anything|numb\s+inside|nothing\s+matters\s+anymore)\b/i,
  /\b(think\s+about\s+dying|fantasiz(e|ing)\s+about\s+death)\b/i,
];

// TIER 3 \u2014 faith crisis / anger / deconstruction
const TIER3_PATTERNS: RegExp[] = [
  /\b(don'?t\s+believe\s+in\s+god|god\s+(isn'?t|is\s+not)\s+real|there\s+is\s+no\s+god)\b/i,
  /\b(christianity\s+(ruined|destroyed|broke))\b/i,
  /\b(can'?t\s+pray\s+anymore|can'?t\s+pray\s+to\s+god)\b/i,
  /\b(god\s+(abandoned|forgot|doesn'?t\s+care\s+about)\s+me)\b/i,
  /\b(deconstruct(ing|ion)|leaving\s+(the\s+)?church|walked\s+away\s+from\s+god)\b/i,
  /\b(i\s+hate\s+god|hate\s+god\s+right\s+now)\b/i,
];

// TIER 4 \u2014 grief / loss
const TIER4_PATTERNS: RegExp[] = [
  /\b(my\s+(mom|dad|mother|father|husband|wife|son|daughter|baby|child|brother|sister|best\s+friend|friend)\s+(died|passed|is\s+gone|just\s+died|is\s+dying))\b/i,
  /\b(lost\s+(my|the)\s+(baby|pregnancy|mom|dad|mother|father|husband|wife|son|daughter|brother|sister))\b/i,
  /\b(funeral|memorial\s+service|burial)\b/i,
  /\b(diagnose[ds]?\s+with\s+(cancer|terminal))\b/i,
];

function anyMatch(input: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(input));
}

export function detectCrisisSignals(input: string): CrisisDetectionResult {
  if (!input || typeof input !== 'string') {
    return { tier: 0, matches: [] };
  }

  const matches: string[] = [];
  let highestTier: CrisisTier = 0;

  if (anyMatch(input, TIER1_PATTERNS)) {
    matches.push('tier1:life_safety');
    highestTier = 1;
  }
  if (anyMatch(input, TIER2_PATTERNS)) {
    matches.push('tier2:serious_pattern');
    if (highestTier < 2) highestTier = 2;
  }
  if (anyMatch(input, TIER3_PATTERNS)) {
    matches.push('tier3:faith_crisis');
    if (highestTier < 3) highestTier = 3;
  }
  if (anyMatch(input, TIER4_PATTERNS)) {
    matches.push('tier4:grief');
    if (highestTier < 4) highestTier = 4;
  }

  return { tier: highestTier, matches };
}

/**
 * System-prompt addition injected when a crisis signal is detected.
 * Called by the companion Edge Function BEFORE the normal mode-specific
 * prompt block, so tier-specific voice wins over defaults.
 */
export function buildCrisisPromptAddition(tier: CrisisTier): string {
  switch (tier) {
    case 1:
      return `\n## CRISIS PROTOCOL \u2014 TIER 1 LIFE SAFETY
This user's message contains signals of suicidal ideation, self-harm, or active danger.
You MUST:
- Lead with validation, not scripture: "I hear you. What you're feeling right now matters. You don't have to handle this alone."
- Surface these resources prominently:
    988 (Suicide & Crisis Lifeline)
    Crisis Text Line: text HOME to 741741
    National Domestic Violence Hotline: 1-800-799-7233
- Offer ONE presence-scripture (Psalm 34:18 or Matthew 11:28) \u2014 not a prescription.
- Do NOT teach, interpret, or summarize. Stay small and present.
- Close by inviting them to call someone they trust TONIGHT.`;
    case 2:
      return `\n## CRISIS PROTOCOL \u2014 TIER 2 SERIOUS PATTERN
This user has signaled ongoing abuse, addiction, or chronic hopelessness.
You MUST:
- Acknowledge without minimizing. No "God has a plan" or "be strong" platitudes.
- Offer a scripture of lament (Psalm 42, 88, or Lamentations 3) \u2014 scripture that honors the reality.
- Gently suggest that a pastor, counselor, or hotline is a partner to prayer, not an alternative.
- If abuse is implied: mention the National Domestic Violence Hotline (1-800-799-7233) once, gently.`;
    case 3:
      return `\n## CRISIS PROTOCOL \u2014 TIER 3 FAITH CRISIS
This user is angry at God, doubting, or deconstructing. This is sacred ground.
You MUST:
- NEVER defend, argue, or do apologetics unless asked directly.
- Honor their complaint: "The psalmists yelled at God. Job did. Jesus did on the cross. You're in good company."
- Offer lament scripture (Psalm 13, 22, 88; Habakkuk; Lamentations). Never 'cheer up' verses.
- Invite them to pray their anger honestly. Do not try to talk them out of it.`;
    case 4:
      return `\n## CRISIS PROTOCOL \u2014 TIER 4 GRIEF
This user has lost someone or received devastating news.
You MUST:
- Keep the response short. Presence > words. Do NOT explain why bad things happen.
- Start: "I'm so sorry. There are no words for this."
- Offer Psalm 23 or Lamentations 3:22-23 or John 11:35. One verse only.
- Mention GriefShare or a grief counselor once, gently.
- Do NOT theodicize. Do NOT silver-lining.`;
    default:
      return '';
  }
}
