/**
 * String constants for default values and UI text
 *
 * All user-facing copy is centralized here for consistency and easy updates.
 * Organized by screen/feature.
 */

// =====================================================
// Bible Defaults
// =====================================================

export const BIBLE_DEFAULTS = {
  translation: 'KJV',
  book: 'Proverbs',
  chapter: 1,
  verse: 1,
} as const;

// Supported translations
export const TRANSLATIONS = {
  KJV: 'KJV',
  ESV: 'ESV',
  NIV: 'NIV',
  NASB: 'NASB',
  NLT: 'NLT',
} as const;

// Font size options
export const FONT_SIZE_OPTIONS = {
  small: 'small',
  medium: 'medium',
  large: 'large',
} as const;

// Maturity levels
export const MATURITY_LEVELS = {
  new: 'new',
  growing: 'growing',
  mature: 'mature',
} as const;

// Day abbreviations
export const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

// Full day names
export const WEEK_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// =====================================================
// Greetings
// =====================================================

export const GREETINGS = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
} as const;

// =====================================================
// Placeholders
// =====================================================

export const PLACEHOLDERS = {
  chatInput: 'Ask anything about Scripture...',
  journalPrompt: "What's on your heart today?",
  noteInput: 'Write your notes, thoughts, or reflections...',
  search: 'Search the Bible...',
} as const;

// =====================================================
// Loading Messages
// =====================================================

export const LOADING_MESSAGES = {
  verse: "Loading today's verse...",
  chapter: 'Loading chapter...',
  devotional: 'Loading devotional...',
  search: 'Searching...',
} as const;

// =====================================================
// Error Messages — Warm, faith-aligned, user-friendly
// =====================================================

export const ERROR_MESSAGES = {
  // Generic fallback
  genericError: "We hit a bump, but God's still working. Please try again.",

  // Network / connectivity
  networkError:
    "We couldn't connect right now. Check your internet and try again.\n\n\"Be still, and know that I am God.\" — Psalm 46:10",

  // Server-side issues (replaces "Edge Function" / "Database function" language)
  serviceUnavailable:
    'Our servers are resting for a moment. Please try again shortly.',
  dataUnavailable:
    "We couldn't load your data right now. Give it another try in a moment.",

  // Purchase errors
  purchaseNotAllowed: "Purchases aren't available on this device right now.",
  purchaseInvalid: "That purchase didn't go through. Please try again.",
  purchaseNetwork:
    "We couldn't reach the store. Check your connection and try again.\n\n\"The Lord is near to all who call on him.\" — Psalm 145:18",
  purchaseGeneric: "That didn't work — please try once more.",

  // Restore
  restoreFailed: "We couldn't restore your purchases right now. Please try again.",
  restoreNotFound: "We didn't find an active subscription for this account.",

  // Legacy keys kept for any existing consumers
  edgeFunctionNotDeployed: 'Our service is temporarily unavailable. Please try again shortly.',
  missingEnvVars: "Something isn't configured right on our end. We're on it.",
  databaseFunctionMissing: "We couldn't reach your data. Please try again in a moment.",
} as const;

// =====================================================
// Empty State Messages
// =====================================================

export const EMPTY_STATES = {
  journeyTitle: 'Your Journey Begins',
  journeySubtitle: 'Start capturing moments of faith, reflection, and growth.',
  journeyCta: 'Record your first moment',
  noResults: 'No results found',
  noVerses: 'No verses found',
} as const;

// =====================================================
// Streak Messages & Milestones
// =====================================================

export const STREAK_MESSAGES = {
  active: (days: number) => `${days} day streak`,
  inactive: 'Start your streak',
} as const;

/** Short celebration micro-copy shown at key streak milestones */
export const STREAK_MILESTONE_MICROCOPY: Record<number, string> = {
  3: "Three days in! You're building a rhythm with God. 🌱",
  7: 'One week strong — faithfulness looks good on you! 🔥',
  14: 'Two weeks of showing up. God sees your dedication. 📈',
  30: 'A full month with the Lord. This is who you are now. ⭐',
  60: 'Sixty days deep — your roots are growing strong. 🌿',
  100: 'Century club! Your faithfulness is extraordinary. 🏆',
  365: 'A whole year walking with God — what a testimony! 👑',
};

// =====================================================
// HomeScreen Copy
// =====================================================

export const HOME_STRINGS = {
  subtitle: "What's on your heart today?",
  verseOfTheDay: 'VERSE OF THE DAY',
  loadingVerse: "Loading today's verse...",
  askTheBible: 'Ask the Bible',
  unlimitedQuestions: 'Unlimited questions & guidance',
  freshSeeds: (count: number) => `${count} fresh seeds ready`,
  seedsRemaining: (count: number) =>
    `${count} seed${count !== 1 ? 's' : ''} remaining`,
  proverbsTitle: 'Proverbs of the Day',
  proverbsSubtitle: (chapter: number) => `Read Proverbs ${chapter}`,
  memoryReview: 'Memory Review',
  memoryReviewSubtitle: (count: number) =>
    `${count} verse${count > 1 ? 's' : ''} ready to review`,
  followThrough: 'Follow Through',
  followThroughSubtitle: (count: number) =>
    `${count} commitment${count > 1 ? 's' : ''} to check on`,
  continueInPrayer: 'Continue in Prayer',
  prayerSubtitle: (count: number) =>
    `${count} prayer${count > 1 ? 's' : ''} before the Lord`,
  todaysDevotional: "Today's Devotional",
  startYourDay: 'Start your day with God',
  communityReflecting: (count: number) =>
    `Join ${count.toLocaleString()} others reflecting today`,
  shareMessage: (text: string, reference: string) =>
    `"${text}"\n\n— ${reference}\n\nShared from ChooseGOD`,
} as const;

// =====================================================
// Onboarding Carousel Copy
// =====================================================

export const ONBOARDING_SLIDES = {
  devotionals: {
    title: 'Daily Devotionals',
    description:
      'Personalized spiritual journeys tailored to where you are in life and faith.',
  },
  prayer: {
    title: 'Prayer & Journaling',
    description:
      'Track your prayers, journal your thoughts, and see how God is working in your life.',
  },
  ai: {
    title: 'Scripture-Powered Guidance',
    description:
      'Get personalized Scripture insights and spiritual guidance whenever you need it.',
  },
} as const;

// =====================================================
// Paywall Copy
// =====================================================

export const PAYWALL_STRINGS = {
  headline: 'Go Deeper with God',
  subheadline:
    'Unlock premium spiritual tools — deeper Bible study, guided practices, and personalized growth.',
  socialProofUsers: 'Join believers going deeper',
  trialMessage: 'Start with a 7-day free trial. Cancel anytime.',
  ctaButton: 'Start Free Trial',
  restorePurchases: 'Restore Purchases',
  restoredTitle: 'Restored!',
  restoredMessage: 'Your subscription has been restored.',
  noSubscriptionTitle: 'No Subscription Found',
  noSubscriptionMessage:
    "We couldn't find an active subscription for your account.",
  loadingOptions: 'Loading options...',
  noOptions: 'No subscription options available. Please try again later.',
  loadError:
    'Unable to load subscription options. Please check your connection.',
  supportMessage:
    "Your subscription supports ongoing development of this free Bible resource. Thank you for helping us share God's Word faithfully.",
  renewalDisclosure:
    'Subscription automatically renews unless canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period.',
} as const;

// =====================================================
// ErrorState / ErrorBoundary Copy
// =====================================================

export const ERROR_STATE_STRINGS = {
  defaultTitle: 'Something unexpected happened',
  defaultMessage: "Don't worry — take a breath, and let's try that again.",
  boundaryTitle: 'Something unexpected happened',
  boundaryMessage:
    "An unexpected error occurred. Let's try again — God's got this.",
  scripture: '"Cast all your anxiety on him because he cares for you."',
  scriptureRef: '1 Peter 5:7',
} as const;
