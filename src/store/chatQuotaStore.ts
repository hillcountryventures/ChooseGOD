/**
 * Chat Quota Store - "3 Daily Seeds" quota tracking for free users
 *
 * Premium users get unlimited access.
 * Free users get 3 "seeds" (messages) per day that reset at midnight.
 * Seeds are framed as a spiritual practice, not a restriction.
 *
 * Uses Zustand with persist middleware for reliable state persistence
 * across app restarts (including force quit).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// Constants
// =====================================================

const DAILY_SEED_LIMIT = 3;

// =====================================================
// Types
// =====================================================

export interface ChatQuotaState {
  // State
  seedsRemaining: number;
  seedsUsedToday: number;
  lastResetDate: string; // YYYY-MM-DD format

  // UI State
  isOnLastSeed: boolean;
  showFinalSeedInterstitial: boolean;

  // Actions
  useSeed: () => boolean;
  checkAndResetDaily: () => void;
  dismissFinalSeedInterstitial: () => void;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get today's date string for comparison (local timezone)
 * Uses local date to reset at midnight in user's timezone
 */
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// =====================================================
// Store
// =====================================================

export const useChatQuotaStore = create<ChatQuotaState>()(
  persist(
    (set, get) => ({
      // Initial state
      seedsRemaining: DAILY_SEED_LIMIT,
      seedsUsedToday: 0,
      lastResetDate: getTodayString(),
      isOnLastSeed: false,
      showFinalSeedInterstitial: false,

      /**
       * Check if day has changed and reset seeds if needed
       * Called on rehydration and can be called manually
       */
      checkAndResetDaily: () => {
        const today = getTodayString();
        const { lastResetDate } = get();

        if (lastResetDate !== today) {
          // New day - reset seeds
          set({
            seedsRemaining: DAILY_SEED_LIMIT,
            seedsUsedToday: 0,
            lastResetDate: today,
            isOnLastSeed: false,
            showFinalSeedInterstitial: false,
          });
        }
      },

      /**
       * Use a seed (called when user sends a message)
       * Returns true if seed was used, false if no seeds remaining
       * Note: Premium check should be done in the hook wrapper
       */
      useSeed: (): boolean => {
        const { seedsRemaining, seedsUsedToday } = get();

        if (seedsRemaining <= 0) {
          return false; // No seeds left
        }

        const wasOnLastSeed = seedsRemaining === 1;
        const newRemaining = seedsRemaining - 1;
        const newUsed = seedsUsedToday + 1;

        set({
          seedsRemaining: newRemaining,
          seedsUsedToday: newUsed,
          isOnLastSeed: newRemaining === 1,
          showFinalSeedInterstitial: wasOnLastSeed,
        });

        return true;
      },

      /**
       * Dismiss the final seed interstitial
       */
      dismissFinalSeedInterstitial: () => {
        set({ showFinalSeedInterstitial: false });
      },
    }),
    {
      name: 'daily_seeds_state', // Same key for backwards compatibility
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // After rehydration completes, check if we need to reset for a new day
        if (state) {
          state.checkAndResetDaily();
        }
      },
    }
  )
);

// =====================================================
// Selectors
// =====================================================

export const useSeedsRemaining = () => useChatQuotaStore((s) => s.seedsRemaining);
export const useSeedsUsedToday = () => useChatQuotaStore((s) => s.seedsUsedToday);
export const useIsOnLastSeed = () => useChatQuotaStore((s) => s.isOnLastSeed);
export const useShowFinalSeedInterstitial = () => useChatQuotaStore((s) => s.showFinalSeedInterstitial);
export const TOTAL_SEEDS = DAILY_SEED_LIMIT;
