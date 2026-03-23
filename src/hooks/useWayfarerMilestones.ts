/**
 * useWayfarerMilestones - Milestone tracking for Bible reading plan
 *
 * Calculates next milestone, days until completion, and "Power Up" status
 * when users maintain 7+ day streaks. Adds emotional weight to progress.
 *
 * Inspired by Hebrews 12:1 - "the race marked out for us"
 */

import { useMemo } from 'react';
import { ReadingPlanProgress } from '../types/readingPlan';

interface Milestone {
  day: number;
  title: string;
  description: string;
  icon: string;
}

const MILESTONES: Milestone[] = [
  {
    day: 5,
    title: 'First Week',
    description: 'Started your journey in His Word',
    icon: 'footsteps-outline',
  },
  {
    day: 50,
    title: 'Torah Complete',
    description: 'Finished the Law of Moses',
    icon: 'book-outline',
  },
  {
    day: 100,
    title: 'Quarter Mark',
    description: '100 days with the Lord',
    icon: 'trophy-outline',
  },
  {
    day: 150,
    title: 'Wisdom Books',
    description: 'Psalms & Proverbs treasured',
    icon: 'heart-outline',
  },
  {
    day: 200,
    title: 'Prophets',
    description: "Hearing God's voice through prophets",
    icon: 'megaphone-outline',
  },
  {
    day: 250,
    title: 'New Testament',
    description: 'Gospel journey begun',
    icon: 'cross-outline',
  },
  {
    day: 300,
    title: 'Epistles',
    description: "Paul's letters illuminated",
    icon: 'mail-outline',
  },
  {
    day: 365,
    title: 'Full Bible',
    description: 'Complete journey - Well done!',
    icon: 'checkmark-circle',
  },
];

export interface WayfarerMilestoneData {
  nextMilestone: Milestone | null;
  daysUntilNext: number | null;
  recentMilestone: Milestone | null;
  isPowerUp: boolean;
  progressPercentage: number;
}

export function useWayfarerMilestones(
  progress: ReadingPlanProgress | null
): WayfarerMilestoneData {
  return useMemo(() => {
    if (!progress) {
      return {
        nextMilestone: MILESTONES[0],
        daysUntilNext: null,
        recentMilestone: null,
        isPowerUp: false,
        progressPercentage: 0,
      };
    }

    const { currentDay, streakCount, completedDays } = progress;

    // Find next milestone ahead of current progress
    const nextMilestone =
      MILESTONES.find((m) => m.day > currentDay) || null;

    // Check if user just hit a milestone (within last 3 days)
    const recentMilestone = MILESTONES.find(
      (m) => m.day === currentDay || (m.day >= currentDay - 2 && m.day < currentDay)
    ) || null;

    // Power Up state: 7+ day streak (weekly consistency)
    const isPowerUp = streakCount >= 7;

    // Calculate days until next milestone
    const daysUntilNext = nextMilestone
      ? nextMilestone.day - currentDay
      : null;

    // Progress percentage
    const progressPercentage = (completedDays.length / 365) * 100;

    return {
      nextMilestone,
      daysUntilNext,
      recentMilestone,
      isPowerUp,
      progressPercentage,
    };
  }, [progress]);
}
