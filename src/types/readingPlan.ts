// =====================================================
// READING PLAN TYPES
// =====================================================

export type PlanType = 'canonical' | 'chronological' | 'thematic' | 'gospels_first';

export type SkippedResolutionType = 'grace_summary' | 'patient_shift' | 'caught_up' | 'pending';

// =====================================================
// READING PLAN ENTITY TYPES
// =====================================================

export interface ReadingPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  totalDays: number;
  planType: PlanType;
  coverImageUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface VerseReference {
  book: string;
  startChapter: number;
  endChapter: number;
}

export interface PlanSection {
  id: string;
  planId: string;
  dayNumber: number;
  displayTitle: string;
  versesJson: VerseReference[];
  summaryText?: string;
  summaryPrompt?: string;
  estimatedReadMinutes: number;
  createdAt: Date;
}

export interface UserReadingProgress {
  id: string;
  userId: string;
  planId: string;
  currentDay: number;
  completedDays: number[];
  isAdaptiveModeActive: boolean;
  isActive: boolean;
  startDate: Date;
  plannedEndDate?: Date;
  lastReadAt?: Date;
  streakCount: number;
  longestStreak: number;
  totalChaptersRead: number;
  reminderTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkippedSession {
  id: string;
  userId: string;
  progressId: string;
  dayNumber: number;
  originalDate: Date;
  skippedAt: Date;
  resolutionType: SkippedResolutionType;
  resolvedAt?: Date;
  aiSummary?: string;
  notes?: string;
  createdAt: Date;
}

export interface ReadingSessionLog {
  id: string;
  userId: string;
  progressId: string;
  dayNumber: number;
  startedAt: Date;
  completedAt?: Date;
  durationSeconds?: number;
  versesRead: VerseReference[];
  notes?: string;
  reflection?: string;
  createdAt: Date;
}

// =====================================================
// PROGRESS TRACKING TYPES
// =====================================================

export interface ReadingPlanProgress {
  progressId: string;
  planId: string;
  planName: string;
  planSlug: string;
  totalDays: number;
  currentDay: number;
  completedDays: number[];
  isAdaptiveModeActive: boolean;
  isActive: boolean;
  startDate: Date;
  plannedEndDate?: Date;
  lastReadAt?: Date;
  streakCount: number;
  longestStreak: number;
  progressPercentage: number;
  daysRemaining: number;
  pendingSkippedCount: number;
}

export interface TodaysReading {
  progressId: string;
  planId: string;
  planName: string;
  dayNumber: number;
  displayTitle: string;
  versesJson: VerseReference[];
  summaryText?: string;
  isAdaptiveModeActive: boolean;
  daysMissed: number;
}

// =====================================================
// WAYFARER ADAPTIVE TYPES
// =====================================================

export type WayfarerInterventionStatus = 'normal' | 'intervention' | 'loading';

export interface WayfarerState {
  status: WayfarerInterventionStatus;
  daysMissed: number;
  lastReadAt?: Date;
  missedReadingTitles: string[];
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface ReadingPlanHubState {
  activeProgress?: ReadingPlanProgress;
  todaysReading?: TodaysReading;
  wayfarerState: WayfarerState;
  availablePlans: ReadingPlan[];
  isLoading: boolean;
  error?: string;
}

// =====================================================
// DATABASE ROW TYPES (for Supabase)
// =====================================================

export interface ReadingPlanRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  total_days: number;
  plan_type: string;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PlanSectionRow {
  id: string;
  plan_id: string;
  day_number: number;
  display_title: string;
  verses_json: VerseReference[];
  summary_text: string | null;
  summary_prompt: string | null;
  estimated_read_minutes: number;
  created_at: string;
}

export interface UserReadingProgressRow {
  id: string;
  user_id: string;
  plan_id: string;
  current_day: number;
  completed_days: number[];
  is_adaptive_mode_active: boolean;
  is_active: boolean;
  start_date: string;
  planned_end_date: string | null;
  last_read_at: string | null;
  streak_count: number;
  longest_streak: number;
  total_chapters_read: number;
  reminder_time: string;
  created_at: string;
  updated_at: string;
}

export interface SkippedSessionRow {
  id: string;
  user_id: string;
  progress_id: string;
  day_number: number;
  original_date: string;
  skipped_at: string;
  resolution_type: string | null;
  resolved_at: string | null;
  ai_summary: string | null;
  notes: string | null;
  created_at: string;
}

export interface ReadingSessionLogRow {
  id: string;
  user_id: string;
  progress_id: string;
  day_number: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  verses_read: VerseReference[];
  notes: string | null;
  reflection: string | null;
  created_at: string;
}

// RPC return types
export interface ReadingPlanProgressRow {
  progress_id: string;
  plan_id: string;
  plan_name: string;
  plan_slug: string;
  total_days: number;
  current_day: number;
  completed_days: number[];
  is_adaptive_mode_active: boolean;
  is_active: boolean;
  start_date: string;
  planned_end_date: string | null;
  last_read_at: string | null;
  streak_count: number;
  longest_streak: number;
  progress_percentage: number;
  days_remaining: number;
  pending_skipped_count: number;
}

export interface TodaysReadingRow {
  progress_id: string;
  plan_id: string;
  plan_name: string;
  day_number: number;
  display_title: string;
  verses_json: VerseReference[];
  summary_text: string | null;
  is_adaptive_mode_active: boolean;
  days_missed: number;
}

// =====================================================
// CONVERSION HELPERS
// =====================================================

export function toReadingPlan(row: ReadingPlanRow): ReadingPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    totalDays: row.total_days,
    planType: row.plan_type as PlanType,
    coverImageUrl: row.cover_image_url ?? undefined,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
  };
}

export function toPlanSection(row: PlanSectionRow): PlanSection {
  return {
    id: row.id,
    planId: row.plan_id,
    dayNumber: row.day_number,
    displayTitle: row.display_title,
    versesJson: row.verses_json,
    summaryText: row.summary_text ?? undefined,
    summaryPrompt: row.summary_prompt ?? undefined,
    estimatedReadMinutes: row.estimated_read_minutes,
    createdAt: new Date(row.created_at),
  };
}

export function toUserReadingProgress(row: UserReadingProgressRow): UserReadingProgress {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    currentDay: row.current_day,
    completedDays: row.completed_days,
    isAdaptiveModeActive: row.is_adaptive_mode_active,
    isActive: row.is_active,
    startDate: new Date(row.start_date),
    plannedEndDate: row.planned_end_date ? new Date(row.planned_end_date) : undefined,
    lastReadAt: row.last_read_at ? new Date(row.last_read_at) : undefined,
    streakCount: row.streak_count,
    longestStreak: row.longest_streak,
    totalChaptersRead: row.total_chapters_read,
    reminderTime: row.reminder_time,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function toSkippedSession(row: SkippedSessionRow): SkippedSession {
  return {
    id: row.id,
    userId: row.user_id,
    progressId: row.progress_id,
    dayNumber: row.day_number,
    originalDate: new Date(row.original_date),
    skippedAt: new Date(row.skipped_at),
    resolutionType: (row.resolution_type as SkippedResolutionType) || 'pending',
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
    aiSummary: row.ai_summary ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export function toReadingPlanProgress(row: ReadingPlanProgressRow): ReadingPlanProgress {
  return {
    progressId: row.progress_id,
    planId: row.plan_id,
    planName: row.plan_name,
    planSlug: row.plan_slug,
    totalDays: row.total_days,
    currentDay: row.current_day,
    completedDays: row.completed_days,
    isAdaptiveModeActive: row.is_adaptive_mode_active,
    isActive: row.is_active,
    startDate: new Date(row.start_date),
    plannedEndDate: row.planned_end_date ? new Date(row.planned_end_date) : undefined,
    lastReadAt: row.last_read_at ? new Date(row.last_read_at) : undefined,
    streakCount: row.streak_count,
    longestStreak: row.longest_streak,
    progressPercentage: row.progress_percentage,
    daysRemaining: row.days_remaining,
    pendingSkippedCount: row.pending_skipped_count,
  };
}

export function toTodaysReading(row: TodaysReadingRow): TodaysReading {
  return {
    progressId: row.progress_id,
    planId: row.plan_id,
    planName: row.plan_name,
    dayNumber: row.day_number,
    displayTitle: row.display_title,
    versesJson: row.verses_json,
    summaryText: row.summary_text ?? undefined,
    isAdaptiveModeActive: row.is_adaptive_mode_active,
    daysMissed: row.days_missed,
  };
}

// =====================================================
// PLAN GRADIENTS & COLORS
// =====================================================

export const READING_PLAN_GRADIENTS: Record<string, [string, string]> = {
  'canonical-365': ['#6366F1', '#4F46E5'], // Indigo - classic/traditional
  'chronological-365': ['#8B5CF6', '#7C3AED'], // Purple - historical
  'gospels-first-90': ['#EF4444', '#DC2626'], // Red - Christ-centered
  'thematic-365': ['#10B981', '#059669'], // Emerald - topical
};

export function getReadingPlanGradient(slug: string): [string, string] {
  return READING_PLAN_GRADIENTS[slug] || ['#6366F1', '#4F46E5'];
}

// Wayfarer intervention colors
export const WAYFARER_COLORS = {
  normal: '#1A1A1A', // Standard card background
  intervention: '#78350F', // Warm amber background
  interventionBorder: '#F59E0B', // Amber border
  gracePath: '#22C55E', // Green for grace
  patientPath: '#6366F1', // Indigo for patient
} as const;
