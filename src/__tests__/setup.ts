/**
 * Shared test setup — automatically loaded by jest-expo.
 *
 * Put any global mocks here (AsyncStorage, navigation, analytics, etc.)
 * so individual test files stay focused on their scenario.
 *
 * To enable, add to package.json jest config:
 *   "setupFilesAfterEach": ["<rootDir>/src/__tests__/setup.ts"]
 * (jest-expo already handles setupFiles for Expo modules.)
 */

// AsyncStorage mock — default for all tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Analytics no-op mock — tests don't need PostHog instrumentation
jest.mock('../services/analytics', () => ({
  initAnalytics: jest.fn(),
  identifyUser: jest.fn(),
  resetAnalytics: jest.fn(),
  trackOnboardingStarted: jest.fn(),
  trackOnboardingCompleted: jest.fn(),
  trackFirstChat: jest.fn(),
  trackPaywallShown: jest.fn(),
  trackSubscriptionStarted: jest.fn(),
  trackScreenView: jest.fn(),
  trackVerseShared: jest.fn(),
  trackBibleRead: jest.fn(),
  trackChapterCompleted: jest.fn(),
  trackDailyVerseViewed: jest.fn(),
  trackStreakDay: jest.fn(),
  trackVerseHighlighted: jest.fn(),
  trackVerseBookmarked: jest.fn(),
  trackDevotionalEnrolled: jest.fn(),
  trackDevotionalDayCompleted: jest.fn(),
  trackPrayerAdded: jest.fn(),
  trackPrayerAnswered: jest.fn(),
  trackJournalEntryCreated: jest.fn(),
  trackChatModeUsed: jest.fn(),
  trackEvent: jest.fn(),
}));

// Silence console noise in test output unless DEBUG=1
if (!process.env.DEBUG) {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
}
