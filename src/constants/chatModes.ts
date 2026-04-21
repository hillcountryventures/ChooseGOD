/**
 * Chat Mode Constants
 *
 * The user-facing picker collapses to 3 INTENTS per market-capture Decision #6:
 *   Ask / Pray / Reflect
 *
 * Internally, the existing ChatMode enum is preserved and used as the prompt
 * routing key. A resolver (intentToMode) maps intent + screen context + user
 * input signals to the best internal mode.
 *
 * Lectio Divina, Examen, Memory Verse practice are moved OUT of chat modes
 * and into the Practices Hub as guided linear flows.
 */

import { ChatMode } from '../types';

// =====================================================
// User-facing intents (new in Decision #6)
// =====================================================

export type ChatIntent = 'ask' | 'pray' | 'reflect';

export const CHAT_INTENT_LABELS: Record<ChatIntent, string> = {
  ask: 'Ask',
  pray: 'Pray',
  reflect: 'Reflect',
} as const;

export const CHAT_INTENT_DESCRIPTIONS: Record<ChatIntent, string> = {
  ask: 'Questions about Scripture, theology, or the faith',
  pray: 'A companion for prayer \u2014 intercession, help, lament',
  reflect: 'Process what you\u2019re feeling with God',
} as const;

export const CHAT_INTENT_ICONS: Record<ChatIntent, string> = {
  ask: 'chatbubbles',
  pray: 'heart',
  reflect: 'leaf',
} as const;

export const CHAT_INTENTS: ChatIntent[] = ['ask', 'pray', 'reflect'];

/**
 * Signal-based lightweight classifier. If the user's message obviously
 * signals a sub-type under 'reflect' (gratitude / confession / celebration /
 * examen / journal / devotional), route to that specialized prompt instead
 * of the generic reflection flow. Never called server-side from prod flow;
 * the companion function does the sophisticated routing with LLM context.
 */
export function detectReflectSubtype(input: string): ChatMode {
  const lower = (input || '').toLowerCase();

  // Gratitude signals
  if (/\b(thank|grateful|thankful|blessed|praise|gratitude)\b/.test(lower)) {
    return 'gratitude';
  }
  // Confession signals
  if (/\b(sin|confess|forgive|repent|wrong|ashamed|guilty)\b/.test(lower)) {
    return 'confession';
  }
  // Celebration signals
  if (/\b(celebrat|joy|rejoice|wonderful|amazing|answered\s+prayer)\b/.test(lower)) {
    return 'celebration';
  }
  // Examen signals (end-of-day review)
  if (/\b(today|this\s+day|reviewing|end\s+of\s+day|before\s+bed)\b/.test(lower)) {
    return 'examen';
  }
  // Devotional signals
  if (/\b(devotional|devote|devotion|read\s+today)\b/.test(lower)) {
    return 'devotional';
  }

  return 'journal';
}

/**
 * Map intent + context + user input to the legacy ChatMode used as a prompt
 * routing key on the server. Companion function already handles all 10 modes;
 * this resolver is strictly a client-side mapping layer.
 */
export function intentToMode(
  intent: ChatIntent,
  userInput?: string,
): ChatMode {
  switch (intent) {
    case 'ask':
      return 'auto';
    case 'pray':
      return 'prayer';
    case 'reflect':
      return detectReflectSubtype(userInput ?? '');
  }
}

/**
 * Display labels for each chat mode
 */
export const CHAT_MODE_LABELS: Record<ChatMode, string> = {
  auto: 'Ask Anything',
  devotional: 'Devotional',
  prayer: 'Prayer',
  journal: 'Journal',
  lectio: 'Lectio Divina',
  examen: 'Evening Examen',
  memory: 'Scripture Memory',
  confession: 'Confession',
  gratitude: 'Gratitude',
  celebration: 'Celebration',
} as const;

/**
 * Descriptions for each chat mode
 */
export const CHAT_MODE_DESCRIPTIONS: Record<ChatMode, string> = {
  auto: 'Ask questions about Scripture and theology',
  devotional: 'Guided devotional conversations',
  prayer: 'Prayer companion and support',
  journal: 'Reflect deeply with AI-guided questions',
  lectio: 'Slow, meditative reading to hear God speak',
  examen: 'Review your day with God\'s presence',
  memory: 'Hide God\'s Word in your heart',
  confession: 'Honest conversation about sin and grace',
  gratitude: 'Cultivate thankfulness and joy',
  celebration: 'Rejoice in God\'s goodness and faithfulness',
} as const;

/**
 * Icon names for each chat mode (Ionicons)
 */
export const CHAT_MODE_ICONS: Record<ChatMode, string> = {
  auto: 'chatbubbles',
  devotional: 'sunny',
  prayer: 'heart',
  journal: 'book',
  lectio: 'leaf',
  examen: 'moon',
  memory: 'bulb',
  confession: 'water',
  gratitude: 'sparkles',
  celebration: 'trophy',
} as const;

/**
 * Color values for each chat mode
 * Note: These reference theme colors, so actual hex values come from theme.ts
 */
export const CHAT_MODE_COLOR_KEYS = {
  auto: 'primary',
  devotional: 'accent',
  prayer: 'error',
  journal: 'text',
  lectio: 'success',
  examen: 'primaryLight',
  memory: 'accent',
  confession: 'info',
  gratitude: 'warning',
  celebration: 'success',
} as const;

/**
 * Helper to get chat mode label
 */
export const getChatModeLabel = (mode: ChatMode): string => {
  return CHAT_MODE_LABELS[mode] || 'Ask Anything';
};

/**
 * Helper to get chat mode icon
 */
export const getChatModeIcon = (mode: ChatMode): string => {
  return CHAT_MODE_ICONS[mode] || 'chatbubbles';
};

/**
 * Helper to get chat mode color key
 */
export const getChatModeColorKey = (mode: ChatMode): string => {
  return CHAT_MODE_COLOR_KEYS[mode] || 'primary';
};

/**
 * Helper to get chat mode description
 */
export const getChatModeDescription = (mode: ChatMode): string => {
  return CHAT_MODE_DESCRIPTIONS[mode] || 'Engage with Scripture';
};

/**
 * Check if a mode is prayer-related
 */
export const isPrayerMode = (mode: ChatMode): boolean => {
  return mode === 'prayer';
};

/**
 * Chat modes are no longer gated by premium per Decision #12.
 * Pro gating has moved to the Practices Hub (Lectio Divina, Evening Examen).
 * Keeping this const for call-site compatibility \u2014 now empty.
 */
export const PREMIUM_MODES: ChatMode[] = [];

export const requiresPremium = (_mode: ChatMode): boolean => {
  return false;
};
