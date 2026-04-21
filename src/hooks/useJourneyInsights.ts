/**
 * useJourneyInsights Hook
 *
 * Aggregates spiritual journey data for the insights dashboard.
 * Now composes smaller domain hooks for maintainability.
 */

import { useMemo, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useJourneyStore } from '../store/journeyStore';
import { useStore } from '../store/useStore';
import { SpiritualMoment, MomentType, VerseSource } from '../types';

// Re-export sub-hook types for consumers
export type { SpiritualHealthScore } from './insights/useSpiritualHealth';
export type { TopicEngagement } from './insights/useTopicsExplored';
export type { BibleBookEngagement } from './insights/useBibleEngagement';

import { useSpiritualHealth } from './insights/useSpiritualHealth';
import type { SpiritualHealthScore } from './insights/useSpiritualHealth';
import { useTopicsExplored } from './insights/useTopicsExplored';
import type { TopicEngagement } from './insights/useTopicsExplored';
import { useBibleEngagement } from './insights/useBibleEngagement';
import type { BibleBookEngagement } from './insights/useBibleEngagement';
import { logger } from '../utils/logger';

// =====================================================
// TYPES (kept here for backward compat)
// =====================================================

export interface DailyActivity {
  date: string;
  dayLabel: string;
  prayerMinutes: number;
  momentCount: number;
  types: MomentType[];
}

export interface GrowthInsight {
  id: string;
  title: string;
  content: string;
  suggestedVerse?: string;
  icon: string;
}

export interface RecentMilestone {
  id: string;
  emoji: string;
  title: string;
  description: string;
  achievedAt: Date;
  gradient: [string, string];
}

export interface JourneyInsightsData {
  spiritualHealth: SpiritualHealthScore;
  weeklyActivity: DailyActivity[];
  topicsExplored: TopicEngagement[];
  bibleBooks: BibleBookEngagement[];
  growthInsight: GrowthInsight | null;
  milestones: RecentMilestone[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// =====================================================
// HELPERS
// =====================================================

function getDayLabel(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

const SUGGESTED_VERSES: Record<string, string> = {
  'anxiety-peace': 'Philippians 4:6-7',
  'love-relationships': '1 Corinthians 13:4-7',
  'purpose-calling': 'Jeremiah 29:11',
  'prayer-life': 'Matthew 6:9-13',
  'faith-doubt': 'Hebrews 11:1',
  'healing-restoration': 'Psalm 147:3',
};

// =====================================================
// MAIN HOOK
// =====================================================

export function useJourneyInsights(): JourneyInsightsData {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moments, setMoments] = useState<SpiritualMoment[]>([]);
  const [chatLogs, setChatLogs] = useState<
    Array<{ query: string; themes?: string[]; created_at: string }>
  >([]);
  // Real AI insight from the journey-insights Edge Function (cached 7d).
  // When present, overrides the rule-based growthInsight below.
  const [aiGrowthInsight, setAiGrowthInsight] = useState<GrowthInsight | null>(
    null,
  );

  const user = useAuthStore((state) => state.user);
  const { currentStreak } = useJourneyStore();
  const activePrayers = useStore((state) => state.activePrayers);

  // ---- Data fetching (unchanged) ----
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: momentsData, error: momentsError } = await supabase
        .from('spiritual_moments')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (momentsError) throw momentsError;

      const { data: chatData, error: chatError } = await supabase
        .from('chat_logs')
        .select('query, created_at')
        .eq('user_id', user.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (chatError) throw chatError;

      interface MomentRow {
        id: string;
        user_id: string;
        moment_type: MomentType;
        content?: string;
        ai_reflection?: string;
        linked_verses?: VerseSource[];
        sentiment_score?: number;
        themes?: string[];
        created_at: string;
        updated_at?: string;
        metadata?: Record<string, unknown>;
      }
      const transformedMoments: SpiritualMoment[] = (momentsData || []).map(
        (row: MomentRow) => ({
          id: row.id,
          userId: row.user_id,
          momentType: row.moment_type,
          content: row.content || '',
          aiReflection: row.ai_reflection,
          linkedVerses: row.linked_verses || [],
          sentimentScore: row.sentiment_score,
          themes: row.themes || [],
          createdAt: new Date(row.created_at),
          updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
          metadata: row.metadata,
        })
      );

      setMoments(transformedMoments);
      setChatLogs(chatData || []);

      // ---- Fetch real AI insight (journey-insights Edge Function) ----
      // Non-fatal: if this errors or returns nothing, we fall back to the
      // rule-based growthInsight below.
      try {
        const { data: aiData, error: aiErr } = await supabase.functions.invoke(
          'journey-insights',
          { body: { userId: user.id } },
        );
        if (!aiErr && aiData?.insight) {
          const ai = aiData.insight as {
            themes?: Array<{ label: string; summary: string }>;
            sentimentArc?: string;
            growthObservation?: string;
            growthOpportunity?: string;
            suggestedVerse?: string;
          };
          const title = ai.themes && ai.themes.length > 0
            ? ai.themes[0].label
            : 'Your Walk This Month';
          const content = [ai.sentimentArc, ai.growthObservation, ai.growthOpportunity]
            .filter(Boolean)
            .join('\n\n');
          if (content) {
            setAiGrowthInsight({
              id: 'ai-insight',
              title,
              content,
              suggestedVerse: ai.suggestedVerse,
              icon: '\u2728',
            });
          }
        }
      } catch (aiErr) {
        logger.warn('[useJourneyInsights] AI insight unavailable, using fallback', aiErr);
      }
    } catch (err) {
      logger.error('[useJourneyInsights] Fetch error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load insights'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Delegate to sub-hooks ----
  const spiritualHealth = useSpiritualHealth(
    moments,
    activePrayers.length,
    currentStreak
  );
  const topicsExplored = useTopicsExplored(chatLogs, moments);
  const bibleBooks = useBibleEngagement(moments);

  // ---- Weekly activity (simple enough to keep inline) ----
  const weeklyActivity = useMemo((): DailyActivity[] => {
    const result: DailyActivity[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDateKey(date);

      const dayMoments = moments.filter(
        (m) => formatDateKey(new Date(m.createdAt)) === dateKey
      );

      const prayerMoments = dayMoments.filter(
        (m) => m.momentType === 'prayer'
      );

      result.push({
        date: dateKey,
        dayLabel: getDayLabel(date),
        prayerMinutes: prayerMoments.length * 8,
        momentCount: dayMoments.length,
        types: [...new Set(dayMoments.map((m) => m.momentType))],
      });
    }

    return result;
  }, [moments]);

  // ---- Growth insight ----
  // Prefer real AI insight from journey-insights Edge Function.
  // Fall back to rule-based template only if AI unavailable.
  const growthInsight = useMemo((): GrowthInsight | null => {
    if (aiGrowthInsight) return aiGrowthInsight;
    if (topicsExplored.length === 0) return null;
    const topTopic = topicsExplored[0];

    return {
      id: 'insight-fallback',
      title: 'Growth Insight',
      content: `You've been exploring ${topTopic.label.toLowerCase()} topics more frequently. This suggests you're intentionally seeking God's guidance in this area. Consider deeper study in this theme.`,
      suggestedVerse: SUGGESTED_VERSES[topTopic.id],
      icon: '\u{1F4A1}',
    };
  }, [aiGrowthInsight, topicsExplored]);

  // ---- Milestones ----
  const milestones = useMemo((): RecentMilestone[] => {
    const result: RecentMilestone[] = [];

    if (currentStreak >= 7) {
      result.push({
        id: 'streak-7',
        emoji: currentStreak >= 30 ? '🏆' : '🔥',
        title: currentStreak >= 30 ? '30 Day Streak' : '7 Day Streak',
        description: 'Prayer consistency',
        achievedAt: new Date(),
        gradient: ['rgba(201, 169, 98, 0.2)', 'rgba(232, 213, 163, 0.3)'],
      });
    }

    const totalVerses = moments.flatMap((m) => m.linkedVerses || []).length;
    if (totalVerses >= 50) {
      result.push({
        id: 'verses-100',
        emoji: '📚',
        title: totalVerses >= 100 ? 'Bible Explorer' : 'Scripture Reader',
        description: `Read ${totalVerses}+ verses`,
        achievedAt: new Date(),
        gradient: ['rgba(139, 154, 125, 0.2)', 'rgba(184, 196, 173, 0.3)'],
      });
    }

    const stepsCompleted = moments.filter(
      (m) => m.momentType === 'obedience_step'
    ).length;
    if (stepsCompleted >= 5) {
      result.push({
        id: 'steps-10',
        emoji: '🙌',
        title: 'Faithful Walker',
        description: `${stepsCompleted} steps completed`,
        achievedAt: new Date(),
        gradient: ['rgba(139, 115, 85, 0.2)', 'rgba(166, 144, 128, 0.3)'],
      });
    }

    const devotionalCount = moments.filter(
      (m) => m.momentType === 'devotional'
    ).length;
    if (devotionalCount >= 10) {
      result.push({
        id: 'devotional-10',
        emoji: '🌅',
        title: 'Morning Seeker',
        description: `${devotionalCount} devotionals`,
        achievedAt: new Date(),
        gradient: ['rgba(232, 213, 163, 0.2)', 'rgba(253, 248, 243, 0.3)'],
      });
    }

    return result.slice(0, 3);
  }, [moments, currentStreak]);

  return {
    spiritualHealth,
    weeklyActivity,
    topicsExplored,
    bibleBooks,
    growthInsight,
    milestones,
    isLoading,
    error,
    refresh: fetchData,
  };
}
