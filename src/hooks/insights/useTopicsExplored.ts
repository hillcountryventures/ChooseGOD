/**
 * Topic Categorization for Journey Insights
 */
import { useMemo } from 'react';
import type { SpiritualMoment } from '../../types';

// =====================================================
// Types
// =====================================================

export interface TopicEngagement {
  id: string;
  emoji: string;
  label: string;
  chatCount: number;
  percentage: number;
  color: string;
}

// =====================================================
// Constants
// =====================================================

export const TOPIC_CATEGORIES: Record<
  string,
  { emoji: string; keywords: string[]; color: string }
> = {
  'love-relationships': {
    emoji: '❤️',
    keywords: [
      'love', 'relationship', 'marriage', 'dating', 'family', 'friend', 'forgive',
    ],
    color: '#C9A962',
  },
  'anxiety-peace': {
    emoji: '😰',
    keywords: [
      'anxiety', 'peace', 'worry', 'stress', 'calm', 'fear', 'rest', 'sleep',
    ],
    color: '#8B9A7D',
  },
  'purpose-calling': {
    emoji: '🎯',
    keywords: [
      'purpose', 'calling', 'career', 'work', 'mission', 'meaning', 'direction',
    ],
    color: '#8B7355',
  },
  'prayer-life': {
    emoji: '🙏',
    keywords: [
      'prayer', 'pray', 'intercession', 'fasting', 'devotion', 'worship',
    ],
    color: '#E8D5A3',
  },
  'faith-doubt': {
    emoji: '💪',
    keywords: ['faith', 'doubt', 'believe', 'trust', 'hope', 'question'],
    color: '#6366F1',
  },
  'healing-restoration': {
    emoji: '💚',
    keywords: [
      'heal', 'healing', 'restoration', 'recover', 'pain', 'hurt', 'trauma',
    ],
    color: '#22C55E',
  },
};

// =====================================================
// Helpers
// =====================================================

export function categorizeTopic(
  themes: string[],
  content: string
): string | null {
  const text = (themes.join(' ') + ' ' + content).toLowerCase();
  for (const [categoryId, category] of Object.entries(TOPIC_CATEGORIES)) {
    if (category.keywords.some((keyword) => text.includes(keyword))) {
      return categoryId;
    }
  }
  return null;
}

// =====================================================
// Hook
// =====================================================

export function useTopicsExplored(
  chatLogs: Array<{ query: string; themes?: string[]; created_at: string }>,
  moments: SpiritualMoment[]
): TopicEngagement[] {
  return useMemo(() => {
    const topicCounts: Record<string, number> = {};

    for (const log of chatLogs) {
      const topic = categorizeTopic([], log.query);
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }

    for (const moment of moments) {
      const topic = categorizeTopic(moment.themes, moment.content);
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }

    const total =
      Object.values(topicCounts).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(topicCounts)
      .map(([id, count]) => ({
        id,
        emoji: TOPIC_CATEGORIES[id]?.emoji || '📌',
        label: id
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' & '),
        chatCount: count,
        percentage: Math.round((count / total) * 100),
        color: TOPIC_CATEGORIES[id]?.color || '#8B7355',
      }))
      .sort((a, b) => b.chatCount - a.chatCount)
      .slice(0, 5);
  }, [chatLogs, moments]);
}
