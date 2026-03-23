/**
 * AI Reflection Service - Generate insights from journal entries
 *
 * Uses the companion edge function to analyze journal entries
 * and generate personalized spiritual reflections.
 */

import { logger } from '../utils/logger';
import type { SpiritualMoment } from '../types';
import { supabase } from './supabaseClient';

export interface JournalReflection {
  content: string;
  themes: string[];
  growthAreas: string[];
  encouragement: string;
}

/**
 * Generate an AI reflection from journal entries
 */
export async function generateJournalReflection(
  entries: SpiritualMoment[]
): Promise<JournalReflection> {
  if (entries.length < 3) {
    throw new Error('At least 3 journal entries required');
  }

  // Prepare entries for analysis (anonymize and clean)
  const preparedEntries = entries.slice(0, 20).map((entry) => ({
    content: entry.content,
    type: entry.type,
    date: entry.createdAt instanceof Date 
      ? entry.createdAt.toISOString().split('T')[0]
      : new Date(entry.createdAt).toISOString().split('T')[0],
    linkedVerses: entry.linkedVerses?.map((v) => v.reference) || [],
    mood: entry.mood,
  }));

  try {
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('journal-reflection', {
      body: { entries: preparedEntries },
    });

    if (error) {
      logger.error('Edge function error:', error);
      throw new Error('Failed to generate reflection');
    }

    return {
      content: data.content || 'Unable to generate reflection.',
      themes: data.themes || [],
      growthAreas: data.growthAreas || [],
      encouragement: data.encouragement || '',
    };
  } catch (err) {
    logger.error('Reflection service error:', err);
    
    // Return a fallback reflection if the service fails
    return generateFallbackReflection(entries);
  }
}

/**
 * Generate a simple fallback reflection locally
 * Used when the edge function is unavailable
 */
function generateFallbackReflection(entries: SpiritualMoment[]): JournalReflection {
  const entryCount = entries.length;
  const hasVerses = entries.some((e) => e.linkedVerses && e.linkedVerses.length > 0);
  const types = new Set(entries.map((e) => e.type));
  
  // Extract common words for themes (simple approach)
  const allContent = entries.map((e) => e.content.toLowerCase()).join(' ');
  const spiritualWords = [
    'prayer', 'pray', 'faith', 'trust', 'hope', 'love', 'peace', 'joy',
    'grateful', 'thankful', 'blessed', 'grace', 'mercy', 'forgive',
    'healing', 'strength', 'guidance', 'wisdom', 'patience',
  ];
  const foundThemes = spiritualWords.filter((word) => allContent.includes(word));

  return {
    content: `Over ${entryCount} journal entries, you've shown consistent dedication to documenting your spiritual journey. ${
      hasVerses 
        ? 'Your practice of connecting scripture to your reflections shows deep engagement with God\'s Word.' 
        : 'Consider linking Bible verses to your reflections to deepen your connection with Scripture.'
    } ${
      types.has('gratitude')
        ? 'Your expressions of gratitude reflect a heart attuned to God\'s blessings.'
        : ''
    }`,
    themes: foundThemes.slice(0, 5).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
    growthAreas: [
      'Continue your consistent journaling practice',
      hasVerses ? 'Deepen your verse meditation' : 'Link scripture to your reflections',
      'Share your journey with a trusted friend or mentor',
    ],
    encouragement: 'Your commitment to spiritual reflection is bearing fruit. Keep walking this path with God.',
  };
}
