/**
 * Offline Cache Store
 *
 * Manages offline verse caching for areas with no connectivity.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BibleVerseRow } from '../types';

// =====================================================
// Types
// =====================================================

export interface OfflineCacheState {
  offlineVerses: Record<string, BibleVerseRow>;

  // Actions
  cacheVerse: (verse: BibleVerseRow) => void;
  getCachedVerse: (key: string) => BibleVerseRow | null;
}

// =====================================================
// Store
// =====================================================

export const useOfflineCacheStore = create<OfflineCacheState>()(
  persist(
    (set) => ({
      offlineVerses: {},

      cacheVerse: (verse) =>
        set((state) => ({
          offlineVerses: {
            ...state.offlineVerses,
            [`${verse.book}-${verse.chapter}-${verse.verse}`]: verse,
          },
        })),

      getCachedVerse: (key: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = (set as any).getState?.() || {};
        return state.offlineVerses?.[key] || null;
      },
    }),
    {
      name: 'choosegod-offline-cache',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
