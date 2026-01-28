/**
 * Spiritual Health Score Calculation
 */
import { useMemo } from 'react';
import type { SpiritualMoment } from '../../types';

export interface SpiritualHealthScore {
  score: number; // 0-100
  change: number; // percentage change from last period
  prayerDays: number;
  versesRead: number;
  stepsCompleted: number;
  message: string;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function calculateSpiritualHealthScore(
  moments: SpiritualMoment[],
  prayers: number,
  versesRead: number,
  streak: number
): SpiritualHealthScore {
  const prayerWeight = 0.3;
  const devotionalWeight = 0.25;
  const journalWeight = 0.2;
  const verseWeight = 0.15;
  const streakWeight = 0.1;

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentMoments = moments.filter(
    (m) => new Date(m.createdAt) >= last30Days
  );

  const prayerDays = new Set(
    recentMoments
      .filter((m) => m.momentType === 'prayer')
      .map((m) => formatDateKey(new Date(m.createdAt)))
  ).size;

  const devotionalCount = recentMoments.filter(
    (m) => m.momentType === 'devotional'
  ).length;
  const journalCount = recentMoments.filter(
    (m) => m.momentType === 'journal'
  ).length;

  const prayerScore = Math.min((prayerDays / 25) * 100, 100);
  const devotionalScore = Math.min((devotionalCount / 20) * 100, 100);
  const journalScore = Math.min((journalCount / 15) * 100, 100);
  const verseScore = Math.min((versesRead / 100) * 100, 100);
  const streakScore = Math.min((streak / 30) * 100, 100);

  const score = Math.round(
    prayerScore * prayerWeight +
      devotionalScore * devotionalWeight +
      journalScore * journalWeight +
      verseScore * verseWeight +
      streakScore * streakWeight
  );

  let message = '';
  if (score >= 80) {
    message =
      "You're growing beautifully! Your prayer consistency and Scripture engagement have improved significantly this month.";
  } else if (score >= 60) {
    message =
      'Great progress on your spiritual journey! Keep building those daily habits with God.';
  } else if (score >= 40) {
    message =
      "You're taking meaningful steps in your faith. Consider adding a daily devotional time.";
  } else if (score >= 20) {
    message =
      'Every moment with God matters. Try starting with just 5 minutes of prayer each day.';
  } else {
    message =
      "God delights in every step you take toward Him. Start where you are – He's already there.";
  }

  // Calculate change by comparing to previous 7-day window
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const previousMoments = moments.filter((m) => {
    const d = new Date(m.createdAt);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  let change = 0;
  if (previousMoments.length > 0) {
    const prevPrayerDays = new Set(
      previousMoments
        .filter((m) => m.momentType === 'prayer')
        .map((m) => formatDateKey(new Date(m.createdAt)))
    ).size;
    const prevDevotionalCount = previousMoments.filter(
      (m) => m.momentType === 'devotional'
    ).length;
    const prevJournalCount = previousMoments.filter(
      (m) => m.momentType === 'journal'
    ).length;
    const prevVerses = previousMoments.flatMap(
      (m) => m.linkedVerses || []
    ).length;

    const prevPrayerScore = Math.min((prevPrayerDays / 25) * 100, 100);
    const prevDevotionalScore = Math.min(
      (prevDevotionalCount / 20) * 100,
      100
    );
    const prevJournalScore = Math.min((prevJournalCount / 15) * 100, 100);
    const prevVerseScore = Math.min((prevVerses / 100) * 100, 100);

    const prevScore = Math.round(
      prevPrayerScore * prayerWeight +
        prevDevotionalScore * devotionalWeight +
        prevJournalScore * journalWeight +
        prevVerseScore * verseWeight
    );

    change =
      prevScore > 0
        ? Math.round(((score - prevScore) / prevScore) * 100)
        : 0;
  }

  return {
    score,
    change,
    prayerDays,
    versesRead,
    stepsCompleted: recentMoments.filter(
      (m) => m.momentType === 'obedience_step'
    ).length,
    message,
  };
}

export function useSpiritualHealth(
  moments: SpiritualMoment[],
  activePrayersCount: number,
  currentStreak: number
): SpiritualHealthScore {
  return useMemo(() => {
    const totalVerses = moments.flatMap((m) => m.linkedVerses || []).length;
    return calculateSpiritualHealthScore(
      moments,
      activePrayersCount,
      totalVerses,
      currentStreak
    );
  }, [moments, activePrayersCount, currentStreak]);
}
