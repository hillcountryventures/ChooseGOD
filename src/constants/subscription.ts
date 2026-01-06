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
  monthly: 'monthly',

  // Yearly subscription (~25% savings) with 7-day free trial
  yearly: 'yearly',

  // Lifetime one-time purchase
  lifetime: 'lifetime',
} as const;

// =====================================================
// Free Tier Limits
// =====================================================

/**
 * Number of free AI chat queries allowed per day for non-premium users.
 * Set to 0 to disable free queries entirely (hard paywall).
 * Set to a higher number for a more generous free tier.
 */
export const FREE_CHAT_LIMIT = 1;

// =====================================================
// Paywall Content
// =====================================================

/**
 * Paywall messaging and copy - mission-aligned and encouraging.
 */
export const PAYWALL_CONTENT = {
  // Main headline
  headline: 'Unlock Unlimited Scripture Guidance',

  // Subheadline
  subheadline:
    'Your faithful AI companion for deeper Bible study, prayer, and spiritual growth.',

  // Feature list for premium
  features: [
    {
      icon: 'chatbubbles',
      title: 'Unlimited AI Conversations',
      description: 'Ask questions about Scripture anytime, with faithful, citation-backed answers.',
    },
    {
      icon: 'book',
      title: 'Exact Bible Citations',
      description: 'Every response grounded in Scripture with direct verse references.',
    },
    {
      icon: 'heart',
      title: 'Prayer & Devotional Support',
      description: 'Guided prayer prompts, lectio divina, and spiritual reflection.',
    },
    {
      icon: 'shield-checkmark',
      title: 'Trustworthy & Private',
      description: 'No hallucinations. No ads. Your conversations stay private.',
    },
    {
      icon: 'sparkles',
      title: 'Personalized Devotional Insights',
      description: 'Get tailored Scripture recommendations based on your spiritual journey.',
    },
    {
      icon: 'git-branch',
      title: 'Cross-Reference Discovery',
      description: 'Explore connected passages and themes across the entire Bible.',
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
    message: `You've used all ${FREE_CHAT_LIMIT} free questions for today. Upgrade for unlimited access, or come back tomorrow!`,
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
    id: REVENUECAT_PRODUCT_IDS.annual,
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
