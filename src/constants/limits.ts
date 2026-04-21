/**
 * Limit constants for data constraints across the app
 */

// Chat limits
export const CHAT_LIMITS = {
  historyMessages: 10,
  maxMessageLength: 4000,
} as const;

// Storage limits
export const STORAGE_LIMITS = {
  recentMoments: 50,
  savedDrafts: 10,
  recentSearches: 20,
} as const;

// Display limits
export const DISPLAY_LIMITS = {
  topThemes: 5,
  topVerses: 3,
  recentItems: 10,
  previewLines: 3,
} as const;

// Streak limits
export const STREAK_LIMITS = {
  maxDays: 30,
  weekDays: 7,
} as const;

// Bible limits
export const BIBLE_LIMITS = {
  maxProverbsChapters: 31,
  versesPerPage: 50,
} as const;

// Search limits
export const SEARCH_LIMITS = {
  minQueryLength: 2,
  maxResults: 100,
  semanticResults: 10,
} as const;

// Streak display limits (what's shown in the UI, not the actual streak)
export const STREAK_DISPLAY_LIMITS = {
  home: 365,
  journey: 365,
} as const;

// UI timing delays (ms)
export const UI_TIMING = {
  trialPaywallDelayMs: 1000,
  streakFreezeDelayMs: 2000,
} as const;

// Reading plan Wayfarer intervention
export const READING_PLAN_LIMITS = {
  interventionThresholdDays: 2,
} as const;
