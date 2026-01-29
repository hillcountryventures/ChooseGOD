/**
 * useAnalytics Hook
 *
 * Convenience wrapper around the analytics service for use in React components.
 * Returns memoized tracking functions so they're safe to pass as deps.
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  trackOnboardingStarted,
  trackOnboardingCompleted,
  trackFirstChat,
  trackPaywallShown,
  trackSubscriptionStarted,
  trackScreenView,
  trackVerseShared,
  trackStreakDay,
  trackEvent,
  identifyUser,
  resetAnalytics,
} from '../services/analytics';

export function useAnalytics() {
  return {
    trackOnboardingStarted: useCallback(() => trackOnboardingStarted(), []),
    trackOnboardingCompleted: useCallback(() => trackOnboardingCompleted(), []),
    trackFirstChat: useCallback(() => trackFirstChat(), []),
    trackPaywallShown: useCallback(() => trackPaywallShown(), []),
    trackSubscriptionStarted: useCallback(() => trackSubscriptionStarted(), []),
    trackScreenView: useCallback((name: string) => trackScreenView(name), []),
    trackVerseShared: useCallback(() => trackVerseShared(), []),
    trackStreakDay: useCallback((count: number) => trackStreakDay(count), []),
    trackEvent: useCallback((name: string, props?: Record<string, string | number | boolean>) => trackEvent(name, props), []),
    identifyUser: useCallback((userId: string) => identifyUser(userId), []),
    resetAnalytics: useCallback(() => resetAnalytics(), []),
  };
}

/**
 * Fires a screen_view event once when the component mounts.
 */
export function useTrackScreen(screenName: string): void {
  const tracked = useRef(false);
  useEffect(() => {
    if (!tracked.current) {
      trackScreenView(screenName);
      tracked.current = true;
    }
  }, [screenName]);
}
