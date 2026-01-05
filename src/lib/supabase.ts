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

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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
    const { data, error } = await supabase
      .from(TABLES.bibleVerses)
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .eq('translation', translation)
      .single();

    if (error) {
      console.error('Error fetching verse:', error);
      return null;
    }

    return {
      book: data.book,
      chapter: data.chapter,
      verse: data.verse,
      text: data.text,
      translation: data.translation as Translation,
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
    const { data, error } = await supabase
      .from(TABLES.bibleVerses)
      .select('*')
      .eq('translation', translation)
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
      translation: row.translation as Translation,
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
