/**
 * Trial Store - Track 3-day free trial
 *
 * New users get full access for 3 days before seeing paywall.
 * This dramatically improves conversion by letting users experience value first.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Trial duration in days
export const TRIAL_DAYS = 3;

interface TrialStats {
  prayersAdded: number;
  prayersAnswered: number;
  journalEntries: number;
  chaptersRead: number;
  chatMessages: number;
  devotionalDays: number;
  streakDays: number;
}

interface TrialState {
  // When the trial started (ISO string)
  trialStartDate: string | null;
  
  // Whether we've shown the post-trial paywall
  hasSeenTrialEndPaywall: boolean;
  
  // User's activity during trial (for paywall copy)
  trialStats: TrialStats;
  
  // Actions
  startTrial: () => void;
  isTrialActive: () => boolean;
  getDaysRemaining: () => number;
  getDaysUsed: () => number;
  markTrialEndPaywallSeen: () => void;
  shouldShowTrialEndPaywall: () => boolean;
  incrementStat: (stat: keyof TrialStats) => void;
  getTrialStats: () => TrialStats;
}

export const useTrialStore = create<TrialState>()(
  persist(
    (set, get) => ({
      trialStartDate: null,
      hasSeenTrialEndPaywall: false,
      trialStats: {
        prayersAdded: 0,
        prayersAnswered: 0,
        journalEntries: 0,
        chaptersRead: 0,
        chatMessages: 0,
        devotionalDays: 0,
        streakDays: 0,
      },

      startTrial: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) {
          set({ trialStartDate: new Date().toISOString() });
        }
      },

      isTrialActive: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return true; // No trial started = still in "pre-trial"
        
        const start = new Date(trialStartDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        return diffDays < TRIAL_DAYS;
      },

      getDaysRemaining: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return TRIAL_DAYS;
        
        const start = new Date(trialStartDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        return Math.max(0, TRIAL_DAYS - diffDays);
      },

      getDaysUsed: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return 0;
        
        const start = new Date(trialStartDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        return Math.min(TRIAL_DAYS, diffDays);
      },

      markTrialEndPaywallSeen: () => {
        set({ hasSeenTrialEndPaywall: true });
      },

      shouldShowTrialEndPaywall: () => {
        const { isTrialActive, hasSeenTrialEndPaywall } = get();
        // Show if trial is over AND we haven't shown it yet
        return !isTrialActive() && !hasSeenTrialEndPaywall;
      },

      incrementStat: (stat: keyof TrialStats) => {
        set((state) => ({
          trialStats: {
            ...state.trialStats,
            [stat]: state.trialStats[stat] + 1,
          },
        }));
      },

      getTrialStats: () => {
        return get().trialStats;
      },
    }),
    {
      name: 'choosegod-trial',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Convenience hooks
export const useTrialActive = () => useTrialStore((s) => s.isTrialActive());
export const useDaysRemaining = () => useTrialStore((s) => s.getDaysRemaining());
export const useTrialStats = () => useTrialStore((s) => s.trialStats);
