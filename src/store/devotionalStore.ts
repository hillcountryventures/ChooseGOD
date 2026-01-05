import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  DevotionalSeries,
  DevotionalDay,
  UserSeriesEnrollment,
  OnboardingResponses,
  EnrollmentProgress,
  toDevotionalSeries,
  toDevotionalDay,
  toUserSeriesEnrollment,
  toOnboardingResponses,
  DevotionalSeriesRow,
  DevotionalDayRow,
  UserSeriesEnrollmentRow,
  OnboardingResponsesRow,
} from '../types/devotional';

// =====================================================
// STORE INTERFACE
// =====================================================

interface DevotionalState {
  // Catalog
  allSeries: DevotionalSeries[];
  seriesLoading: boolean;
  seriesError: string | null;

  // User enrollments
  enrollments: UserSeriesEnrollment[];
  enrollmentsLoading: boolean;
  primaryEnrollmentId: string | null;

  // Onboarding
  onboardingCompleted: boolean;
  onboardingResponses: OnboardingResponses | null;

  // Current devotional session
  currentDay: DevotionalDay | null;
  currentDayLoading: boolean;

  // Actions - Catalog
  fetchAllSeries: () => Promise<void>;
  fetchSeriesById: (seriesId: string) => Promise<DevotionalSeries | null>;
  getRecommendedSeries: (responses: OnboardingResponses) => Promise<DevotionalSeries[]>;

  // Actions - Enrollments
  fetchEnrollments: (userId: string) => Promise<void>;
  enrollInSeries: (userId: string, seriesId: string, isPrimary?: boolean) => Promise<UserSeriesEnrollment | null>;
  unenrollFromSeries: (enrollmentId: string) => Promise<boolean>;
  setPrimaryEnrollment: (userId: string, enrollmentId: string) => Promise<boolean>;
  completeDay: (enrollmentId: string, dayNumber: number) => Promise<boolean>;
  updateReminderTime: (enrollmentId: string, time: string) => Promise<boolean>;

  // Actions - Daily Content
  fetchDayContent: (seriesId: string, dayNumber: number) => Promise<DevotionalDay | null>;
  setCurrentDay: (day: DevotionalDay | null) => void;

  // Actions - Onboarding
  saveOnboardingResponses: (userId: string, responses: OnboardingResponses) => Promise<boolean>;
  markOnboardingComplete: (userId: string) => Promise<boolean>;
  checkOnboardingStatus: (userId: string) => Promise<boolean>;
  setOnboardingCompleted: (completed: boolean) => void;

  // Actions - Progress
  getEnrollmentProgress: (userId: string) => Promise<EnrollmentProgress[]>;

  // Utility
  clearStore: () => void;
}

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

export const useDevotionalStore = create<DevotionalState>()(
  persist(
    (set, get) => ({
      // Initial state
      allSeries: [],
      seriesLoading: false,
      seriesError: null,
      enrollments: [],
      enrollmentsLoading: false,
      primaryEnrollmentId: null,
      onboardingCompleted: false,
      onboardingResponses: null,
      currentDay: null,
      currentDayLoading: false,

      // =====================================================
      // CATALOG ACTIONS
      // =====================================================

      fetchAllSeries: async () => {
        set({ seriesLoading: true, seriesError: null });
        try {
          const { data, error } = await supabase
            .from('devotional_series')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) throw error;

          const series = (data as DevotionalSeriesRow[]).map(toDevotionalSeries);
          set({ allSeries: series, seriesLoading: false });
        } catch (error) {
          console.error('Error fetching series:', error);
          set({
            seriesError: error instanceof Error ? error.message : 'Failed to fetch series',
            seriesLoading: false,
          });
        }
      },

      fetchSeriesById: async (seriesId: string) => {
        try {
          const { data, error } = await supabase
            .from('devotional_series')
            .select('*')
            .eq('id', seriesId)
            .single();

          if (error) throw error;
          return toDevotionalSeries(data as DevotionalSeriesRow);
        } catch (error) {
          console.error('Error fetching series by ID:', error);
          return null;
        }
      },

      getRecommendedSeries: async (responses: OnboardingResponses) => {
        try {
          const { data, error } = await supabase.rpc('get_recommended_series', {
            p_life_area: responses.lifeAreaFocus || null,
            p_experience_level: responses.experienceLevel || null,
            p_limit: 5,
          });

          if (error) throw error;

          // Map RPC results to DevotionalSeries
          return (data || []).map((row: any) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            description: row.description,
            coverImageUrl: row.cover_image_url,
            totalDays: row.total_days,
            topics: row.topics,
            isSeasonal: row.is_seasonal,
            difficultyLevel: row.difficulty_level,
            createdAt: new Date(),
          })) as DevotionalSeries[];
        } catch (error) {
          console.error('Error getting recommended series:', error);
          // Fallback: return first 5 non-seasonal series
          const { allSeries } = get();
          return allSeries.filter((s) => !s.isSeasonal).slice(0, 5);
        }
      },

      // =====================================================
      // ENROLLMENT ACTIONS
      // =====================================================

      fetchEnrollments: async (userId: string) => {
        set({ enrollmentsLoading: true });
        try {
          const { data, error } = await supabase
            .from('user_series_enrollments')
            .select(`
              *,
              devotional_series (*)
            `)
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('is_primary', { ascending: false })
            .order('last_activity_at', { ascending: false });

          if (error) throw error;

          const enrollments = (data || []).map((row: any) => {
            const series = row.devotional_series
              ? toDevotionalSeries(row.devotional_series)
              : undefined;
            return toUserSeriesEnrollment(row as UserSeriesEnrollmentRow, series);
          });

          const primaryEnrollment = enrollments.find((e) => e.isPrimary);
          set({
            enrollments,
            enrollmentsLoading: false,
            primaryEnrollmentId: primaryEnrollment?.id || null,
          });
        } catch (error) {
          console.error('Error fetching enrollments:', error);
          set({ enrollmentsLoading: false });
        }
      },

      enrollInSeries: async (userId: string, seriesId: string, isPrimary = false) => {
        try {
          const { data, error } = await supabase
            .from('user_series_enrollments')
            .insert({
              user_id: userId,
              series_id: seriesId,
              is_primary: isPrimary,
              current_day: 1,
              completed_days: [],
              is_active: true,
            })
            .select(`
              *,
              devotional_series (*)
            `)
            .single();

          if (error) throw error;

          const series = data.devotional_series
            ? toDevotionalSeries(data.devotional_series)
            : undefined;
          const enrollment = toUserSeriesEnrollment(data as UserSeriesEnrollmentRow, series);

          set((state) => ({
            enrollments: [enrollment, ...state.enrollments],
            primaryEnrollmentId: isPrimary ? enrollment.id : state.primaryEnrollmentId,
          }));

          return enrollment;
        } catch (error) {
          console.error('Error enrolling in series:', error);
          return null;
        }
      },

      unenrollFromSeries: async (enrollmentId: string) => {
        try {
          const { error } = await supabase
            .from('user_series_enrollments')
            .update({ is_active: false })
            .eq('id', enrollmentId);

          if (error) throw error;

          set((state) => ({
            enrollments: state.enrollments.filter((e) => e.id !== enrollmentId),
            primaryEnrollmentId:
              state.primaryEnrollmentId === enrollmentId
                ? null
                : state.primaryEnrollmentId,
          }));

          return true;
        } catch (error) {
          console.error('Error unenrolling from series:', error);
          return false;
        }
      },

      setPrimaryEnrollment: async (userId: string, enrollmentId: string) => {
        try {
          // The trigger in the database handles setting other enrollments to non-primary
          const { error } = await supabase
            .from('user_series_enrollments')
            .update({ is_primary: true })
            .eq('id', enrollmentId)
            .eq('user_id', userId);

          if (error) throw error;

          set((state) => ({
            enrollments: state.enrollments.map((e) => ({
              ...e,
              isPrimary: e.id === enrollmentId,
            })),
            primaryEnrollmentId: enrollmentId,
          }));

          return true;
        } catch (error) {
          console.error('Error setting primary enrollment:', error);
          return false;
        }
      },

      completeDay: async (enrollmentId: string, dayNumber: number) => {
        try {
          // Get current enrollment
          const { data: currentData, error: fetchError } = await supabase
            .from('user_series_enrollments')
            .select('completed_days, current_day')
            .eq('id', enrollmentId)
            .single();

          if (fetchError) throw fetchError;

          const completedDays = currentData.completed_days || [];
          if (!completedDays.includes(dayNumber)) {
            completedDays.push(dayNumber);
          }

          // Update enrollment
          const { error } = await supabase
            .from('user_series_enrollments')
            .update({
              completed_days: completedDays,
              current_day: Math.max(currentData.current_day, dayNumber + 1),
              last_activity_at: new Date().toISOString(),
            })
            .eq('id', enrollmentId);

          if (error) throw error;

          // Update local state
          set((state) => ({
            enrollments: state.enrollments.map((e) =>
              e.id === enrollmentId
                ? {
                    ...e,
                    completedDays,
                    currentDay: Math.max(e.currentDay, dayNumber + 1),
                    lastActivityAt: new Date(),
                  }
                : e
            ),
          }));

          return true;
        } catch (error) {
          console.error('Error completing day:', error);
          return false;
        }
      },

      updateReminderTime: async (enrollmentId: string, time: string) => {
        try {
          const { error } = await supabase
            .from('user_series_enrollments')
            .update({ reminder_time: time })
            .eq('id', enrollmentId);

          if (error) throw error;

          set((state) => ({
            enrollments: state.enrollments.map((e) =>
              e.id === enrollmentId ? { ...e, reminderTime: time } : e
            ),
          }));

          return true;
        } catch (error) {
          console.error('Error updating reminder time:', error);
          return false;
        }
      },

      // =====================================================
      // DAILY CONTENT ACTIONS
      // =====================================================

      fetchDayContent: async (seriesId: string, dayNumber: number) => {
        set({ currentDayLoading: true });
        try {
          const { data, error } = await supabase
            .from('devotional_days')
            .select('*')
            .eq('series_id', seriesId)
            .eq('day_number', dayNumber)
            .single();

          if (error) throw error;

          const day = toDevotionalDay(data as DevotionalDayRow);
          set({ currentDay: day, currentDayLoading: false });
          return day;
        } catch (error) {
          console.error('Error fetching day content:', error);
          set({ currentDayLoading: false });
          return null;
        }
      },

      setCurrentDay: (day: DevotionalDay | null) => {
        set({ currentDay: day });
      },

      // =====================================================
      // ONBOARDING ACTIONS
      // =====================================================

      saveOnboardingResponses: async (userId: string, responses: OnboardingResponses) => {
        try {
          const { error } = await supabase.from('onboarding_responses').upsert({
            user_id: userId,
            life_area_focus: responses.lifeAreaFocus,
            time_available: responses.timeAvailable,
            experience_level: responses.experienceLevel,
            life_stage: responses.lifeStage,
            completed_at: new Date().toISOString(),
          });

          if (error) throw error;

          set({ onboardingResponses: responses });
          return true;
        } catch (error) {
          console.error('Error saving onboarding responses:', error);
          return false;
        }
      },

      markOnboardingComplete: async (userId: string) => {
        try {
          const { error } = await supabase
            .from('user_profiles')
            .upsert({
              id: userId,
              onboarding_completed: true,
              onboarding_completed_at: new Date().toISOString(),
            });

          if (error) throw error;

          set({ onboardingCompleted: true });
          return true;
        } catch (error) {
          console.error('Error marking onboarding complete:', error);
          return false;
        }
      },

      checkOnboardingStatus: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('id', userId)
            .single();

          if (error) {
            // If no profile exists, onboarding is not complete
            if (error.code === 'PGRST116') {
              set({ onboardingCompleted: false });
              return false;
            }
            throw error;
          }

          const completed = data?.onboarding_completed || false;
          set({ onboardingCompleted: completed });
          return completed;
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          set({ onboardingCompleted: false });
          return false;
        }
      },

      setOnboardingCompleted: (completed: boolean) => {
        set({ onboardingCompleted: completed });
      },

      // =====================================================
      // PROGRESS ACTIONS
      // =====================================================

      getEnrollmentProgress: async (userId: string) => {
        try {
          const { data, error } = await supabase.rpc('get_user_devotional_progress', {
            p_user_id: userId,
          });

          if (error) throw error;

          return (data || []).map((row: any) => ({
            enrollmentId: row.enrollment_id,
            seriesId: row.series_id,
            seriesTitle: row.series_title,
            seriesSlug: row.series_slug,
            totalDays: row.total_days,
            currentDay: row.current_day,
            completedDays: row.completed_days || [],
            isPrimary: row.is_primary,
            isActive: row.is_active,
            progressPercentage: row.progress_percentage || 0,
            daysRemaining: row.days_remaining || row.total_days,
            lastActivityAt: new Date(row.last_activity_at),
          })) as EnrollmentProgress[];
        } catch (error) {
          console.error('Error getting enrollment progress:', error);
          return [];
        }
      },

      // =====================================================
      // UTILITY ACTIONS
      // =====================================================

      clearStore: () => {
        set({
          allSeries: [],
          seriesLoading: false,
          seriesError: null,
          enrollments: [],
          enrollmentsLoading: false,
          primaryEnrollmentId: null,
          onboardingCompleted: false,
          onboardingResponses: null,
          currentDay: null,
          currentDayLoading: false,
        });
      },
    }),
    {
      name: 'devotional-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist onboarding state and primary enrollment
        onboardingCompleted: state.onboardingCompleted,
        onboardingResponses: state.onboardingResponses,
        primaryEnrollmentId: state.primaryEnrollmentId,
      }),
    }
  )
);

// =====================================================
// SELECTORS
// =====================================================

export const useAllSeries = () => useDevotionalStore((state) => state.allSeries);
export const useEnrollments = () => useDevotionalStore((state) => state.enrollments);
export const usePrimaryEnrollment = () =>
  useDevotionalStore((state) =>
    state.enrollments.find((e) => e.id === state.primaryEnrollmentId)
  );
export const useOnboardingCompleted = () =>
  useDevotionalStore((state) => state.onboardingCompleted);
export const useOnboardingResponses = () =>
  useDevotionalStore((state) => state.onboardingResponses);
export const useCurrentDay = () => useDevotionalStore((state) => state.currentDay);
