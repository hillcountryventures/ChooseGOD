/**
 * verseCacheStore — standalone cache of downloaded Bible verses for offline use.
 *
 * Previously this was a slice inside `useStore.ts`. Extracted so that:
 *  - Cache writes don't trigger re-renders of chat / prayer / journal consumers.
 *  - The store has a single responsibility and can be tested in isolation.
 *
 * Usage:
 *   const cached = useVerseCacheStore((s) => s.getCachedVerse('John-3-16'));
 *   useVerseCacheStore.getState().cacheVerse({ book: 'John', chapter: 3, verse: 16, text: '...' });
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation?: string;
}

interface VerseCacheState {
  verses: Record<string, CachedVerse>;
  cacheVerse: (verse: CachedVerse) => void;
  getCachedVerse: (key: string) => CachedVerse | null;
  clearCache: () => void;
}

const keyFor = (v: CachedVerse) => `${v.book}-${v.chapter}-${v.verse}`;

export const useVerseCacheStore = create<VerseCacheState>()(
  persist(
    (set, get) => ({
      verses: {},
      cacheVerse: (verse) =>
        set((state) => ({
          verses: { ...state.verses, [keyFor(verse)]: verse },
        })),
      getCachedVerse: (key) => get().verses[key] ?? null,
      clearCache: () => set({ verses: {} }),
    }),
    {
      name: 'choosegod-verse-cache',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
