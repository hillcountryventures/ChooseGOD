/**
 * Subscription Constants
 *
 * RevenueCat product IDs, entitlements, and subscription configuration.
 *
 * IMPORTANT: These product IDs are placeholders. You must:
 * 1. Create these products in App Store Connect / Google Play Console
 * 2. Create matching products in RevenueCat dashboard
 * 3. Update these IDs to match your actual product identifiers
 */

import type { ChatMode } from '../types';

// =====================================================
// RevenueCat Entitlements
// =====================================================

/**
 * Entitlement identifiers configured in RevenueCat dashboard.
 * Users with "ChooseGOD Pro" entitlement have unlimited AI chat access.
 */
export const REVENUECAT_ENTITLEMENTS = {
  // Main premium entitlement - grants unlimited chat access
  // Must match the entitlement name in RevenueCat dashboard exactly
  premium_chat: 'ChooseGOD Pro',
} as const;

// =====================================================
// Product IDs
// =====================================================

/**
 * Product identifiers matching RevenueCat dashboard / App Store Connect.
 * These must match exactly what's configured in RevenueCat.
 */
export const REVENUECAT_PRODUCT_IDS = {
  // Monthly subscription with 7-day free trial
  monthly: 'choosegodmonthly',

  // Yearly subscription (~25% savings) with 7-day free trial
  yearly: 'choosegodannual',
} as const;

// =====================================================
// Free Tier Limits
// =====================================================

/**
 * Number of free AI chat queries allowed per day for non-premium users.
 */
export const FREE_CHAT_LIMIT = 1;

/**
 * Number of active devotional enrollments allowed for free users.
 * Premium users get unlimited enrollments.
 */
export const FREE_ENROLLMENT_LIMIT = 1;

// =====================================================
// Chat Mode Gating
// =====================================================

/**
 * Chat modes available to free users.
 * These are the basic spiritual guidance modes.
 */
export const FREE_CHAT_MODES: ChatMode[] = [
  'auto',       // General Q&A
  'devotional', // Devotional guidance
  'prayer',     // Prayer companion
];

/**
 * Premium-only chat modes.
 * These provide deeper spiritual practice experiences.
 */
export const PREMIUM_CHAT_MODES: ChatMode[] = [
  'lectio',      // Lectio Divina (ancient contemplative reading)
  'examen',      // Evening Examen (Ignatian reflection)
  'memory',      // Scripture memorization
  'confession',  // Heart check-in / confession
  'gratitude',   // Gratitude focusing
  'celebration', // Celebration moments
  'journal',     // Deep journaling support
];

/**
 * Check if a chat mode requires premium subscription.
 */
export function isPremiumChatMode(mode: ChatMode): boolean {
  return PREMIUM_CHAT_MODES.includes(mode);
}

/**
 * Get all available chat modes for a user based on premium status.
 */
export function getAvailableChatModes(isPremium: boolean): ChatMode[] {
  if (isPremium) {
    return [...FREE_CHAT_MODES, ...PREMIUM_CHAT_MODES];
  }
  return FREE_CHAT_MODES;
}

// =====================================================
// Verse Card Gradient Gating
// =====================================================

/**
 * Verse card gradient presets.
 * Free users get 3 basic gradients.
 * Pro users get 12+ premium designs.
 */
export const FREE_VERSE_GRADIENTS: [string, string][] = [
  ['#1a1a2e', '#16213e'], // Deep blue (default)
  ['#2d1f3d', '#1a1a2e'], // Purple twilight
  ['#1f2d1a', '#1a2e16'], // Forest green
];

export const PREMIUM_VERSE_GRADIENTS: [string, string][] = [
  ['#2d1a1a', '#2e1616'], // Warm ember
  ['#1a2d2d', '#162e2e'], // Teal ocean
  ['#3d2d1f', '#2e2416'], // Golden hour
  ['#1f1a3d', '#16162e'], // Midnight purple
  ['#2d3d1a', '#1e2e16'], // Spring meadow
  ['#3d1a2d', '#2e1621'], // Rose dusk
  ['#1a3d3d', '#162e2e'], // Deep ocean
  ['#2d1a2d', '#21162e'], // Violet night
  ['#1a2d1f', '#162e1a'], // Emerald forest
];

export function getAvailableVerseGradients(isPremium: boolean): [string, string][] {
  if (isPremium) {
    return [...FREE_VERSE_GRADIENTS, ...PREMIUM_VERSE_GRADIENTS];
  }
  return FREE_VERSE_GRADIENTS;
}

// =====================================================
// Journal AI Insights Gating
// =====================================================

/**
 * Journal AI insight features.
 * Free users get basic insights.
 * Pro users get advanced analysis.
 */
export const FREE_JOURNAL_INSIGHTS = {
  summary: true,
  suggestedVerses: true,
  reflectionQuestions: true,
  growthPatterns: false,  // Pro only
  sentimentThemes: false, // Pro only
  yearlyReview: false,    // Pro only
} as const;

export const PRO_JOURNAL_INSIGHTS = {
  summary: true,
  suggestedVerses: true,
  reflectionQuestions: true,
  growthPatterns: true,
  sentimentThemes: true,
  yearlyReview: true,
} as const;

export function getJournalInsightFeatures(isPremium: boolean) {
  return isPremium ? PRO_JOURNAL_INSIGHTS : FREE_JOURNAL_INSIGHTS;
}

// =====================================================
// Paywall Content
// =====================================================

/**
 * Paywall messaging and copy - mission-aligned and encouraging.
 */
export const PAYWALL_CONTENT = {
  // Main headline
  headline: 'Unlock Deeper Companionship',

  // Subheadline
  subheadline:
    'Premium spiritual tools for deeper Bible study, guided practices, and personalized growth.',

  // Feature list for premium - organized by perceived value
  features: [
    {
      icon: 'chatbubbles',
      title: 'Unlimited AI Conversations',
      description: 'Ask anything about Scripture—no daily limits, anytime access.',
    },
    {
      icon: 'compass',
      title: 'Premium Spiritual Practices',
      description: 'Lectio Divina, Evening Examen, Scripture memorization, confession, and more.',
    },
    {
      icon: 'library',
      title: 'Unlimited Devotional Series',
      description: 'Enroll in as many devotional series as you like, simultaneously.',
    },
    {
      icon: 'color-palette',
      title: 'Premium Verse Card Designs',
      description: '12+ beautiful gradient backgrounds for shareable verse cards.',
    },
    {
      icon: 'analytics',
      title: 'Advanced Journal Insights',
      description: 'Sentiment themes, growth patterns, and yearly spiritual reviews.',
    },
    {
      icon: 'download',
      title: 'Export Journal & Prayers',
      description: 'Download your spiritual journey as a beautiful PDF testimony.',
    },
  ],

  // Trial messaging
  trialMessage: 'Start with a 7-day free trial. Cancel anytime.',

  // Monthly plan
  monthly: {
    label: 'Monthly',
    price: '$3.99',
    period: '/month',
    description: 'Billed monthly after free trial',
  },

  // Annual plan (recommended)
  annual: {
    label: 'Annual',
    price: '$36',
    period: '/year',
    description: 'Save ~25% • Best value',
    badge: 'BEST VALUE',
  },

  // Support message
  supportMessage:
    'Your subscription supports ongoing development of this free Bible resource. Thank you for helping us share God\'s Word faithfully.',

  // Free tier messaging (when limit reached)
  freeLimitReached: {
    title: 'Daily Limit Reached',
    message: `You've used your ${FREE_CHAT_LIMIT} free questions for today. Upgrade for unlimited access, or come back tomorrow!`,
  },

  // Premium mode blocked messaging
  premiumModeBlocked: {
    title: 'Premium Practice',
    message: 'This spiritual practice requires ChooseGOD Pro. Upgrade to unlock Lectio Divina, Evening Examen, and more.',
  },

  // Restore purchases
  restoreText: 'Already subscribed? Restore purchases',

  // Legal
  termsText: 'By subscribing, you agree to our Terms of Service and Privacy Policy.',
} as const;

// =====================================================
// Subscription Tiers (for UI logic)
// =====================================================

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  isRecommended: boolean;
  savings?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: REVENUECAT_PRODUCT_IDS.yearly,
    name: 'Annual',
    price: '$36.00',
    period: 'year',
    isRecommended: true,
    savings: 'Save ~25%',
  },
  {
    id: REVENUECAT_PRODUCT_IDS.monthly,
    name: 'Monthly',
    price: '$3.99',
    period: 'month',
    isRecommended: false,
  },
];
