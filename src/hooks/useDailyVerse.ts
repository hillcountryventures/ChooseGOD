import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useStore } from '../store/useStore';
import { fetchVerse } from '../lib/supabase';
import { DailyVerse } from '../types';

// Curated list of popular/meaningful verses for daily devotional
// Note: Book names must match database exactly (e.g., "Psalms" not "Psalm")
const DAILY_VERSES: Array<{ book: string; chapter: number; verse: number }> = [
  { book: 'John', chapter: 3, verse: 16 },
  { book: 'Philippians', chapter: 4, verse: 13 },
  { book: 'Jeremiah', chapter: 29, verse: 11 },
  { book: 'Proverbs', chapter: 3, verse: 5 },
  { book: 'Romans', chapter: 8, verse: 28 },
  { book: 'Isaiah', chapter: 40, verse: 31 },
  { book: 'Psalms', chapter: 23, verse: 1 },
  { book: 'Matthew', chapter: 11, verse: 28 },
  { book: 'Joshua', chapter: 1, verse: 9 },
  { book: 'Psalms', chapter: 46, verse: 10 },
  { book: 'Romans', chapter: 12, verse: 2 },
  { book: 'Psalms', chapter: 119, verse: 105 },
  { book: 'Proverbs', chapter: 16, verse: 3 },
  { book: 'Isaiah', chapter: 41, verse: 10 },
  { book: 'Matthew', chapter: 6, verse: 33 },
  { book: 'Psalms', chapter: 27, verse: 1 },
  { book: '2 Timothy', chapter: 1, verse: 7 },
  { book: 'Hebrews', chapter: 11, verse: 1 },
  { book: 'Romans', chapter: 5, verse: 8 },
  { book: 'Ephesians', chapter: 2, verse: 8 },
  { book: 'Galatians', chapter: 5, verse: 22 },
  { book: 'James', chapter: 1, verse: 5 },
  { book: '1 Corinthians', chapter: 13, verse: 4 },
  { book: 'Philippians', chapter: 4, verse: 6 },
  { book: 'Psalms', chapter: 34, verse: 8 },
  { book: 'John', chapter: 14, verse: 6 },
  { book: 'Romans', chapter: 10, verse: 9 },
  { book: 'Psalms', chapter: 91, verse: 1 },
  { book: '1 John', chapter: 4, verse: 19 },
  { book: 'Matthew', chapter: 28, verse: 19 },
  { book: 'Deuteronomy', chapter: 31, verse: 6 },
];

// Fallback verse texts for when database is unavailable
const FALLBACK_VERSES: Record<string, string> = {
  'John-3-16': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
  'Philippians-4-13': 'I can do all things through Christ which strengtheneth me.',
  'Jeremiah-29-11': 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
  'Proverbs-3-5': 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
  'Romans-8-28': 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
  'Isaiah-40-31': 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
  'Psalms-23-1': 'The LORD is my shepherd; I shall not want.',
  'Matthew-11-28': 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
  'Joshua-1-9': 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
  'Psalms-46-10': 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',
};

// Get today's date string (uses device's local timezone for consistency)
const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function useDailyVerse() {
  const [isLoading, setIsLoading] = useState(false);
  const dailyVerse = useStore((state) => state.dailyVerse);
  const setDailyVerse = useStore((state) => state.setDailyVerse);
  const preferences = useStore((state) => state.preferences);

  // Track the last known app state for detecting foreground transitions
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Effect to automatically clear stale verse when date changes
  // This runs on mount and whenever dailyVerse changes
  useEffect(() => {
    const today = getTodayString();
    if (dailyVerse && dailyVerse.date !== today) {
      console.log('[useDailyVerse] Auto-clearing stale verse from:', dailyVerse.date);
      setDailyVerse(null);
    }
  }, [dailyVerse, setDailyVerse]);

  const fetchDailyVerse = useCallback(async (forceRefresh = false) => {
    const today = getTodayString();
    const currentTranslation = preferences.preferredTranslation;

    // Clear stale verse from a different day IMMEDIATELY
    if (dailyVerse && dailyVerse.date !== today) {
      console.log('[useDailyVerse] Clearing stale verse from:', dailyVerse.date, 'today is:', today);
      setDailyVerse(null);
    }

    // Return cached verse if still valid (same date AND same translation)
    if (!forceRefresh && dailyVerse?.date === today && dailyVerse?.translation === currentTranslation) {
      return dailyVerse;
    }

    setIsLoading(true);
    try {
      // Pick verse based on day of year for consistency
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      );
      const verseRef = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];

      // Try to fetch from database
      const fetchedVerse = await fetchVerse(
        verseRef.book,
        verseRef.chapter,
        verseRef.verse,
        preferences.preferredTranslation
      );

      let verseText: string;
      if (fetchedVerse) {
        verseText = fetchedVerse.text;
      } else {
        // Use fallback text if database unavailable
        const fallbackKey = `${verseRef.book}-${verseRef.chapter}-${verseRef.verse}`;
        verseText = FALLBACK_VERSES[fallbackKey] || 'Verse text unavailable';
      }

      const newVerse: DailyVerse = {
        verse: {
          book: verseRef.book,
          chapter: verseRef.chapter,
          verse: verseRef.verse,
          text: verseText,
        },
        date: getTodayString(), // Use consistent date format
        translation: currentTranslation,
      };

      setDailyVerse(newVerse);
      return newVerse;
    } catch (err) {
      console.error('Failed to fetch daily verse:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dailyVerse, preferences.preferredTranslation, setDailyVerse]);

  // Effect to refresh verse when app comes to foreground
  // This ensures the verse updates if the user leaves the app overnight
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // App is coming to the foreground (from background or inactive)
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const today = getTodayString();
        // Check if the cached verse is stale
        if (!dailyVerse || dailyVerse.date !== today) {
          console.log('[useDailyVerse] App foregrounded - fetching fresh verse');
          fetchDailyVerse(true); // Force refresh
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [dailyVerse, fetchDailyVerse]);

  return {
    dailyVerse,
    fetchDailyVerse,
    isLoading,
  };
}
