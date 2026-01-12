/**
 * useMilestones Hook
 *
 * Detects and tracks spiritual milestones based on user activity.
 * "Biblical altars" commemorate encounters with God (Genesis 12:7, Joshua 4:20-24).
 */

import { useMemo } from 'react';
import { SpiritualMoment } from '../types';

export interface Milestone {
  id: string;
  type: 'streak' | 'verse_count' | 'prayer_count' | 'journal_count' | 'devotional_count';
  title: string;
  description: string;
  icon: string;
  scripture: string;
  scriptureRef: string;
  achieved: boolean;
  achievedAt?: Date;
  progress: number; // 0-100
  target: number;
  current: number;
}

interface UseMilestonesReturn {
  milestones: Milestone[];
  recentAchievements: Milestone[];
  totalAchieved: number;
  nextMilestone: Milestone | null;
}

// Milestone definitions with biblical references
const MILESTONE_DEFINITIONS = [
  // Streak milestones
  {
    type: 'streak' as const,
    target: 7,
    title: '7-Day Consistency',
    description: 'Seven days of faithful engagement',
    icon: 'flame',
    scripture: 'And on the seventh day God finished his work.',
    scriptureRef: 'Genesis 2:2',
  },
  {
    type: 'streak' as const,
    target: 30,
    title: '30-Day Prayer Streak',
    description: 'A month of unbroken devotion',
    icon: 'trophy',
    scripture: 'Daniel...got down on his knees three times a day and prayed.',
    scriptureRef: 'Daniel 6:10',
  },
  {
    type: 'streak' as const,
    target: 40,
    title: '40 Days in the Wilderness',
    description: 'Following Jesus into the desert',
    icon: 'fitness',
    scripture: 'Jesus was led by the Spirit into the wilderness...forty days.',
    scriptureRef: 'Matthew 4:1-2',
  },
  {
    type: 'streak' as const,
    target: 100,
    title: '100 Days of Faithfulness',
    description: 'Enduring commitment to God',
    icon: 'ribbon',
    scripture: 'Let us run with endurance the race that is set before us.',
    scriptureRef: 'Hebrews 12:1',
  },

  // Verse milestones
  {
    type: 'verse_count' as const,
    target: 10,
    title: 'First 10 Verses',
    description: 'Beginning to hide God\'s Word in your heart',
    icon: 'bookmark',
    scripture: 'I have stored up your word in my heart.',
    scriptureRef: 'Psalm 119:11',
  },
  {
    type: 'verse_count' as const,
    target: 50,
    title: '50 Verses Treasured',
    description: 'Building a foundation on the Word',
    icon: 'library',
    scripture: 'Your word is a lamp to my feet and a light to my path.',
    scriptureRef: 'Psalm 119:105',
  },
  {
    type: 'verse_count' as const,
    target: 100,
    title: '100 Verses Memorized',
    description: 'Like David, hiding God\'s Word in your heart',
    icon: 'school',
    scripture: 'I have hidden your word in my heart that I might not sin.',
    scriptureRef: 'Psalm 119:11',
  },

  // Prayer milestones
  {
    type: 'prayer_count' as const,
    target: 10,
    title: 'Faithful Intercessor',
    description: 'Ten prayers lifted to Heaven',
    icon: 'heart',
    scripture: 'The prayer of a righteous person is powerful and effective.',
    scriptureRef: 'James 5:16',
  },
  {
    type: 'prayer_count' as const,
    target: 50,
    title: '50 Prayers Offered',
    description: 'Persistent in prayer',
    icon: 'heart-circle',
    scripture: 'Pray without ceasing.',
    scriptureRef: '1 Thessalonians 5:17',
  },
  {
    type: 'prayer_count' as const,
    target: 100,
    title: '100 Prayers Recorded',
    description: 'A journal of God\'s faithfulness',
    icon: 'heart-half',
    scripture: 'Do not be anxious about anything, but in everything by prayer...',
    scriptureRef: 'Philippians 4:6',
  },

  // Journal milestones
  {
    type: 'journal_count' as const,
    target: 10,
    title: '10 Reflections',
    description: 'Documenting your journey with God',
    icon: 'create',
    scripture: 'Remember the days of old; consider the years of many generations.',
    scriptureRef: 'Deuteronomy 32:7',
  },
  {
    type: 'journal_count' as const,
    target: 50,
    title: '50 Journal Entries',
    description: 'A testimony of God\'s faithfulness',
    icon: 'book',
    scripture: 'Write this as a memorial in a book.',
    scriptureRef: 'Exodus 17:14',
  },

  // Devotional milestones
  {
    type: 'devotional_count' as const,
    target: 10,
    title: '10 Devotionals',
    description: 'Seeking God daily',
    icon: 'sunny',
    scripture: 'Seek first the kingdom of God and his righteousness.',
    scriptureRef: 'Matthew 6:33',
  },
  {
    type: 'devotional_count' as const,
    target: 30,
    title: '30 Days of Devotion',
    description: 'A month of morning mercies',
    icon: 'sunny',
    scripture: 'His mercies are new every morning.',
    scriptureRef: 'Lamentations 3:23',
  },
];

export function useMilestones(moments: SpiritualMoment[]): UseMilestonesReturn {
  const milestones = useMemo(() => {
    // Calculate current stats
    const stats = {
      streak: calculateStreak(moments),
      verse_count: moments.filter((m) => m.momentType === 'memory_practice').length,
      prayer_count: moments.filter((m) => m.momentType === 'prayer').length,
      journal_count: moments.filter((m) => m.momentType === 'journal').length,
      devotional_count: moments.filter((m) => m.momentType === 'devotional').length,
    };

    // Map definitions to milestone objects
    return MILESTONE_DEFINITIONS.map((def) => {
      const current = stats[def.type] || 0;
      const progress = Math.min((current / def.target) * 100, 100);
      const achieved = current >= def.target;

      return {
        id: `${def.type}-${def.target}`,
        type: def.type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        scripture: def.scripture,
        scriptureRef: def.scriptureRef,
        achieved,
        achievedAt: achieved ? getAchievementDate(moments, def.type, def.target) : undefined,
        progress,
        target: def.target,
        current,
      };
    });
  }, [moments]);

  const recentAchievements = useMemo(() => {
    return milestones
      .filter((m) => m.achieved && m.achievedAt)
      .sort((a, b) => (b.achievedAt!.getTime() - a.achievedAt!.getTime()))
      .slice(0, 5);
  }, [milestones]);

  const totalAchieved = useMemo(() => {
    return milestones.filter((m) => m.achieved).length;
  }, [milestones]);

  const nextMilestone = useMemo(() => {
    const unachieved = milestones.filter((m) => !m.achieved);
    if (unachieved.length === 0) return null;

    // Return the one with highest progress
    return unachieved.sort((a, b) => b.progress - a.progress)[0];
  }, [milestones]);

  return {
    milestones,
    recentAchievements,
    totalAchieved,
    nextMilestone,
  };
}

// Calculate current streak (simplified - counts unique days with activity)
function calculateStreak(moments: SpiritualMoment[]): number {
  if (moments.length === 0) return 0;

  // Get unique dates with activity
  const dates = new Set(
    moments.map((m) => {
      const d = new Date(m.createdAt);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    })
  );

  // For now, return the count of unique days
  // A proper implementation would check for consecutive days
  return dates.size;
}

// Get the date when a milestone was achieved
function getAchievementDate(
  moments: SpiritualMoment[],
  type: string,
  target: number
): Date | undefined {
  const relevantMoments = moments.filter((m) => {
    switch (type) {
      case 'verse_count':
        return m.momentType === 'memory_practice';
      case 'prayer_count':
        return m.momentType === 'prayer';
      case 'journal_count':
        return m.momentType === 'journal';
      case 'devotional_count':
        return m.momentType === 'devotional';
      default:
        return true;
    }
  });

  // Sort by date and return the date of the target-th moment
  const sorted = relevantMoments.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sorted[target - 1] ? new Date(sorted[target - 1].createdAt) : undefined;
}
