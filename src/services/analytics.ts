/**
 * Analytics Service
 *
 * Centralized analytics using PostHog for event tracking, funnel analysis,
 * and user identification. Replace the placeholder API key with your
 * PostHog project key before shipping.
 */

import PostHog from 'posthog-react-native';
import { logger } from '../utils/logger';

// =====================================================
// CONFIGURATION
// =====================================================

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let posthog: PostHog | null = null;
let initialized = false;

// =====================================================
// INITIALIZATION
// =====================================================

/**
 * Initialize PostHog. Call once at app startup (e.g., in App.tsx).
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initAnalytics(): Promise<void> {
  if (initialized) return;

  if (!POSTHOG_API_KEY) {
    logger.warn(
      '[Analytics] ⚠️  PostHog API key is empty! Analytics will NOT be initialized. ' +
      'Set EXPO_PUBLIC_POSTHOG_API_KEY in your environment.',
    );
    initialized = true;
    return;
  }

  try {
    posthog = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      // Flush events every 30s or when 20 events queue up
      flushInterval: 30,
      flushAt: 20,
      // Disable automatic capture to keep events intentional
      captureAppLifecycleEvents: false,
    });
    initialized = true;
  } catch (err) {
    logger.warn('[Analytics] Failed to initialize PostHog:', err);
  }
}

// =====================================================
// USER IDENTITY
// =====================================================

/**
 * Identify the current user after login / signup.
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, string | number | boolean>,
): void {
  posthog?.identify(userId, properties);
}

/**
 * Reset identity on logout so subsequent events are anonymous.
 */
export function resetAnalytics(): void {
  posthog?.reset();
}

// =====================================================
// TYPED EVENT HELPERS
// =====================================================

/** User lands on the Welcome screen (top of onboarding funnel). */
export function trackOnboardingStarted(): void {
  posthog?.capture('onboarding_started');
}

/** User completes the full onboarding flow. */
export function trackOnboardingCompleted(): void {
  posthog?.capture('onboarding_completed');
}

/** User sends their very first chat message. */
export function trackFirstChat(): void {
  posthog?.capture('first_chat');
}

/** Paywall screen is shown to the user. */
export function trackPaywallShown(): void {
  posthog?.capture('paywall_shown');
}

/** User starts a subscription (trial or paid). */
export function trackSubscriptionStarted(plan?: string): void {
  posthog?.capture('subscription_started', { plan: plan ?? 'unknown' });
}

/** Generic screen view event. */
export function trackScreenView(screenName: string): void {
  posthog?.capture('screen_view', { screen: screenName });
}

/** User shares a verse. */
export function trackVerseShared(): void {
  posthog?.capture('verse_shared');
}

/** User opens/reads a Bible chapter. */
export function trackBibleRead(book: string, chapter: number): void {
  posthog?.capture('bible_read', { book, chapter });
}

/** User completes reading a chapter (scrolled to end). */
export function trackChapterCompleted(book: string, chapter: number): void {
  posthog?.capture('chapter_completed', { book, chapter });
}

/** User views the daily verse card. */
export function trackDailyVerseViewed(): void {
  posthog?.capture('daily_verse_viewed');
}

/** User reaches a streak day. Flags day 3 and 7 as key milestones. */
export function trackStreakDay(count: number): void {
  posthog?.capture('streak_day', {
    count,
    is_milestone: count === 3 || count === 7 || count === 14 || count === 30,
  });
}

// =====================================================
// MID-FUNNEL EVENTS (P2-4)
// =====================================================

/** User highlights a verse (color-coded). */
export function trackVerseHighlighted(book: string, color: string): void {
  posthog?.capture('verse_highlighted', { book, color });
}

/** User bookmarks a verse. */
export function trackVerseBookmarked(book: string): void {
  posthog?.capture('verse_bookmarked', { book });
}

/** User enrolls in a devotional series. */
export function trackDevotionalEnrolled(seriesSlug: string): void {
  posthog?.capture('devotional_enrolled', { series: seriesSlug });
}

/** User completes a day of a devotional series. */
export function trackDevotionalDayCompleted(seriesSlug: string, day: number): void {
  posthog?.capture('devotional_day_completed', { series: seriesSlug, day });
}

/** User adds a new prayer request. */
export function trackPrayerAdded(): void {
  posthog?.capture('prayer_added');
}

/** User marks a prayer as answered. */
export function trackPrayerAnswered(): void {
  posthog?.capture('prayer_answered');
}

/** User saves a new journal entry. */
export function trackJournalEntryCreated(hasVerse: boolean, hasMedia: boolean): void {
  posthog?.capture('journal_entry_created', {
    has_verse: hasVerse,
    has_media: hasMedia,
  });
}

/** User sends a message in a specific chat mode. */
export function trackChatModeUsed(mode: string, isPremium: boolean): void {
  posthog?.capture('chat_mode_used', { mode, is_premium: isPremium });
}

// =====================================================
// GENERIC CAPTURE (escape hatch)
// =====================================================

/**
 * Capture an arbitrary event with optional properties.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
): void {
  posthog?.capture(event, properties);
}
