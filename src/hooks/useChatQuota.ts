/**
 * useChatQuota - "3 Daily Seeds" quota tracking for free users
 *
 * Premium users get unlimited access.
 * Free users get 3 "seeds" (messages) per day that reset at midnight.
 * Seeds are framed as a spiritual practice, not a restriction.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremiumStatus } from './usePremiumStatus';

const STORAGE_KEY = 'daily_seeds_state';
const DAILY_SEED_LIMIT = 3;

interface SeedState {
  seedsRemaining: number;
  lastResetDate: string; // YYYY-MM-DD format
  seedsUsedToday: number;
}

// Get today's date in YYYY-MM-DD format (local timezone)
const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function useChatQuota() {
  const { isPremium } = usePremiumStatus();
  const [seedsRemaining, setSeedsRemaining] = useState(DAILY_SEED_LIMIT);
  const [seedsUsedToday, setSeedsUsedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnLastSeed, setIsOnLastSeed] = useState(false);
  const [showFinalSeedInterstitial, setShowFinalSeedInterstitial] = useState(false);

  // Load state from storage
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const today = getTodayString();

        if (stored) {
          const state: SeedState = JSON.parse(stored);

          // Check if we need to reset for a new day
          if (state.lastResetDate !== today) {
            // New day - reset seeds
            const newState: SeedState = {
              seedsRemaining: DAILY_SEED_LIMIT,
              lastResetDate: today,
              seedsUsedToday: 0,
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            setSeedsRemaining(DAILY_SEED_LIMIT);
            setSeedsUsedToday(0);
            setIsOnLastSeed(false);
          } else {
            // Same day - use stored values
            setSeedsRemaining(state.seedsRemaining);
            setSeedsUsedToday(state.seedsUsedToday);
            setIsOnLastSeed(state.seedsRemaining === 1);
          }
        } else {
          // First time - initialize
          const newState: SeedState = {
            seedsRemaining: DAILY_SEED_LIMIT,
            lastResetDate: today,
            seedsUsedToday: 0,
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        }
      } catch (error) {
        console.error('[useChatQuota] Error loading state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Use a seed (called when user sends a message)
  const useSeed = useCallback(async (): Promise<boolean> => {
    // Premium users don't use seeds
    if (isPremium) {
      return true;
    }

    if (seedsRemaining <= 0) {
      return false; // No seeds left
    }

    const wasOnLastSeed = seedsRemaining === 1;
    const newRemaining = seedsRemaining - 1;
    const newUsed = seedsUsedToday + 1;

    setSeedsRemaining(newRemaining);
    setSeedsUsedToday(newUsed);
    setIsOnLastSeed(newRemaining === 1);

    // Show interstitial when they've just used their last seed
    if (wasOnLastSeed) {
      setShowFinalSeedInterstitial(true);
    }

    try {
      const today = getTodayString();
      const newState: SeedState = {
        seedsRemaining: newRemaining,
        lastResetDate: today,
        seedsUsedToday: newUsed,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('[useChatQuota] Error saving state:', error);
    }

    return true;
  }, [isPremium, seedsRemaining, seedsUsedToday]);

  // Check if user can send a message
  const canSendMessage = useCallback((): boolean => {
    if (isPremium) return true;
    return seedsRemaining > 0;
  }, [isPremium, seedsRemaining]);

  // Dismiss the final seed interstitial
  const dismissFinalSeedInterstitial = useCallback(() => {
    setShowFinalSeedInterstitial(false);
  }, []);

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
    totalSeeds: DAILY_SEED_LIMIT,
    isLoading,
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
