import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  ReadingPlan,
  PlanSection,
  UserReadingProgress,
  ReadingPlanProgress,
  TodaysReading,
  WayfarerState,
  toReadingPlan,
  toPlanSection,
  toUserReadingProgress,
  toReadingPlanProgress,
  toTodaysReading,
  ReadingPlanRow,
  PlanSectionRow,
  UserReadingProgressRow,
  ReadingPlanProgressRow,
  TodaysReadingRow,
  VerseReference,
} from '../types/readingPlan';
import { TABLES, RPC_FUNCTIONS } from '../constants';

// =====================================================
// WAYFARER INTERVENTION THRESHOLD
// =====================================================

const INTERVENTION_THRESHOLD_DAYS = 2;

// =====================================================
// STORE INTERFACE
// =====================================================

interface ReadingPlanState {
  // Available plans
  availablePlans: ReadingPlan[];
  plansLoading: boolean;
  plansError: string | null;

  // User progress
  activeProgress: ReadingPlanProgress | null;
  progressLoading: boolean;

  // Today's reading
  todaysReading: TodaysReading | null;
  todaysReadingLoading: boolean;

  // Wayfarer adaptive state
  wayfarerState: WayfarerState;

  // Current reading session
  currentSection: PlanSection | null;
  sessionStartedAt: Date | null;

  // Actions - Plans
  fetchAvailablePlans: () => Promise<void>;
  fetchPlanById: (planId: string) => Promise<ReadingPlan | null>;
  fetchPlanSection: (planId: string, dayNumber: number) => Promise<PlanSection | null>;

  // Actions - Progress
  fetchUserProgress: (userId: string) => Promise<void>;
  enrollInPlan: (userId: string, planId: string) => Promise<UserReadingProgress | null>;
  unenrollFromPlan: (progressId: string) => Promise<boolean>;

  // Actions - Reading
  fetchTodaysReading: (userId: string, planId?: string) => Promise<void>;
  startReadingSession: () => void;
  completeReadingDay: (
    progressId: string,
    dayNumber: number,
    reflection?: string
  ) => Promise<boolean>;

  // Actions - Wayfarer Adaptive
  checkWayfarerStatus: (userId: string) => Promise<void>;
  applyGracePath: (progressId: string, aiSummary: string) => Promise<boolean>;
  applyPatientPath: (progressId: string) => Promise<boolean>;

  // Actions - Utility
  setWayfarerState: (state: Partial<WayfarerState>) => void;
  clearStore: () => void;
}

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

export const useReadingPlanStore = create<ReadingPlanState>()(
  persist(
    (set, get) => ({
      // Initial state
      availablePlans: [],
      plansLoading: false,
      plansError: null,
      activeProgress: null,
      progressLoading: false,
      todaysReading: null,
      todaysReadingLoading: false,
      wayfarerState: {
        status: 'normal',
        daysMissed: 0,
        missedReadingTitles: [],
      },
      currentSection: null,
      sessionStartedAt: null,

      // =====================================================
      // PLANS ACTIONS
      // =====================================================

      fetchAvailablePlans: async () => {
        set({ plansLoading: true, plansError: null });
        try {
          const { data, error } = await supabase
            .from(TABLES.readingPlans)
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

          if (error) throw error;

          const plans = (data as ReadingPlanRow[]).map(toReadingPlan);
          set({ availablePlans: plans, plansLoading: false });
        } catch (error) {
          console.error('Error fetching reading plans:', error);
          set({
            plansError: error instanceof Error ? error.message : 'Failed to fetch plans',
            plansLoading: false,
          });
        }
      },

      fetchPlanById: async (planId: string) => {
        try {
          const { data, error } = await supabase
            .from(TABLES.readingPlans)
            .select('*')
            .eq('id', planId)
            .single();

          if (error) throw error;
          return toReadingPlan(data as ReadingPlanRow);
        } catch (error) {
          console.error('Error fetching plan by ID:', error);
          return null;
        }
      },

      fetchPlanSection: async (planId: string, dayNumber: number) => {
        try {
          const { data, error } = await supabase
            .from(TABLES.planSections)
            .select('*')
            .eq('plan_id', planId)
            .eq('day_number', dayNumber)
            .single();

          if (error) throw error;

          const section = toPlanSection(data as PlanSectionRow);
          set({ currentSection: section });
          return section;
        } catch (error) {
          console.error('Error fetching plan section:', error);
          return null;
        }
      },

      // =====================================================
      // PROGRESS ACTIONS
      // =====================================================

      fetchUserProgress: async (userId: string) => {
        set({ progressLoading: true });
        try {
          const { data, error } = await supabase.rpc(
            RPC_FUNCTIONS.getUserReadingPlanProgress,
            { p_user_id: userId }
          );

          if (error) throw error;

          // Get the first (most recent) active progress
          const progressData = data?.[0] as ReadingPlanProgressRow | undefined;
          const progress = progressData ? toReadingPlanProgress(progressData) : null;

          set({ activeProgress: progress, progressLoading: false });

          // Update wayfarer state if we have progress
          if (progress) {
            get().checkWayfarerStatus(userId);
          }
        } catch (error) {
          console.error('Error fetching user progress:', error);
          set({ progressLoading: false });
        }
      },

      enrollInPlan: async (userId: string, planId: string) => {
        try {
          const startDate = new Date();
          const plannedEndDate = new Date();
          plannedEndDate.setDate(plannedEndDate.getDate() + 365);

          const { data, error } = await supabase
            .from(TABLES.userReadingProgress)
            .insert({
              user_id: userId,
              plan_id: planId,
              current_day: 1,
              completed_days: [],
              is_adaptive_mode_active: false,
              is_active: true,
              start_date: startDate.toISOString().split('T')[0],
              planned_end_date: plannedEndDate.toISOString().split('T')[0],
              streak_count: 0,
              longest_streak: 0,
              total_chapters_read: 0,
            })
            .select('*')
            .single();

          if (error) throw error;

          const progress = toUserReadingProgress(data as UserReadingProgressRow);

          // Refresh the full progress to get computed fields
          await get().fetchUserProgress(userId);

          return progress;
        } catch (error) {
          console.error('Error enrolling in plan:', error);
          return null;
        }
      },

      unenrollFromPlan: async (progressId: string) => {
        try {
          const { error } = await supabase
            .from(TABLES.userReadingProgress)
            .update({ is_active: false })
            .eq('id', progressId);

          if (error) throw error;

          set({
            activeProgress: null,
            todaysReading: null,
            wayfarerState: {
              status: 'normal',
              daysMissed: 0,
              missedReadingTitles: [],
            },
          });

          return true;
        } catch (error) {
          console.error('Error unenrolling from plan:', error);
          return false;
        }
      },

      // =====================================================
      // READING ACTIONS
      // =====================================================

      fetchTodaysReading: async (userId: string, planId?: string) => {
        set({ todaysReadingLoading: true });
        try {
          const { data, error } = await supabase.rpc(RPC_FUNCTIONS.getTodaysReading, {
            p_user_id: userId,
            p_plan_id: planId || null,
          });

          if (error) throw error;

          const readingData = data?.[0] as TodaysReadingRow | undefined;
          const reading = readingData ? toTodaysReading(readingData) : null;

          set({ todaysReading: reading, todaysReadingLoading: false });

          // Check if intervention is needed
          if (reading && reading.daysMissed > INTERVENTION_THRESHOLD_DAYS) {
            // Fetch missed reading titles
            const missedTitles = await get().fetchMissedReadingTitles(
              reading.planId,
              reading.dayNumber - reading.daysMissed,
              reading.dayNumber - 1
            );

            set({
              wayfarerState: {
                status: 'intervention',
                daysMissed: reading.daysMissed,
                lastReadAt: get().activeProgress?.lastReadAt,
                missedReadingTitles: missedTitles,
              },
            });
          }
        } catch (error) {
          console.error('Error fetching today\'s reading:', error);
          set({ todaysReadingLoading: false });
        }
      },

      startReadingSession: () => {
        set({ sessionStartedAt: new Date() });
      },

      completeReadingDay: async (progressId: string, dayNumber: number, reflection?: string) => {
        try {
          const sessionStart = get().sessionStartedAt;
          const durationSeconds = sessionStart
            ? Math.floor((Date.now() - sessionStart.getTime()) / 1000)
            : null;

          const { data, error } = await supabase.rpc(RPC_FUNCTIONS.completeReadingDay, {
            p_progress_id: progressId,
            p_day_number: dayNumber,
            p_duration_seconds: durationSeconds,
            p_reflection: reflection || null,
          });

          if (error) throw error;

          const result = data?.[0];
          if (!result?.success) {
            return false;
          }

          // Update local state
          set((state) => ({
            activeProgress: state.activeProgress
              ? {
                  ...state.activeProgress,
                  currentDay: result.new_current_day,
                  streakCount: result.new_streak,
                  completedDays: [
                    ...state.activeProgress.completedDays,
                    dayNumber,
                  ],
                  lastReadAt: new Date(),
                }
              : null,
            wayfarerState: {
              status: 'normal',
              daysMissed: 0,
              missedReadingTitles: [],
            },
            sessionStartedAt: null,
          }));

          return true;
        } catch (error) {
          console.error('Error completing reading day:', error);
          return false;
        }
      },

      // =====================================================
      // WAYFARER ADAPTIVE ACTIONS
      // =====================================================

      checkWayfarerStatus: async (userId: string) => {
        set((state) => ({
          wayfarerState: { ...state.wayfarerState, status: 'loading' },
        }));

        try {
          const { activeProgress } = get();

          if (!activeProgress || !activeProgress.lastReadAt) {
            set({
              wayfarerState: {
                status: 'normal',
                daysMissed: 0,
                missedReadingTitles: [],
              },
            });
            return;
          }

          // Calculate days since last read
          const lastReadDate = new Date(activeProgress.lastReadAt);
          const today = new Date();
          const daysSinceLastRead = Math.floor(
            (today.getTime() - lastReadDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceLastRead > INTERVENTION_THRESHOLD_DAYS) {
            // Fetch missed reading titles
            const missedTitles = await get().fetchMissedReadingTitles(
              activeProgress.planId,
              activeProgress.currentDay,
              activeProgress.currentDay + daysSinceLastRead - 1
            );

            set({
              wayfarerState: {
                status: 'intervention',
                daysMissed: daysSinceLastRead,
                lastReadAt: lastReadDate,
                missedReadingTitles: missedTitles,
              },
            });
          } else {
            set({
              wayfarerState: {
                status: 'normal',
                daysMissed: daysSinceLastRead,
                lastReadAt: lastReadDate,
                missedReadingTitles: [],
              },
            });
          }
        } catch (error) {
          console.error('Error checking wayfarer status:', error);
          set({
            wayfarerState: {
              status: 'normal',
              daysMissed: 0,
              missedReadingTitles: [],
            },
          });
        }
      },

      applyGracePath: async (progressId: string, aiSummary: string) => {
        try {
          const { data, error } = await supabase.rpc(RPC_FUNCTIONS.applyGracePath, {
            p_progress_id: progressId,
            p_ai_summary: aiSummary,
          });

          if (error) throw error;

          const result = data?.[0];
          if (!result?.success) {
            return false;
          }

          // Update local state
          set((state) => ({
            activeProgress: state.activeProgress
              ? {
                  ...state.activeProgress,
                  currentDay: result.new_current_day,
                  isAdaptiveModeActive: false,
                  lastReadAt: new Date(),
                }
              : null,
            wayfarerState: {
              status: 'normal',
              daysMissed: 0,
              missedReadingTitles: [],
            },
          }));

          // Refresh today's reading
          const userId = get().activeProgress?.progressId;
          if (userId) {
            // Note: We'd need the actual userId here - this is a simplification
            // In practice, you'd pass it from the component
          }

          return true;
        } catch (error) {
          console.error('Error applying grace path:', error);
          return false;
        }
      },

      applyPatientPath: async (progressId: string) => {
        try {
          const { data, error } = await supabase.rpc(RPC_FUNCTIONS.applyPatientPath, {
            p_progress_id: progressId,
          });

          if (error) throw error;

          const result = data?.[0];
          if (!result?.success) {
            return false;
          }

          // Update local state
          set((state) => ({
            activeProgress: state.activeProgress
              ? {
                  ...state.activeProgress,
                  plannedEndDate: new Date(result.new_planned_end_date),
                  isAdaptiveModeActive: false,
                  lastReadAt: new Date(),
                }
              : null,
            wayfarerState: {
              status: 'normal',
              daysMissed: 0,
              missedReadingTitles: [],
            },
          }));

          return true;
        } catch (error) {
          console.error('Error applying patient path:', error);
          return false;
        }
      },

      // Helper to fetch missed reading titles
      fetchMissedReadingTitles: async (
        planId: string,
        startDay: number,
        endDay: number
      ): Promise<string[]> => {
        try {
          const { data, error } = await supabase
            .from(TABLES.planSections)
            .select('display_title')
            .eq('plan_id', planId)
            .gte('day_number', startDay)
            .lte('day_number', endDay)
            .order('day_number', { ascending: true });

          if (error) throw error;

          return (data || []).map((row: { display_title: string }) => row.display_title);
        } catch (error) {
          console.error('Error fetching missed reading titles:', error);
          return [];
        }
      },

      // =====================================================
      // UTILITY ACTIONS
      // =====================================================

      setWayfarerState: (newState: Partial<WayfarerState>) => {
        set((state) => ({
          wayfarerState: { ...state.wayfarerState, ...newState },
        }));
      },

      clearStore: () => {
        set({
          availablePlans: [],
          plansLoading: false,
          plansError: null,
          activeProgress: null,
          progressLoading: false,
          todaysReading: null,
          todaysReadingLoading: false,
          wayfarerState: {
            status: 'normal',
            daysMissed: 0,
            missedReadingTitles: [],
          },
          currentSection: null,
          sessionStartedAt: null,
        });
      },
    }),
    {
      name: 'reading-plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist minimal state for quick restoration
        activeProgress: state.activeProgress,
      }),
    }
  )
);

// Add the fetchMissedReadingTitles to the interface (internal helper)
declare module './readingPlanStore' {
  interface ReadingPlanState {
    fetchMissedReadingTitles: (
      planId: string,
      startDay: number,
      endDay: number
    ) => Promise<string[]>;
  }
}

// =====================================================
// SELECTORS
// =====================================================

export const useAvailablePlans = () =>
  useReadingPlanStore((state) => state.availablePlans);
export const useActiveProgress = () =>
  useReadingPlanStore((state) => state.activeProgress);
export const useTodaysReading = () =>
  useReadingPlanStore((state) => state.todaysReading);
export const useWayfarerState = () =>
  useReadingPlanStore((state) => state.wayfarerState);
export const useIsInterventionActive = () =>
  useReadingPlanStore((state) => state.wayfarerState.status === 'intervention');
export const useReadingPlanLoading = () =>
  useReadingPlanStore(
    (state) => state.plansLoading || state.progressLoading || state.todaysReadingLoading
  );
