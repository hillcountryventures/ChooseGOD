/**
 * Streak Store - Track streaks with freeze support
 *
 * Premium users get streak freeze (life happens).
 * Milestones unlock temporary premium features.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Grace Day (renamed from "freeze") configuration.
// Per Decision #8: un-paywalled. Every user gets 2 per month for free;
// Pro users get unlimited.
export const FREEZES_PER_MONTH = 2;
export const FREEZE_DURATION_DAYS = 1;

// "Days With God" cumulative counter per Decision #8.
// Never resets. Replaces consecutive-day streak as the primary mechanic
// surfaced on the Home screen. The consecutive streak stays in this
// store as a secondary, churn-aware at_risk signal only (no shame).

// Milestone rewards (temporary premium unlocks)
export interface MilestoneReward {
  days: number;
  reward: 'premium_chat_24h' | 'premium_week' | 'premium_mode_unlock';
  description: string;
  duration: number; // hours
}

export const MILESTONE_REWARDS: MilestoneReward[] = [
  { days: 7, reward: 'premium_chat_24h', description: 'Unlimited chat for 24 hours', duration: 24 },
  { days: 14, reward: 'premium_mode_unlock', description: 'Unlock Lectio Divina for 24 hours', duration: 24 },
  { days: 30, reward: 'premium_week', description: '7 days of full premium access', duration: 168 },
  { days: 60, reward: 'premium_week', description: '7 days of full premium access', duration: 168 },
  { days: 100, reward: 'premium_week', description: '14 days of full premium access', duration: 336 },
];

interface StreakState {
  // Days With God \u2014 cumulative, never resets. Primary surfaced counter.
  daysWithGod: number;
  firstActivityDate: string | null; // ISO string; earliest day counted

  // Core streak data (consecutive days \u2014 secondary, at_risk detector only)
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // ISO string

  // Grace Days (formerly streak freezes). Free users: 2/month. Pro: unlimited.
  freezesUsedThisMonth: number;
  freezeMonthStart: string | null;
  streakFrozenUntil: string | null;

  // Milestone rewards
  activeRewards: Array<{
    reward: MilestoneReward['reward'];
    expiresAt: string;
  }>;
  claimedMilestones: number[];

  // Actions
  recordActivity: () => void;
  checkStreakStatus: () => 'active' | 'at_risk' | 'broken' | 'frozen';
  useStreakFreeze: () => boolean;
  /** Legacy signature; retained for compat. All users can use Grace Days now. */
  canUseFreeze: (isPremium: boolean) => boolean;
  /** Returns remaining Grace Days. Pro users: unlimited (Number.POSITIVE_INFINITY). */
  getFreezesRemaining: (isPremium: boolean) => number;
  claimMilestoneReward: (days: number) => MilestoneReward | null;
  hasActiveReward: (reward: MilestoneReward['reward']) => boolean;
  cleanupExpiredRewards: () => void;
}

const getStartOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfMonth = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / oneDay);
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      daysWithGod: 0,
      firstActivityDate: null,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      freezesUsedThisMonth: 0,
      freezeMonthStart: null,
      streakFrozenUntil: null,
      activeRewards: [],
      claimedMilestones: [],

      recordActivity: () => {
        const now = new Date();
        const today = getStartOfDay(now);
        const {
          lastActivityDate,
          currentStreak,
          longestStreak,
          daysWithGod,
          firstActivityDate,
        } = get();

        // If already recorded today, do nothing
        if (lastActivityDate) {
          const lastDate = getStartOfDay(new Date(lastActivityDate));
          if (lastDate.getTime() === today.getTime()) {
            return;
          }
        }

        let newStreak = 1;

        if (lastActivityDate) {
          const lastDate = getStartOfDay(new Date(lastActivityDate));
          const daysDiff = daysBetween(lastDate, today);

          if (daysDiff === 1) {
            newStreak = currentStreak + 1;
          } else if (daysDiff === 0) {
            newStreak = currentStreak;
          }
          // If daysDiff > 1, consecutive streak resets. Days With God does NOT.
        }

        set({
          // Days With God \u2014 cumulative +1 per distinct day of activity
          daysWithGod: daysWithGod + 1,
          firstActivityDate: firstActivityDate ?? now.toISOString(),
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, longestStreak),
          lastActivityDate: now.toISOString(),
          streakFrozenUntil: null,
        });
      },

      checkStreakStatus: () => {
        const { lastActivityDate, streakFrozenUntil, currentStreak } = get();
        
        if (currentStreak === 0 || !lastActivityDate) {
          return 'broken';
        }

        const now = new Date();
        const today = getStartOfDay(now);
        const lastDate = getStartOfDay(new Date(lastActivityDate));
        const daysDiff = daysBetween(lastDate, today);

        // Check if frozen
        if (streakFrozenUntil) {
          const freezeEnd = new Date(streakFrozenUntil);
          if (now < freezeEnd) {
            return 'frozen';
          }
        }

        if (daysDiff === 0) {
          return 'active'; // Already active today
        } else if (daysDiff === 1) {
          return 'at_risk'; // Need to record activity today
        } else {
          return 'broken'; // Missed more than 1 day
        }
      },

      useStreakFreeze: () => {
        const { freezesUsedThisMonth, freezeMonthStart, currentStreak } = get();
        
        // Reset freeze count if new month
        const currentMonthStart = getStartOfMonth();
        let usedThisMonth = freezesUsedThisMonth;
        
        if (!freezeMonthStart || new Date(freezeMonthStart).getTime() !== currentMonthStart.getTime()) {
          usedThisMonth = 0;
        }

        if (usedThisMonth >= FREEZES_PER_MONTH || currentStreak === 0) {
          return false;
        }

        // Apply freeze for 24 hours
        const freezeEnd = new Date();
        freezeEnd.setDate(freezeEnd.getDate() + FREEZE_DURATION_DAYS);

        set({
          freezesUsedThisMonth: usedThisMonth + 1,
          freezeMonthStart: currentMonthStart.toISOString(),
          streakFrozenUntil: freezeEnd.toISOString(),
        });

        return true;
      },

      canUseFreeze: (isPremium: boolean) => {
        // Grace Days are free for everyone per Decision #8.
        // Pro users get unlimited; free users get FREEZES_PER_MONTH / month.
        const { freezesUsedThisMonth, freezeMonthStart, currentStreak } = get();

        if (currentStreak === 0) return false;

        if (isPremium) return true;

        const currentMonthStart = getStartOfMonth();
        let usedThisMonth = freezesUsedThisMonth;
        if (!freezeMonthStart || new Date(freezeMonthStart).getTime() !== currentMonthStart.getTime()) {
          usedThisMonth = 0;
        }
        return usedThisMonth < FREEZES_PER_MONTH;
      },

      getFreezesRemaining: (isPremium: boolean) => {
        if (isPremium) return Number.POSITIVE_INFINITY;

        const { freezesUsedThisMonth, freezeMonthStart } = get();

        const currentMonthStart = getStartOfMonth();
        let usedThisMonth = freezesUsedThisMonth;
        if (!freezeMonthStart || new Date(freezeMonthStart).getTime() !== currentMonthStart.getTime()) {
          usedThisMonth = 0;
        }
        return Math.max(0, FREEZES_PER_MONTH - usedThisMonth);
      },

      claimMilestoneReward: (days: number) => {
        const { claimedMilestones, activeRewards } = get();
        
        // Check if already claimed
        if (claimedMilestones.includes(days)) {
          return null;
        }

        // Find the reward for this milestone
        const reward = MILESTONE_REWARDS.find(r => r.days === days);
        if (!reward) {
          return null;
        }

        // Calculate expiration
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + reward.duration);

        set({
          claimedMilestones: [...claimedMilestones, days],
          activeRewards: [
            ...activeRewards,
            { reward: reward.reward, expiresAt: expiresAt.toISOString() },
          ],
        });

        return reward;
      },

      hasActiveReward: (reward: MilestoneReward['reward']) => {
        const { activeRewards } = get();
        const now = new Date();
        
        return activeRewards.some(
          r => r.reward === reward && new Date(r.expiresAt) > now
        );
      },

      cleanupExpiredRewards: () => {
        const { activeRewards } = get();
        const now = new Date();
        
        const validRewards = activeRewards.filter(
          r => new Date(r.expiresAt) > now
        );

        if (validRewards.length !== activeRewards.length) {
          set({ activeRewards: validRewards });
        }
      },
    }),
    {
      name: 'choosegod-streak',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Convenience hooks
export const useCurrentStreak = () => useStreakStore((s) => s.currentStreak);
export const useLongestStreak = () => useStreakStore((s) => s.longestStreak);
export const useStreakStatus = () => useStreakStore((s) => s.checkStreakStatus());

/** Days With God \u2014 primary counter surfaced on Home. Never resets. */
export const useDaysWithGod = () => useStreakStore((s) => s.daysWithGod);
export const useFirstActivityDate = () =>
  useStreakStore((s) => s.firstActivityDate);
