/**
 * Journey Store
 * Manages timeline, habits, and growth data for the Journey tab
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Every moment recorded is a step closer to knowing God more deeply
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { TABLES } from '../constants/database';
import {
  TimelineItem,
  SpiritualMoment,
  MomentType,
  GrowthInsight,
  VerseSource,
} from '../types';

// =====================================================
// TYPES
// =====================================================

export interface DayActivity {
  date: string; // YYYY-MM-DD
  hasActivity: boolean;
  types: MomentType[];
}

export interface HabitStats {
  totalDevotionals: number;
  totalPrayers: number;
  totalJournals: number;
  totalVerses: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ThemeData {
  theme: string;
  count: number;
  percentage: number;
}

export interface GrowthData {
  insight: string;
  themes: ThemeData[];
  anchorScriptures: VerseSource[];
  periodStart: Date;
  periodEnd: Date;
}

// =====================================================
// STORE INTERFACE
// =====================================================

interface JourneyState {
  // Timeline
  timelineItems: TimelineItem[];
  timelineLoading: boolean;
  timelineError: string | null;
  hasMoreTimeline: boolean;
  timelineOffset: number;

  // Habits
  calendarData: DayActivity[];
  habitStats: HabitStats;
  habitsLoading: boolean;
  selectedMonth: Date;

  // Growth
  growthData: GrowthData | null;
  growthLoading: boolean;
  allTimeThemes: ThemeData[];

  // Streak
  currentStreak: number;
  lastActivityDate: string | null;

  // Actions - Timeline
  fetchTimeline: (userId: string, reset?: boolean) => Promise<void>;
  loadMoreTimeline: (userId: string) => Promise<void>;
  addTimelineItem: (item: TimelineItem) => void;

  // Actions - Habits
  fetchHabitsData: (userId: string, month: Date) => Promise<void>;
  setSelectedMonth: (month: Date) => void;
  updateStreak: (userId: string) => Promise<void>;

  // Actions - Growth
  fetchGrowthData: (userId: string) => Promise<void>;
  generateInsight: (userId: string) => Promise<void>;

  // Utility
  clearStore: () => void;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMonthRange(month: Date): { start: string; end: string } {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  return {
    start: formatDateKey(start),
    end: formatDateKey(end),
  };
}

function mapRowToTimelineItem(row: any): TimelineItem {
  return {
    id: row.id,
    type: row.moment_type,
    title: getTitleForMomentType(row.moment_type),
    content: row.content,
    linkedVerses: row.linked_verses || [],
    themes: row.themes || [],
    createdAt: new Date(row.created_at),
  };
}

function getTitleForMomentType(type: MomentType): string {
  const titles: Record<MomentType, string> = {
    journal: 'Journal Entry',
    prayer: 'Prayer',
    devotional: 'Devotional',
    gratitude: 'Gratitude',
    confession: 'Confession',
    memory_practice: 'Memory Practice',
    obedience_step: 'Obedience Step',
    lectio: 'Lectio Divina',
    examen: 'Daily Examen',
    answered_prayer: 'Answered Prayer',
  };
  return titles[type] || 'Moment';
}

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

const TIMELINE_PAGE_SIZE = 20;

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      // Initial state
      timelineItems: [],
      timelineLoading: false,
      timelineError: null,
      hasMoreTimeline: true,
      timelineOffset: 0,
      calendarData: [],
      habitStats: {
        totalDevotionals: 0,
        totalPrayers: 0,
        totalJournals: 0,
        totalVerses: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      habitsLoading: false,
      selectedMonth: new Date(),
      growthData: null,
      growthLoading: false,
      allTimeThemes: [],
      currentStreak: 0,
      lastActivityDate: null,

      // =====================================================
      // TIMELINE ACTIONS
      // =====================================================

      fetchTimeline: async (userId: string, reset = false) => {
        if (reset) {
          set({ timelineOffset: 0, timelineItems: [], hasMoreTimeline: true });
        }

        set({ timelineLoading: true, timelineError: null });

        try {
          const offset = reset ? 0 : get().timelineOffset;

          const { data, error } = await supabase
            .from(TABLES.spiritualMoments)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + TIMELINE_PAGE_SIZE - 1);

          if (error) throw error;

          const items = (data || []).map(mapRowToTimelineItem);
          const hasMore = items.length === TIMELINE_PAGE_SIZE;

          set((state) => ({
            timelineItems: reset ? items : [...state.timelineItems, ...items],
            timelineLoading: false,
            hasMoreTimeline: hasMore,
            timelineOffset: offset + items.length,
          }));
        } catch (error) {
          console.error('Error fetching timeline:', error);
          set({
            timelineError: error instanceof Error ? error.message : 'Failed to fetch timeline',
            timelineLoading: false,
          });
        }
      },

      loadMoreTimeline: async (userId: string) => {
        const { hasMoreTimeline, timelineLoading } = get();
        if (!hasMoreTimeline || timelineLoading) return;
        await get().fetchTimeline(userId, false);
      },

      addTimelineItem: (item: TimelineItem) => {
        set((state) => ({
          timelineItems: [item, ...state.timelineItems],
        }));
      },

      // =====================================================
      // HABITS ACTIONS
      // =====================================================

      fetchHabitsData: async (userId: string, month: Date) => {
        set({ habitsLoading: true, selectedMonth: month });

        try {
          const { start, end } = getMonthRange(month);

          // Fetch moments for the month
          const { data: moments, error: momentsError } = await supabase
            .from(TABLES.spiritualMoments)
            .select('id, moment_type, created_at')
            .eq('user_id', userId)
            .gte('created_at', `${start}T00:00:00`)
            .lte('created_at', `${end}T23:59:59`);

          if (momentsError) throw momentsError;

          // Group by date
          const dateMap = new Map<string, { types: MomentType[] }>();
          (moments || []).forEach((m) => {
            const dateKey = formatDateKey(new Date(m.created_at));
            if (!dateMap.has(dateKey)) {
              dateMap.set(dateKey, { types: [] });
            }
            dateMap.get(dateKey)!.types.push(m.moment_type);
          });

          // Convert to calendar data
          const calendarData: DayActivity[] = [];
          const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const dateKey = formatDateKey(date);
            const activity = dateMap.get(dateKey);

            calendarData.push({
              date: dateKey,
              hasActivity: !!activity,
              types: activity?.types || [],
            });
          }

          // Calculate stats for the month
          const devotionals = (moments || []).filter((m) => m.moment_type === 'devotional').length;
          const prayers = (moments || []).filter((m) => m.moment_type === 'prayer').length;
          const journals = (moments || []).filter((m) => m.moment_type === 'journal').length;
          const verses = (moments || []).filter((m) => m.moment_type === 'memory_practice').length;

          // Fetch streak data
          const { data: streakData, error: streakError } = await supabase
            .from(TABLES.userProfiles)
            .select('current_streak, longest_streak')
            .eq('id', userId)
            .single();

          if (streakError && streakError.code !== 'PGRST116') {
            console.warn('Error fetching streak data:', streakError);
          }

          set({
            calendarData,
            habitStats: {
              totalDevotionals: devotionals,
              totalPrayers: prayers,
              totalJournals: journals,
              totalVerses: verses,
              currentStreak: streakData?.current_streak || 0,
              longestStreak: streakData?.longest_streak || 0,
            },
            habitsLoading: false,
            currentStreak: streakData?.current_streak || 0,
          });
        } catch (error) {
          console.error('Error fetching habits data:', error);
          set({ habitsLoading: false });
        }
      },

      setSelectedMonth: (month: Date) => {
        set({ selectedMonth: month });
      },

      updateStreak: async (userId: string) => {
        try {
          const today = formatDateKey(new Date());
          const { lastActivityDate, currentStreak } = get();

          // Check if already recorded today
          if (lastActivityDate === today) {
            return;
          }

          const yesterday = formatDateKey(new Date(Date.now() - 86400000));
          let newStreak = 1;

          if (lastActivityDate === yesterday) {
            // Consecutive day - increment streak
            newStreak = currentStreak + 1;
          }

          // Update in database
          const { error } = await supabase
            .from(TABLES.userProfiles)
            .upsert({
              id: userId,
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, get().habitStats.longestStreak),
              last_activity_date: today,
            });

          if (error) throw error;

          set({
            currentStreak: newStreak,
            lastActivityDate: today,
            habitStats: {
              ...get().habitStats,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, get().habitStats.longestStreak),
            },
          });
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      },

      // =====================================================
      // GROWTH ACTIONS
      // =====================================================

      fetchGrowthData: async (userId: string) => {
        set({ growthLoading: true });

        try {
          // Get the last 30 days of moments for theme analysis
          const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

          const { data: moments, error: momentsError } = await supabase
            .from(TABLES.spiritualMoments)
            .select('themes, linked_verses')
            .eq('user_id', userId)
            .gte('created_at', thirtyDaysAgo.toISOString());

          if (momentsError) throw momentsError;

          // Count themes
          const themeCount = new Map<string, number>();
          let totalThemes = 0;

          (moments || []).forEach((m) => {
            (m.themes || []).forEach((theme: string) => {
              themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
              totalThemes++;
            });
          });

          // Convert to sorted array with percentages
          const themes: ThemeData[] = Array.from(themeCount.entries())
            .map(([theme, count]) => ({
              theme,
              count,
              percentage: totalThemes > 0 ? Math.round((count / totalThemes) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          // Collect all linked verses for anchor scriptures
          const versesMap = new Map<string, VerseSource>();
          (moments || []).forEach((m) => {
            (m.linked_verses || []).forEach((v: VerseSource) => {
              const key = `${v.book}-${v.chapter}-${v.verse}`;
              if (!versesMap.has(key)) {
                versesMap.set(key, v);
              }
            });
          });

          const anchorScriptures = Array.from(versesMap.values()).slice(0, 5);

          // Fetch or generate insight
          const { data: insight, error: insightError } = await supabase
            .from(TABLES.growthInsights)
            .select('*')
            .eq('user_id', userId)
            .eq('insight_type', 'monthly')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          let insightText = '';
          if (!insightError && insight) {
            insightText = insight.narrative;
          } else {
            // Generate default insight based on themes
            if (themes.length > 0) {
              const topThemes = themes.slice(0, 3).map((t) => t.theme).join(', ');
              insightText = `This month you've been focusing on ${topThemes}. Your journey shows intentional growth in these areas. Keep seeking God's wisdom through His Word.`;
            } else {
              insightText = 'Start recording your spiritual moments to see personalized growth insights here.';
            }
          }

          set({
            growthData: {
              insight: insightText,
              themes,
              anchorScriptures,
              periodStart: thirtyDaysAgo,
              periodEnd: new Date(),
            },
            allTimeThemes: themes,
            growthLoading: false,
          });
        } catch (error) {
          console.error('Error fetching growth data:', error);
          set({ growthLoading: false });
        }
      },

      generateInsight: async (userId: string) => {
        // This would call an AI endpoint to generate a personalized insight
        // For now, we'll use the fetchGrowthData which includes basic insight generation
        await get().fetchGrowthData(userId);
      },

      // =====================================================
      // UTILITY ACTIONS
      // =====================================================

      clearStore: () => {
        set({
          timelineItems: [],
          timelineLoading: false,
          timelineError: null,
          hasMoreTimeline: true,
          timelineOffset: 0,
          calendarData: [],
          habitStats: {
            totalDevotionals: 0,
            totalPrayers: 0,
            totalJournals: 0,
            totalVerses: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
          habitsLoading: false,
          selectedMonth: new Date(),
          growthData: null,
          growthLoading: false,
          allTimeThemes: [],
          currentStreak: 0,
          lastActivityDate: null,
        });
      },
    }),
    {
      name: 'journey-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist streak data and selected month
        currentStreak: state.currentStreak,
        lastActivityDate: state.lastActivityDate,
        selectedMonth: state.selectedMonth,
      }),
    }
  )
);

// =====================================================
// SELECTORS
// =====================================================

export const useTimeline = () => useJourneyStore((state) => state.timelineItems);
export const useTimelineLoading = () => useJourneyStore((state) => state.timelineLoading);
export const useHabitStats = () => useJourneyStore((state) => state.habitStats);
export const useCalendarData = () => useJourneyStore((state) => state.calendarData);
export const useGrowthData = () => useJourneyStore((state) => state.growthData);
export const useCurrentStreak = () => useJourneyStore((state) => state.currentStreak);
export const useSelectedMonth = () => useJourneyStore((state) => state.selectedMonth);
