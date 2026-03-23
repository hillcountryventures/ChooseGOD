/**
 * Chat Mode Constants
 *
 * Centralized constants for all chat modes to prevent hardcoded strings
 * across the codebase. This ensures consistency and makes it easier to
 * add or modify chat modes in the future.
 */

import { ChatMode } from '../types';

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
 * Modes that require premium access
 */
export const PREMIUM_MODES: ChatMode[] = ['lectio', 'examen'];

/**
 * Check if a mode requires premium
 */
export const requiresPremium = (mode: ChatMode): boolean => {
  return PREMIUM_MODES.includes(mode);
};
