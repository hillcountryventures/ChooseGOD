import type { VerseSource } from './bible';

// Spiritual moment types
export type MomentType =
  | 'journal'
  | 'prayer'
  | 'devotional'
  | 'gratitude'
  | 'confession'
  | 'memory_practice'
  | 'obedience_step'
  | 'lectio'
  | 'examen'
  | 'answered_prayer';

// Journal media types
export type MediaType = 'photo' | 'voice' | 'drawing';

export interface JournalMedia {
  id: string;
  type: MediaType;
  uri: string;
  duration?: number; // for voice notes (seconds)
  thumbnail?: string; // for photos/drawings
  createdAt: Date;
}

// AI-generated insights for journal entries
export interface JournalAIInsights {
  summary?: string;
  suggestedVerses?: VerseSource[];
  reflectionQuestions?: string[];
  growthPatterns?: string[];
  generatedAt?: Date;
}

// Entry source context
export type JournalSourceType = 'standalone' | 'verse_reflection' | 'devotional' | 'ai_prompt' | 'bible_reading';

export interface JournalSource {
  type: JournalSourceType;
  referenceId?: string; // e.g., devotional day ID, verse reference
}

export interface SpiritualMoment {
  id: string;
  userId: string;
  momentType: MomentType;
  content: string;
  aiReflection?: string;
  linkedVerses: VerseSource[];
  sentimentScore?: number;
  themes: string[];
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
  // Rich media support
  media?: JournalMedia[];
  // AI-generated insights
  aiInsights?: JournalAIInsights;
  // Entry status
  status?: 'draft' | 'published';
  // Entry source context
  source?: JournalSource;
}

// Journal draft for auto-save
export interface JournalDraft {
  id: string;
  content: string;
  linkedVerses: VerseSource[];
  media: JournalMedia[];
  lastSavedAt: Date;
  source?: JournalSource;
}

// AI prompt suggestion for journaling
export type JournalPromptType = 'morning' | 'evening' | 'verse_based' | 'theme_based' | 'contextual';

export interface JournalPrompt {
  id: string;
  type: JournalPromptType;
  text: string;
  relatedVerse?: VerseSource;
  icon: string;
}

// Obedience step tracking
export interface ObedienceStep {
  id: string;
  userId: string;
  sourceMomentId?: string;
  commitment: string;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  followUpSent: boolean;
  reflection?: string;
  createdAt: Date;
}

// Timeline item for Journey screen
export interface TimelineItem {
  id: string;
  type: MomentType | 'answered_prayer' | 'memory_milestone';
  title: string;
  content: string;
  linkedVerses?: VerseSource[];
  themes?: string[];
  createdAt: Date;
}

// Seasonal rhythm
export type RhythmType = 'advent' | 'lent' | 'sabbath' | 'custom';

export interface RhythmEnrollment {
  id: string;
  userId: string;
  rhythmType: RhythmType;
  startDate: Date;
  endDate: Date;
  currentDay: number;
  completedDays: number[];
  createdAt: Date;
}

// Growth insights
export type InsightType = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'theme';

export interface GrowthInsight {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  insightType: InsightType;
  title: string;
  narrative: string;
  keyMoments: string[];
  themesGrowth: Record<string, number>;
  createdAt: Date;
}
