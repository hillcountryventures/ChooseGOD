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
    trackOnboardingStarted: useCallback(trackOnboardingStarted, []),
    trackOnboardingCompleted: useCallback(trackOnboardingCompleted, []),
    trackFirstChat: useCallback(trackFirstChat, []),
    trackPaywallShown: useCallback(trackPaywallShown, []),
    trackSubscriptionStarted: useCallback(trackSubscriptionStarted, []),
    trackScreenView: useCallback(trackScreenView, []),
    trackVerseShared: useCallback(trackVerseShared, []),
    trackStreakDay: useCallback(trackStreakDay, []),
    trackEvent: useCallback(trackEvent, []),
    identifyUser: useCallback(identifyUser, []),
    resetAnalytics: useCallback(resetAnalytics, []),
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
