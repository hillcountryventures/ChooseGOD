/**
 * useMemoryVerses - Memory verse management with spaced repetition
 * 
 * Uses SM-2 algorithm for optimal review scheduling:
 * - Easy (5): interval * 2.5, easeFactor + 0.1
 * - Good (4): interval * easeFactor
 * - Hard (3): interval * 1.2, easeFactor - 0.15
 * - Again (1-2): reset to 1 day, easeFactor - 0.2
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useStore } from '../store/useStore';
import { MemoryVerse } from '../types';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

interface UseMemoryVersesReturn {
  verses: MemoryVerse[];
  dueVerses: MemoryVerse[];
  isLoading: boolean;
  error: string | null;
  fetchVerses: () => Promise<void>;
  addVerse: (verse: Omit<MemoryVerse, 'id' | 'easeFactor' | 'intervalDays' | 'nextReview' | 'reviewCount' | 'createdAt'>) => Promise<boolean>;
  reviewVerse: (verseId: string, rating: ReviewRating) => Promise<void>;
  deleteVerse: (verseId: string) => Promise<void>;
}

// SM-2 algorithm constants
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

function calculateNextReview(
  currentInterval: number,
  currentEaseFactor: number,
  rating: ReviewRating
): { intervalDays: number; easeFactor: number; nextReview: Date } {
  let newInterval: number;
  let newEaseFactor = currentEaseFactor;

  switch (rating) {
    case 'easy':
      // Excellent recall - increase interval significantly
      newInterval = Math.round(currentInterval * 2.5);
      newEaseFactor = Math.min(currentEaseFactor + 0.15, 3.0);
      break;
    case 'good':
      // Good recall - standard increase
      newInterval = Math.round(currentInterval * currentEaseFactor);
      newEaseFactor = currentEaseFactor + 0.05;
      break;
    case 'hard':
      // Difficult recall - small increase
      newInterval = Math.round(currentInterval * 1.2);
      newEaseFactor = Math.max(currentEaseFactor - 0.15, MIN_EASE_FACTOR);
      break;
    case 'again':
    default:
      // Failed recall - reset
      newInterval = 1;
      newEaseFactor = Math.max(currentEaseFactor - 0.2, MIN_EASE_FACTOR);
      break;
  }

  // Minimum interval is 1 day
  newInterval = Math.max(newInterval, 1);

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    intervalDays: newInterval,
    easeFactor: newEaseFactor,
    nextReview,
  };
}

export function useMemoryVerses(): UseMemoryVersesReturn {
  const [verses, setVerses] = useState<MemoryVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAuthStore((state) => state.user);
  const setMemoryVersesDue = useStore((state) => state.setMemoryVersesDue);

  // Get verses that are due for review (nextReview <= now)
  const dueVerses = verses.filter((v) => new Date(v.nextReview) <= new Date());

  const fetchVerses = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('memory_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('next_review', { ascending: true });

      if (fetchError) throw fetchError;

      const mappedVerses: MemoryVerse[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        book: row.book,
        chapter: row.chapter,
        verseStart: row.verse_start,
        verseEnd: row.verse_end,
        text: row.text,
        translation: row.translation,
        mnemonic: row.mnemonic,
        storyVersion: row.story_version,
        easeFactor: row.ease_factor,
        intervalDays: row.interval_days,
        nextReview: new Date(row.next_review),
        reviewCount: row.review_count,
        createdAt: new Date(row.created_at),
      }));

      setVerses(mappedVerses);
      
      // Update global store with due verses
      const due = mappedVerses.filter((v) => new Date(v.nextReview) <= new Date());
      setMemoryVersesDue(due);
    } catch (err) {
      console.error('[useMemoryVerses] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch verses');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setMemoryVersesDue]);

  const addVerse = useCallback(async (
    verse: Omit<MemoryVerse, 'id' | 'easeFactor' | 'intervalDays' | 'nextReview' | 'reviewCount' | 'createdAt'>
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error: insertError } = await supabase
        .from('memory_verses')
        .insert({
          user_id: user.id,
          book: verse.book,
          chapter: verse.chapter,
          verse_start: verse.verseStart,
          verse_end: verse.verseEnd,
          text: verse.text,
          translation: verse.translation,
          mnemonic: verse.mnemonic,
          story_version: verse.storyVersion,
          ease_factor: DEFAULT_EASE_FACTOR,
          interval_days: 1,
          next_review: new Date().toISOString(),
          review_count: 0,
        });

      if (insertError) throw insertError;

      // Refresh the list
      await fetchVerses();
      return true;
    } catch (err) {
      console.error('[useMemoryVerses] Add error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add verse');
      return false;
    }
  }, [user?.id, fetchVerses]);

  const reviewVerse = useCallback(async (verseId: string, rating: ReviewRating) => {
    const verse = verses.find((v) => v.id === verseId);
    if (!verse) return;

    const { intervalDays, easeFactor, nextReview } = calculateNextReview(
      verse.intervalDays,
      verse.easeFactor,
      rating
    );

    try {
      const { error: updateError } = await supabase
        .from('memory_verses')
        .update({
          interval_days: intervalDays,
          ease_factor: easeFactor,
          next_review: nextReview.toISOString(),
          review_count: verse.reviewCount + 1,
        })
        .eq('id', verseId);

      if (updateError) throw updateError;

      // Update local state
      setVerses((prev) =>
        prev.map((v) =>
          v.id === verseId
            ? { ...v, intervalDays, easeFactor, nextReview, reviewCount: v.reviewCount + 1 }
            : v
        )
      );

      // Update due verses in global store
      const updatedVerses = verses.map((v) =>
        v.id === verseId
          ? { ...v, intervalDays, easeFactor, nextReview, reviewCount: v.reviewCount + 1 }
          : v
      );
      const due = updatedVerses.filter((v) => new Date(v.nextReview) <= new Date());
      setMemoryVersesDue(due);
    } catch (err) {
      console.error('[useMemoryVerses] Review error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update review');
    }
  }, [verses, setMemoryVersesDue]);

  const deleteVerse = useCallback(async (verseId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('memory_verses')
        .delete()
        .eq('id', verseId);

      if (deleteError) throw deleteError;

      setVerses((prev) => prev.filter((v) => v.id !== verseId));
      
      // Update due verses
      const updatedVerses = verses.filter((v) => v.id !== verseId);
      const due = updatedVerses.filter((v) => new Date(v.nextReview) <= new Date());
      setMemoryVersesDue(due);
    } catch (err) {
      console.error('[useMemoryVerses] Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete verse');
    }
  }, [verses, setMemoryVersesDue]);

  // Fetch on mount
  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  return {
    verses,
    dueVerses,
    isLoading,
    error,
    fetchVerses,
    addVerse,
    reviewVerse,
    deleteVerse,
  };
}
