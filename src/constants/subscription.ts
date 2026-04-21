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
  // Monthly subscription with 14-day free trial
  monthly: 'choosegodmonthly',

  // Yearly subscription (2 months free vs monthly) with 14-day free trial
  yearly: 'choosegodannual',

  // Non-renewing "Founding Member" lifetime tier \u2014 capped at first 1,000
  // users per Decision #5. RevenueCat lifetime product.
  lifetime: 'choosegodlifetime_founding',
} as const;

// =====================================================
// Pricing (display-only; real prices come from RevenueCat)
// =====================================================
export const PRICING = {
  monthly: { price: '$6.99', period: '/month' },
  annual: { price: '$49.99', period: '/year', monthlyEquiv: '$4.17' },
  lifetime: { price: '$99', period: 'one-time' },
  trialDays: 14,
  foundingMemberCap: 1000,
} as const;

// =====================================================
// Free Tier Limits
// =====================================================

/**
 * Number of free AI chat queries allowed per day for non-premium users.
 * Increased from 1 \u2192 3 in the paywall rearchitecture (Decision #12).
 * The paywall shifts from "breadth of access" to "frequency and depth."
 */
export const FREE_CHAT_LIMIT = 3;

/**
 * Number of active devotional enrollments allowed for free users.
 * Premium users get unlimited enrollments.
 */
export const FREE_ENROLLMENT_LIMIT = 1;

// =====================================================
// Chat Mode Gating (Decision #12 \u2014 paywall by depth + frequency)
// =====================================================

/**
 * All chat modes are now free, gated only by the daily quota (FREE_CHAT_LIMIT).
 * The previous arbitrary free/premium split (e.g. confession locked, journal
 * locked) conflicted with the wedge: new believers and seekers need exactly
 * those modes most.
 *
 * Lectio Divina + Examen remain Pro, but have moved OUT of chat-mode gating
 * and INTO the Practices Hub as guided linear flows. Memory is free-forever.
 *
 * Kept as a const array for any remaining UI that filters "show premium
 * badge" \u2014 now empty so the badge never shows on chat modes.
 */
export const FREE_CHAT_MODES: ChatMode[] = [
  'auto',
  'devotional',
  'prayer',
  'journal',
  'confession',
  'gratitude',
  'celebration',
  'examen',
  'memory',
  'lectio',
];

export const PREMIUM_CHAT_MODES: ChatMode[] = []; // intentionally empty

/**
 * Practices are the new premium-gated surface. Decision #12.
 */
export const PREMIUM_PRACTICES = ['lectio', 'examen'] as const;
export type PremiumPractice = typeof PREMIUM_PRACTICES[number];

export function isPremiumPractice(practice: string): practice is PremiumPractice {
  return (PREMIUM_PRACTICES as readonly string[]).includes(practice);
}

/** Chat mode gating is now noop. Kept for call-site compatibility. */
export function isPremiumChatMode(_mode: ChatMode): boolean {
  return false;
}

export function getAvailableChatModes(_isPremium: boolean): ChatMode[] {
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
 * Philosophy: "We are not God, only helping others find HIM"
 */
export const PAYWALL_CONTENT = {
  // Main headline
  headline: 'Unlock Your Full Spiritual Journey',

  // Subheadline
  subheadline:
    'Everything you need to grow closer to God — unlimited conversations, deeper practices, and personalized insights.',

  // Social proof
  socialProof: {
    userCount: 'Join thousands growing in faith',
    rating: null, // Only show when real App Store data is available
    ratingCount: null,
    testimonials: [
      {
        text: 'Finally, an app that helps me understand Scripture, not just read it.',
        author: 'Sarah M.',
      },
      {
        text: 'Like having a wise pastor available 24/7 who knows the Bible deeply.',
        author: 'James K.',
      },
    ],
  },

  // Feature list \u2014 depth + time-saved, not access-gating.
  // Per Decision #12: every surface in the app stays free; Pro unlocks
  // unlimited, deeper, AI-personalized, and synced.
  features: [
    {
      icon: 'infinite',
      title: 'Unlimited AI Conversations',
      description: 'Ask anything about Scripture \u2014 no limits, anytime.',
      highlight: true,
    },
    {
      icon: 'sparkles',
      title: 'AI Journal Insights',
      description: 'Monthly reflections on what God seems to be doing in your life.',
      highlight: true,
    },
    {
      icon: 'mic',
      title: 'Audio Grace Mode',
      description: 'Catch up on missed readings with voice narration when life gets loud.',
      highlight: false,
    },
    {
      icon: 'leaf',
      title: 'Guided Practices',
      description: 'Lectio Divina and Evening Examen \u2014 ancient rhythms in short sessions.',
      highlight: false,
    },
    {
      icon: 'cloud-done',
      title: 'Chat History Across Devices',
      description: 'Switch phones without losing a single conversation.',
      highlight: false,
    },
    {
      icon: 'library',
      title: 'Unlimited Devotional Series',
      description: 'Enroll in multiple series + AI-personalized series on your own topic.',
      highlight: false,
    },
    {
      icon: 'people-circle',
      title: 'Create Prayer Circles',
      description: 'Start private circles for your small group or family.',
      highlight: false,
    },
  ],

  // Trial messaging
  trialMessage: 'Start free, cancel anytime.',

  // Monthly plan
  monthly: {
    label: 'Monthly',
    price: '$6.99',
    period: '/month',
    description: 'Flexible monthly billing',
    monthlyEquiv: '$6.99',
  },

  // Annual plan (recommended)
  annual: {
    label: 'Annual',
    price: '$49.99',
    period: '/year',
    description: 'Just $4.17/month',
    badge: '2 MONTHS FREE',
    monthlyEquiv: '$4.17',
    savings: '40%',
  },

  // Founding Member lifetime tier (first 1,000 users only per Decision #5)
  lifetime: {
    label: 'Founding Member',
    price: '$99',
    period: 'one-time',
    description: 'Lifetime access \u2014 for the first 1,000 supporters',
    badge: 'LIMITED',
    footnote: 'Pay once, walk with God forever.',
  },

  // Support message
  supportMessage:
    'Your subscription helps us keep improving ChooseGOD and sharing God\'s Word faithfully.',

  // Free tier messaging (when limit reached)
  freeLimitReached: {
    title: 'Daily Grace Reached',
    message: `You've had your ${FREE_CHAT_LIMIT} free conversations today. Upgrade for unlimited, or come back tomorrow \u2014 no guilt.`,
  },

  // Premium practice blocked messaging (Lectio / Examen)
  premiumModeBlocked: {
    title: 'A Pro Practice',
    message: 'Lectio Divina and Evening Examen are Pro \u2014 guided ancient rhythms for deeper seasons. Try a 14-day Pro trial free.',
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
    price: '$49.99',
    period: 'year',
    isRecommended: true,
    savings: '2 months free',
  },
  {
    id: REVENUECAT_PRODUCT_IDS.monthly,
    name: 'Monthly',
    price: '$6.99',
    period: 'month',
    isRecommended: false,
  },
  {
    id: REVENUECAT_PRODUCT_IDS.lifetime,
    name: 'Founding Member',
    price: '$99',
    period: 'lifetime',
    isRecommended: false,
  },
];
