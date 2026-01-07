import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { RAGQueryResponse, Translation, VerseSource } from '../types';
import { TABLES, EDGE_FUNCTIONS } from '../constants/database';
import { BIBLE_DEFAULTS } from '../constants/strings';
import { SEARCH_LIMITS } from '../constants/limits';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Export these for direct fetch usage (streaming)
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug: Log Supabase configuration (remove in production)
if (__DEV__) {
  console.log('[Supabase] URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
  console.log('[Supabase] Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Query the Bible using RAG (Retrieval Augmented Generation)
 * This calls a Supabase Edge Function that:
 * 1. Generates embeddings for the query
 * 2. Performs vector similarity search on Bible verses
 * 3. Uses an LLM to generate a response with the retrieved context
 */
export async function queryBible(
  query: string,
  translation: Translation = BIBLE_DEFAULTS.translation as Translation,
  userId?: string
): Promise<RAGQueryResponse> {
  const startTime = Date.now();

  try {
    // Call the Supabase Edge Function for RAG query
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.queryBible, {
      body: {
        query,
        translation,
        userId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to query Bible');
    }

    const processingTime = Date.now() - startTime;

    return {
      response: data.response,
      sources: data.sources as VerseSource[],
      query,
      processingTime,
    };
  } catch (error) {
    console.error('Error querying Bible:', error);
    throw error;
  }
}

/**
 * Fetch a specific verse from the database
 */
export async function fetchVerse(
  book: string,
  chapter: number,
  verse: number,
  translation: Translation = BIBLE_DEFAULTS.translation as Translation
): Promise<VerseSource | null> {
  try {
    // Database stores translation as lowercase
    const translationLower = translation.toLowerCase();

    const { data, error } = await supabase
      .from(TABLES.bibleVerses)
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .eq('translation', translationLower)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows found

    if (error) {
      console.error('Error fetching verse:', error);
      return null;
    }

    if (!data) {
      console.log(`Verse not found: ${book} ${chapter}:${verse} (${translationLower})`);
      return null;
    }

    return {
      book: data.book,
      chapter: data.chapter,
      verse: data.verse,
      text: data.text,
      translation: data.translation.toUpperCase() as Translation,
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    return null;
  }
}

/**
 * Search verses by keyword (fallback when RAG is not available)
 */
export async function searchVerses(
  keyword: string,
  translation: Translation = BIBLE_DEFAULTS.translation as Translation,
  limit: number = SEARCH_LIMITS.semanticResults
): Promise<VerseSource[]> {
  try {
    // Database stores translation as lowercase
    const translationLower = translation.toLowerCase();

    const { data, error } = await supabase
      .from(TABLES.bibleVerses)
      .select('*')
      .eq('translation', translationLower)
      .ilike('text', `%${keyword}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching verses:', error);
      return [];
    }

    return data.map((row) => ({
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation.toUpperCase() as Translation,
    }));
  } catch (error) {
    console.error('Error searching verses:', error);
    return [];
  }
}

/**
 * Fetch all verses for a specific chapter
 */
export async function fetchChapter(
  book: string,
  chapter: number,
  translation: Translation = BIBLE_DEFAULTS.translation as Translation
): Promise<VerseSource[]> {
  try {
    // Database stores translation as lowercase
    const translationLower = translation.toLowerCase();

    const { data, error } = await supabase
      .from(TABLES.bibleVerses)
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('translation', translationLower)
      .order('verse', { ascending: true });

    if (error) {
      console.error('Error fetching chapter:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`No verses found for ${book} ${chapter} (${translationLower})`);
      return [];
    }

    return data.map((row) => ({
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation.toUpperCase() as Translation,
    }));
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return [];
  }
}

/**
 * Get the number of chapters in a book
 */
export async function getBookChapterCount(
  book: string,
  translation: Translation = BIBLE_DEFAULTS.translation as Translation
): Promise<number> {
  try {
    // Database stores translation as lowercase
    const translationLower = translation.toLowerCase();

    const { data, error } = await supabase
      .from(TABLES.bibleVerses)
      .select('chapter')
      .eq('book', book)
      .eq('translation', translationLower)
      .order('chapter', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 0;
    }

    return data[0].chapter;
  } catch (error) {
    console.error('Error getting chapter count:', error);
    return 0;
  }
}

/**
 * Fetch a verse in multiple translations for parallel comparison
 * Returns the verse in each requested translation (skips unavailable ones)
 */
export async function fetchVerseParallel(
  book: string,
  chapter: number,
  verse: number,
  translations: Translation[] = ['KJV', 'ASV', 'BBE']
): Promise<VerseSource[]> {
  try {
    // Convert translations to lowercase for database query
    const translationsLower = translations.map((t) => t.toLowerCase());

    const { data, error } = await supabase
      .from(TABLES.bibleVerses)
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .in('translation', translationsLower);

    if (error) {
      console.error('Error fetching parallel verses:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Sort by the order of requested translations
    const sortedData = data.sort((a, b) => {
      const indexA = translationsLower.indexOf(a.translation.toLowerCase());
      const indexB = translationsLower.indexOf(b.translation.toLowerCase());
      return indexA - indexB;
    });

    return sortedData.map((row) => ({
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation.toUpperCase() as Translation,
    }));
  } catch (error) {
    console.error('Error fetching parallel verses:', error);
    return [];
  }
}

/**
 * Update user profile preferences in Supabase
 * This syncs local preferences to the database for use by edge functions
 */
export async function updateUserProfile(
  userId: string,
  preferences: {
    preferredTranslation?: Translation;
    maturityLevel?: string;
    dailyDevotional?: boolean;
    eveningExamen?: boolean;
  }
): Promise<boolean> {
  try {
    const updates: Record<string, unknown> = {};

    if (preferences.preferredTranslation !== undefined) {
      // Store as lowercase to match database convention
      updates.preferred_translation = preferences.preferredTranslation.toLowerCase();
    }
    if (preferences.maturityLevel !== undefined) {
      updates.maturity_level = preferences.maturityLevel;
    }
    if (preferences.dailyDevotional !== undefined) {
      updates.daily_devotional = preferences.dailyDevotional;
    }
    if (preferences.eveningExamen !== undefined) {
      updates.evening_examen = preferences.eveningExamen;
    }

    if (Object.keys(updates).length === 0) {
      return true; // Nothing to update
    }

    const { error } = await supabase
      .from(TABLES.userProfiles)
      .upsert({
        id: userId,
        ...updates,
      });

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

/**
 * Fetch user profile from Supabase
 * Used to sync preferences on app load or sign in
 */
export async function fetchUserProfile(
  userId: string
): Promise<{
  preferredTranslation?: Translation;
  maturityLevel?: string;
  dailyDevotional?: boolean;
  eveningExamen?: boolean;
} | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.userProfiles)
      .select('preferred_translation, maturity_level, daily_devotional, evening_examen')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      preferredTranslation: data.preferred_translation?.toUpperCase() as Translation | undefined,
      maturityLevel: data.maturity_level,
      dailyDevotional: data.daily_devotional,
      eveningExamen: data.evening_examen,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
