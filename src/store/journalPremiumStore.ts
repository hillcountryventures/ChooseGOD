/**
 * Journal Premium Store - Time-gating + AI Reflection
 *
 * Free tier: 5 entries per month, 30-day access
 * Premium: Unlimited entries, full history, AI reflections
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SpiritualMoment } from '../types';

// Free tier limits
export const FREE_ENTRIES_PER_MONTH = 5;
export const FREE_ACCESS_DAYS = 30;

interface JournalPremiumState {
  // Entry tracking
  entriesThisMonth: number;
  monthStart: string | null; // ISO string

  // AI Reflection
  lastReflection: {
    generatedAt: string;
    content: string;
    themes: string[];
    growthAreas: string[];
    encouragement: string;
  } | null;
  reflectionLoading: boolean;

  // Actions
  canAddEntry: (isPremium: boolean) => boolean;
  getRemainingEntries: (isPremium: boolean) => number;
  recordEntry: () => void;
  
  canAccessEntry: (entry: SpiritualMoment, isPremium: boolean) => boolean;
  getAccessibleEntries: (entries: SpiritualMoment[], isPremium: boolean) => SpiritualMoment[];
  getLockedCount: (entries: SpiritualMoment[], isPremium: boolean) => number;
  
  setReflection: (reflection: JournalPremiumState['lastReflection']) => void;
  setReflectionLoading: (loading: boolean) => void;
  clearReflection: () => void;
}

const getStartOfMonth = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const useJournalPremiumStore = create<JournalPremiumState>()(
  persist(
    (set, get) => ({
      entriesThisMonth: 0,
      monthStart: null,
      lastReflection: null,
      reflectionLoading: false,

      canAddEntry: (isPremium: boolean) => {
        if (isPremium) return true;

        const { entriesThisMonth, monthStart } = get();
        const currentMonthStart = getStartOfMonth();

        // Reset if new month
        if (!monthStart || new Date(monthStart).getTime() !== currentMonthStart.getTime()) {
          return true; // New month, can add
        }

        return entriesThisMonth < FREE_ENTRIES_PER_MONTH;
      },

      getRemainingEntries: (isPremium: boolean) => {
        if (isPremium) return Infinity;

        const { entriesThisMonth, monthStart } = get();
        const currentMonthStart = getStartOfMonth();

        // Reset if new month
        if (!monthStart || new Date(monthStart).getTime() !== currentMonthStart.getTime()) {
          return FREE_ENTRIES_PER_MONTH;
        }

        return Math.max(0, FREE_ENTRIES_PER_MONTH - entriesThisMonth);
      },

      recordEntry: () => {
        const { monthStart } = get();
        const currentMonthStart = getStartOfMonth();

        // Reset if new month
        if (!monthStart || new Date(monthStart).getTime() !== currentMonthStart.getTime()) {
          set({
            entriesThisMonth: 1,
            monthStart: currentMonthStart.toISOString(),
          });
        } else {
          set((state) => ({
            entriesThisMonth: state.entriesThisMonth + 1,
          }));
        }
      },

      canAccessEntry: (entry: SpiritualMoment, isPremium: boolean) => {
        if (isPremium) return true;

        const entryDate = entry.createdAt instanceof Date 
          ? entry.createdAt.toISOString() 
          : entry.createdAt;
        
        return daysSince(entryDate) <= FREE_ACCESS_DAYS;
      },

      getAccessibleEntries: (entries: SpiritualMoment[], isPremium: boolean) => {
        if (isPremium) return entries;

        return entries.filter((entry) => {
          const entryDate = entry.createdAt instanceof Date 
            ? entry.createdAt.toISOString() 
            : entry.createdAt;
          return daysSince(entryDate) <= FREE_ACCESS_DAYS;
        });
      },

      getLockedCount: (entries: SpiritualMoment[], isPremium: boolean) => {
        if (isPremium) return 0;

        return entries.filter((entry) => {
          const entryDate = entry.createdAt instanceof Date 
            ? entry.createdAt.toISOString() 
            : entry.createdAt;
          return daysSince(entryDate) > FREE_ACCESS_DAYS;
        }).length;
      },

      setReflection: (reflection) => set({ lastReflection: reflection }),
      setReflectionLoading: (loading) => set({ reflectionLoading: loading }),
      clearReflection: () => set({ lastReflection: null }),
    }),
    {
      name: 'choosegod-journal-premium',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entriesThisMonth: state.entriesThisMonth,
        monthStart: state.monthStart,
        lastReflection: state.lastReflection,
      }),
    }
  )
);

// Convenience hooks
export const useCanAddEntry = (isPremium: boolean) => 
  useJournalPremiumStore((s) => s.canAddEntry(isPremium));
export const useRemainingEntries = (isPremium: boolean) => 
  useJournalPremiumStore((s) => s.getRemainingEntries(isPremium));
