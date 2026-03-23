import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingProgressState {
  lastReadBook: string | null;
  lastReadChapter: number | null;
  lastReadTranslation: string | null;
  lastScrollPosition: number;
  lastReadAt: number | null; // timestamp ms

  setLastRead: (
    book: string,
    chapter: number,
    translation: string,
    scrollPos?: number
  ) => void;
  clearProgress: () => void;
}

export const useReadingProgressStore = create<ReadingProgressState>()(
  persist(
    (set) => ({
      lastReadBook: null,
      lastReadChapter: null,
      lastReadTranslation: null,
      lastScrollPosition: 0,
      lastReadAt: null,

      setLastRead: (book, chapter, translation, scrollPos = 0) =>
        set({
          lastReadBook: book,
          lastReadChapter: chapter,
          lastReadTranslation: translation,
          lastScrollPosition: scrollPos,
          lastReadAt: Date.now(),
        }),

      clearProgress: () =>
        set({
          lastReadBook: null,
          lastReadChapter: null,
          lastReadTranslation: null,
          lastScrollPosition: 0,
          lastReadAt: null,
        }),
    }),
    {
      name: 'choosegod-reading-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
