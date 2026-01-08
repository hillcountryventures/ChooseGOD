/**
 * useChatQuota - "3 Daily Seeds" quota tracking for free users
 *
 * Premium users get unlimited access.
 * Free users get 3 "seeds" (messages) per day that reset at midnight.
 * Seeds are framed as a spiritual practice, not a restriction.
 *
 * This hook wraps the Zustand store and adds premium status logic.
 */

import { useCallback, useEffect } from 'react';
import { useChatQuotaStore, TOTAL_SEEDS } from '../store/chatQuotaStore';
import { usePremiumStatus } from './usePremiumStatus';

export function useChatQuota() {
  const { isPremium } = usePremiumStatus();

  // Get state from Zustand store
  const seedsRemaining = useChatQuotaStore((s) => s.seedsRemaining);
  const seedsUsedToday = useChatQuotaStore((s) => s.seedsUsedToday);
  const isOnLastSeed = useChatQuotaStore((s) => s.isOnLastSeed);
  const showFinalSeedInterstitial = useChatQuotaStore((s) => s.showFinalSeedInterstitial);

  // Get actions from store
  const storeUseSeed = useChatQuotaStore((s) => s.useSeed);
  const storeDismissFinalSeedInterstitial = useChatQuotaStore((s) => s.dismissFinalSeedInterstitial);
  const checkAndResetDaily = useChatQuotaStore((s) => s.checkAndResetDaily);

  // Check for day rollover when hook mounts or when app comes to foreground
  useEffect(() => {
    checkAndResetDaily();
  }, [checkAndResetDaily]);

  // Use a seed (called when user sends a message)
  const useSeed = useCallback(async (): Promise<boolean> => {
    // Premium users don't use seeds
    if (isPremium) {
      return true;
    }

    return storeUseSeed();
  }, [isPremium, storeUseSeed]);

  // Check if user can send a message
  const canSendMessage = useCallback((): boolean => {
    if (isPremium) return true;
    return seedsRemaining > 0;
  }, [isPremium, seedsRemaining]);

  // Dismiss the final seed interstitial
  const dismissFinalSeedInterstitial = useCallback(() => {
    storeDismissFinalSeedInterstitial();
  }, [storeDismissFinalSeedInterstitial]);

  // Get the message for the current seed state
  const getSeedMessage = useCallback((): string | null => {
    if (isPremium) return null;

    if (seedsRemaining === 0) {
      return "You've planted all your seeds for today.";
    }

    if (isOnLastSeed) {
      return 'This is your final daily seed. Make it a deep one.';
    }

    return null;
  }, [isPremium, seedsRemaining, isOnLastSeed]);

  return {
    // State
    seedsRemaining,
    seedsUsedToday,
    totalSeeds: TOTAL_SEEDS,
    isLoading: false, // Zustand handles rehydration, no async loading needed
    isOnLastSeed,
    showFinalSeedInterstitial,

    // Computed
    hasSeeds: isPremium || seedsRemaining > 0,
    isPremium,

    // Actions
    useSeed,
    canSendMessage,
    dismissFinalSeedInterstitial,
    getSeedMessage,
  };
}
