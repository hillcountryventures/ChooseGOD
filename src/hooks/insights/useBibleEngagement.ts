/**
 * Bible Book Engagement Stats
 */
import { useMemo } from 'react';
import type { SpiritualMoment, VerseSource } from '../../types';

// =====================================================
// Types
// =====================================================

export interface BibleBookEngagement {
  book: string;
  emoji: string;
  verseCount: number;
  gradient: [string, string];
}

// =====================================================
// Constants
// =====================================================

export const BIBLE_BOOK_EMOJIS: Record<string, string> = {
  Psalms: '📖',
  Romans: '📜',
  John: '✨',
  Proverbs: '💎',
  Matthew: '📕',
  Genesis: '🌅',
  Isaiah: '🔮',
  Philippians: '💌',
  James: '⚡',
  Revelation: '🌟',
  Corinthians: '💪',
  Ephesians: '🏛️',
  Hebrews: '📚',
  Acts: '🔥',
  Luke: '📘',
  Mark: '📗',
  Galatians: '🕊️',
  Peter: '🪨',
  Exodus: '🌊',
  default: '📖',
};

export const BOOK_GRADIENTS: [string, string][] = [
  ['rgba(201, 169, 98, 0.1)', 'rgba(232, 213, 163, 0.2)'],
  ['rgba(139, 154, 125, 0.1)', 'rgba(184, 196, 173, 0.2)'],
  ['rgba(139, 115, 85, 0.1)', 'rgba(166, 144, 128, 0.2)'],
  ['rgba(232, 213, 163, 0.2)', 'rgba(253, 248, 243, 0.1)'],
];

// =====================================================
// Helpers
// =====================================================

function extractBibleBooks(verses: VerseSource[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const verse of verses) {
    const book = verse.book.replace(/^\d+\s*/, '');
    counts[book] = (counts[book] || 0) + 1;
  }
  return counts;
}

// =====================================================
// Hook
// =====================================================

export function useBibleEngagement(
  moments: SpiritualMoment[]
): BibleBookEngagement[] {
  return useMemo(() => {
    const allVerses: VerseSource[] = moments.flatMap(
      (m) => m.linkedVerses || []
    );
    const bookCounts = extractBibleBooks(allVerses);

    return Object.entries(bookCounts)
      .map(([book, count], index) => ({
        book,
        emoji: BIBLE_BOOK_EMOJIS[book] || BIBLE_BOOK_EMOJIS.default,
        verseCount: count,
        gradient: BOOK_GRADIENTS[index % BOOK_GRADIENTS.length],
      }))
      .sort((a, b) => b.verseCount - a.verseCount)
      .slice(0, 4);
  }, [moments]);
}
