/**
 * useJourneyInsights Hook
 *
 * Aggregates spiritual journey data for the insights dashboard.
 * Provides computed analytics like spiritual health score, topic engagement,
 * prayer activity trends, and scripture engagement patterns.
 */

import { useMemo, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useJourneyStore } from '../store/journeyStore';
import { useStore } from '../store/useStore';
import { SpiritualMoment, MomentType, VerseSource } from '../types';

// =====================================================
// TYPES
// =====================================================

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  prayerMinutes: number;
  momentCount: number;
  types: MomentType[];
}

export interface TopicEngagement {
  id: string;
  emoji: string;
  label: string;
  chatCount: number;
  percentage: number;
  color: string;
}

export interface BibleBookEngagement {
  book: string;
  emoji: string;
  verseCount: number;
  gradient: [string, string];
}

export interface SpiritualHealthScore {
  score: number; // 0-100
  change: number; // percentage change from last period
  prayerDays: number;
  versesRead: number;
  stepsCompleted: number;
  message: string;
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
// CONSTANTS
// =====================================================

const TOPIC_CATEGORIES: Record<string, { emoji: string; keywords: string[]; color: string }> = {
  'love-relationships': {
    emoji: '❤️',
    keywords: ['love', 'relationship', 'marriage', 'dating', 'family', 'friend', 'forgive'],
    color: '#C9A962', // gold
  },
  'anxiety-peace': {
    emoji: '😰',
    keywords: ['anxiety', 'peace', 'worry', 'stress', 'calm', 'fear', 'rest', 'sleep'],
    color: '#8B9A7D', // sage
  },
  'purpose-calling': {
    emoji: '🎯',
    keywords: ['purpose', 'calling', 'career', 'work', 'mission', 'meaning', 'direction'],
    color: '#8B7355', // earth
  },
  'prayer-life': {
    emoji: '🙏',
    keywords: ['prayer', 'pray', 'intercession', 'fasting', 'devotion', 'worship'],
    color: '#E8D5A3', // goldLight
  },
  'faith-doubt': {
    emoji: '💪',
    keywords: ['faith', 'doubt', 'believe', 'trust', 'hope', 'question'],
    color: '#6366F1', // primary
  },
  'healing-restoration': {
    emoji: '💚',
    keywords: ['heal', 'healing', 'restoration', 'recover', 'pain', 'hurt', 'trauma'],
    color: '#22C55E', // success
  },
};

const BIBLE_BOOK_EMOJIS: Record<string, string> = {
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

const BOOK_GRADIENTS: [string, string][] = [
  ['rgba(201, 169, 98, 0.1)', 'rgba(232, 213, 163, 0.2)'], // gold
  ['rgba(139, 154, 125, 0.1)', 'rgba(184, 196, 173, 0.2)'], // sage
  ['rgba(139, 115, 85, 0.1)', 'rgba(166, 144, 128, 0.2)'], // earth
  ['rgba(232, 213, 163, 0.2)', 'rgba(253, 248, 243, 0.1)'], // goldLight
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getDayLabel(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function categorizeTopic(themes: string[], content: string): string | null {
  const text = (themes.join(' ') + ' ' + content).toLowerCase();
  
  for (const [categoryId, category] of Object.entries(TOPIC_CATEGORIES)) {
    if (category.keywords.some(keyword => text.includes(keyword))) {
      return categoryId;
    }
  }
  return null;
}

function extractBibleBooks(verses: VerseSource[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const verse of verses) {
    // Normalize book names (e.g., "1 Corinthians" -> "Corinthians")
    const book = verse.book.replace(/^\d+\s*/, '');
    counts[book] = (counts[book] || 0) + 1;
  }
  
  return counts;
}

function calculateSpiritualHealthScore(
  moments: SpiritualMoment[],
  prayers: number,
  versesRead: number,
  streak: number
): SpiritualHealthScore {
  // Weighted scoring system
  const prayerWeight = 0.3;
  const devotionalWeight = 0.25;
  const journalWeight = 0.2;
  const verseWeight = 0.15;
  const streakWeight = 0.1;
  
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentMoments = moments.filter(m => new Date(m.createdAt) >= last30Days);
  
  // Calculate component scores
  const prayerDays = new Set(
    recentMoments
      .filter(m => m.momentType === 'prayer')
      .map(m => formatDateKey(new Date(m.createdAt)))
  ).size;
  
  const devotionalCount = recentMoments.filter(m => m.momentType === 'devotional').length;
  const journalCount = recentMoments.filter(m => m.momentType === 'journal').length;
  
  // Score each component out of 100
  const prayerScore = Math.min(prayerDays / 25 * 100, 100); // 25 days = max
  const devotionalScore = Math.min(devotionalCount / 20 * 100, 100); // 20 devotionals = max
  const journalScore = Math.min(journalCount / 15 * 100, 100); // 15 journals = max
  const verseScore = Math.min(versesRead / 100 * 100, 100); // 100 verses = max
  const streakScore = Math.min(streak / 30 * 100, 100); // 30 day streak = max
  
  // Weighted average
  const score = Math.round(
    prayerScore * prayerWeight +
    devotionalScore * devotionalWeight +
    journalScore * journalWeight +
    verseScore * verseWeight +
    streakScore * streakWeight
  );
  
  // Determine encouraging message based on score
  let message = '';
  if (score >= 80) {
    message = "You're growing beautifully! Your prayer consistency and Scripture engagement have improved significantly this month.";
  } else if (score >= 60) {
    message = "Great progress on your spiritual journey! Keep building those daily habits with God.";
  } else if (score >= 40) {
    message = "You're taking meaningful steps in your faith. Consider adding a daily devotional time.";
  } else if (score >= 20) {
    message = "Every moment with God matters. Try starting with just 5 minutes of prayer each day.";
  } else {
    message = "God delights in every step you take toward Him. Start where you are – He's already there.";
  }
  
  // Calculate change (mock for now - would need historical data)
  const change = Math.round((Math.random() * 20) - 5); // -5% to +15%
  
  return {
    score,
    change,
    prayerDays,
    versesRead,
    stepsCompleted: recentMoments.filter(m => m.momentType === 'obedience_step').length,
    message,
  };
}

// =====================================================
// MAIN HOOK
// =====================================================

export function useJourneyInsights(): JourneyInsightsData {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moments, setMoments] = useState<SpiritualMoment[]>([]);
  const [chatLogs, setChatLogs] = useState<Array<{ query: string; themes?: string[]; created_at: string }>>([]);
  
  const user = useAuthStore((state) => state.user);
  const { currentStreak } = useJourneyStore();
  const activePrayers = useStore((state) => state.activePrayers);

  // Fetch all spiritual moments and chat logs
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch spiritual moments (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: momentsData, error: momentsError } = await supabase
        .from('spiritual_moments')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (momentsError) throw momentsError;

      // Fetch chat logs for topic analysis
      const { data: chatData, error: chatError } = await supabase
        .from('chat_logs')
        .select('query, created_at')
        .eq('user_id', user.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (chatError) throw chatError;

      // Transform moments data
      const transformedMoments: SpiritualMoment[] = (momentsData || []).map((row: any) => ({
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
      }));

      setMoments(transformedMoments);
      setChatLogs(chatData || []);
    } catch (err) {
      console.error('[useJourneyInsights] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute weekly activity (last 7 days)
  const weeklyActivity = useMemo((): DailyActivity[] => {
    const result: DailyActivity[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDateKey(date);
      
      const dayMoments = moments.filter(m => 
        formatDateKey(new Date(m.createdAt)) === dateKey
      );
      
      // Estimate prayer minutes based on prayer moments (assume avg 8 min per prayer)
      const prayerMoments = dayMoments.filter(m => m.momentType === 'prayer');
      const prayerMinutes = prayerMoments.length * 8;
      
      result.push({
        date: dateKey,
        dayLabel: getDayLabel(date),
        prayerMinutes,
        momentCount: dayMoments.length,
        types: [...new Set(dayMoments.map(m => m.momentType))],
      });
    }
    
    return result;
  }, [moments]);

  // Compute topics explored from chat logs and moments
  const topicsExplored = useMemo((): TopicEngagement[] => {
    const topicCounts: Record<string, number> = {};
    
    // Analyze chat logs
    for (const log of chatLogs) {
      const topic = categorizeTopic([], log.query);
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
    
    // Analyze moment themes
    for (const moment of moments) {
      const topic = categorizeTopic(moment.themes, moment.content);
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
    
    // Convert to sorted array
    const total = Object.values(topicCounts).reduce((a, b) => a + b, 0) || 1;
    
    return Object.entries(topicCounts)
      .map(([id, count]) => ({
        id,
        emoji: TOPIC_CATEGORIES[id]?.emoji || '📌',
        label: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' & '),
        chatCount: count,
        percentage: Math.round((count / total) * 100),
        color: TOPIC_CATEGORIES[id]?.color || '#8B7355',
      }))
      .sort((a, b) => b.chatCount - a.chatCount)
      .slice(0, 5);
  }, [chatLogs, moments]);

  // Compute Bible book engagement
  const bibleBooks = useMemo((): BibleBookEngagement[] => {
    const allVerses: VerseSource[] = moments.flatMap(m => m.linkedVerses || []);
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

  // Compute spiritual health score
  const spiritualHealth = useMemo((): SpiritualHealthScore => {
    const totalVerses = moments.flatMap(m => m.linkedVerses || []).length;
    return calculateSpiritualHealthScore(moments, activePrayers.length, totalVerses, currentStreak);
  }, [moments, activePrayers, currentStreak]);

  // Generate growth insight
  const growthInsight = useMemo((): GrowthInsight | null => {
    if (topicsExplored.length === 0) return null;
    
    const topTopic = topicsExplored[0];
    const suggestedVerses: Record<string, string> = {
      'anxiety-peace': 'Philippians 4:6-7',
      'love-relationships': '1 Corinthians 13:4-7',
      'purpose-calling': 'Jeremiah 29:11',
      'prayer-life': 'Matthew 6:9-13',
      'faith-doubt': 'Hebrews 11:1',
      'healing-restoration': 'Psalm 147:3',
    };
    
    return {
      id: 'insight-1',
      title: 'Growth Insight',
      content: `You've been exploring ${topTopic.label.toLowerCase()} topics more frequently. This suggests you're intentionally seeking God's guidance in this area. Consider deeper study in this theme.`,
      suggestedVerse: suggestedVerses[topTopic.id],
      icon: '💡',
    };
  }, [topicsExplored]);

  // Generate milestones
  const milestones = useMemo((): RecentMilestone[] => {
    const result: RecentMilestone[] = [];
    
    // Check streak milestone
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
    
    // Check verse milestone
    const totalVerses = moments.flatMap(m => m.linkedVerses || []).length;
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
    
    // Check steps milestone
    const stepsCompleted = moments.filter(m => m.momentType === 'obedience_step').length;
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
    
    // Check devotional milestone
    const devotionalCount = moments.filter(m => m.momentType === 'devotional').length;
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
