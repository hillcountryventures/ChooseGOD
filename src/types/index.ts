import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps as RNBottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { OnboardingResponses, DevotionalSeries } from './devotional';

// Re-export devotional types
export * from './devotional';

// Auth Stack Navigator param list
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Onboarding Stack Navigator param list
export type OnboardingStackParamList = {
  Welcome: undefined;
  Carousel: undefined;
  Quiz: undefined;
  Recommendations: { quizResponses: OnboardingResponses };
  NotificationSetup: { selectedSeriesIds: string[] };
  EnrollConfirm: { seriesIds: string[]; primarySeriesId: string };
};

// Devotional Stack Navigator param list
export type DevotionalStackParamList = {
  DevotionalHub: undefined;
  SeriesLibrary: undefined;
  SeriesDetail: { seriesId: string; series?: DevotionalSeries };
  DailyDevotional: { enrollmentId: string; seriesId: string; dayNumber: number };
  DevotionalComplete: { seriesId: string; dayNumber: number; seriesTitle: string };
};

// Root Stack Navigator param list
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: undefined;
  Settings: undefined;
  Chat: {
    initialMessage?: string;
    conversationId?: string;
    mode?: ChatMode;
    context?: Record<string, unknown>;
  };
  ReflectionModal: {
    verse: BibleVerse;
    reference: string;
  };
  JournalCompose: {
    draftId?: string;
    initialVerse?: {
      book: string;
      chapter: number;
      verse: number;
      text: string;
      translation: string;
    };
    initialPrompt?: string;
    source?: {
      type: 'standalone' | 'verse_reflection' | 'devotional' | 'ai_prompt' | 'bible_reading';
      referenceId?: string;
    };
  };
  JournalDetail: {
    momentId: string;
    editMode?: boolean;
  };
  VersePicker: {
    selectedVerses?: VerseSource[];
  };
};

// Bottom Tab Navigator param list
export type BottomTabParamList = {
  Home: undefined;
  Devotionals: NavigatorScreenParams<DevotionalStackParamList>;
  Bible: {
    book?: string;
    chapter?: number;
    verse?: number;
  };
  Journey: undefined;
  Prayers: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type BottomTabScreenProps<T extends keyof BottomTabParamList> =
  CompositeScreenProps<
    RNBottomTabScreenProps<BottomTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type DevotionalStackScreenProps<T extends keyof DevotionalStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DevotionalStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Chat modes for different spiritual experiences
export type ChatMode =
  | 'auto'
  | 'devotional'
  | 'prayer'
  | 'journal'
  | 'lectio'
  | 'examen'
  | 'memory'
  | 'confession'
  | 'gratitude'
  | 'celebration';

// Spiritual intent types (detected by AI)
export type SpiritualIntent =
  | 'question'
  | 'prayer'
  | 'journal'
  | 'gratitude'
  | 'confession'
  | 'guidance'
  | 'memorize'
  | 'devotional'
  | 'examen'
  | 'lectio'
  | 'celebration'
  | 'commitment'
  | 'casual';

// Chat message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Bible types
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

// User settings
export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  dailyVerse: boolean;
}

// Daily verse
export interface DailyVerse {
  verse: BibleVerse;
  date: string;
  reflection?: string;
}

// Bible translations
export type Translation = 'KJV' | 'NIV' | 'ESV' | 'NKJV' | 'NLT';

export interface TranslationInfo {
  id: Translation;
  name: string;
  description: string;
}

export const TRANSLATIONS: TranslationInfo[] = [
  {
    id: 'KJV',
    name: 'King James Version',
    description: 'Classic, traditional English translation',
  },
  {
    id: 'NIV',
    name: 'New International Version',
    description: 'Modern, easy-to-read translation',
  },
  {
    id: 'ESV',
    name: 'English Standard Version',
    description: 'Literal, word-for-word translation',
  },
  {
    id: 'NKJV',
    name: 'New King James Version',
    description: 'Updated KJV with modern language',
  },
  {
    id: 'NLT',
    name: 'New Living Translation',
    description: 'Thought-for-thought translation',
  },
];

// User preferences for store
export interface UserPreferences {
  preferredTranslation: Translation;
  fontSize: 'small' | 'medium' | 'large';
  dailyDevotional: boolean;
  eveningExamen: boolean;
  notificationsEnabled: boolean;
  maturityLevel: 'new_believer' | 'growing' | 'mature' | 'leader';
}

// RAG Query types
export interface VerseSource extends BibleVerse {
  translation: Translation;
  similarity?: number;
  context?: string;
}

export interface RAGQueryResponse {
  response: string;
  sources: VerseSource[];
  query: string;
  processingTime?: number;
}

// Chat message with sources (for RAG responses)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: VerseSource[];
  timestamp: Date;
  mode?: ChatMode;
  toolsUsed?: string[];
  celebration?: CelebrationData;
  suggestedActions?: SuggestedAction[];
}

// Celebration data for UI animations
export interface CelebrationData {
  type: 'answered_prayer' | 'memory_milestone' | 'growth_insight' | 'obedience_completed';
  message: string;
}

// Suggested quick actions
export interface SuggestedAction {
  label: string;
  prompt: string;
  icon?: string;
}

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
  | 'examen';

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

// Prayer request types
export type PrayerStatus = 'active' | 'answered' | 'ongoing';

export interface PrayerRequest {
  id: string;
  userId: string;
  circleId?: string;
  request: string;
  scriptureAnchor?: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
  status: PrayerStatus;
  answeredAt?: Date;
  answeredReflection?: string;
  createdAt: Date;
}

// Memory verse with spaced repetition
export interface MemoryVerse {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  text: string;
  translation: string;
  mnemonic?: string;
  storyVersion?: string;
  easeFactor: number;
  intervalDays: number;
  nextReview: Date;
  reviewCount: number;
  createdAt: Date;
}

// Bible annotation types
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export interface VerseHighlight {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  createdAt: Date;
}

export interface VerseNote {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerseBookmark {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  label?: string;
  createdAt: Date;
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

// Prayer circle (group)
export interface PrayerCircle {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  memberCount?: number;
  createdAt: Date;
}

// Circle member
export interface CircleMember {
  circleId: string;
  userId: string;
  displayName?: string;
  joinedAt: Date;
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

// User profile
export interface UserProfile {
  id: string;
  displayName?: string;
  preferredTranslation: string;
  maturityLevel: 'new_believer' | 'growing' | 'mature' | 'leader';
  dailyDevotional: boolean;
  eveningExamen: boolean;
  currentRhythm?: string;
  notificationToken?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Store state type
export interface AppState {
  // Chat state
  messages: ChatMessage[];
  isQuerying: boolean;
  currentMode: ChatMode;

  // Chat FAB state
  chatContext: ChatContext;
  chatSheetOpen: boolean;

  // Daily verse
  dailyVerse: DailyVerse | null;

  // User preferences
  preferences: UserPreferences;

  // Spiritual data
  activePrayers: PrayerRequest[];
  memoryVersesDue: MemoryVerse[];
  pendingObedienceSteps: ObedienceStep[];
  recentMoments: SpiritualMoment[];

  // Journal state
  currentDraft: JournalDraft | null;
  savedDrafts: JournalDraft[];
  dailyPrompts: JournalPrompt[];

  // Actions
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setDailyVerse: (verse: DailyVerse | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setIsQuerying: (isQuerying: boolean) => void;
  setCurrentMode: (mode: ChatMode) => void;
  setActivePrayers: (prayers: PrayerRequest[]) => void;
  setMemoryVersesDue: (verses: MemoryVerse[]) => void;
  setPendingObedienceSteps: (steps: ObedienceStep[]) => void;
  setRecentMoments: (moments: SpiritualMoment[]) => void;
  addPrayer: (prayer: PrayerRequest) => void;
  updatePrayer: (id: string, updates: Partial<PrayerRequest>) => void;
  addMoment: (moment: SpiritualMoment) => void;
  updateMoment: (id: string, updates: Partial<SpiritualMoment>) => void;
  deleteMoment: (id: string) => void;

  // Chat FAB actions
  setChatContext: (context: Partial<ChatContext>) => void;
  setChatSheetOpen: (open: boolean) => void;

  // Journal actions
  setCurrentDraft: (draft: JournalDraft | null) => void;
  updateDraft: (updates: Partial<JournalDraft>) => void;
  saveDraft: (draft: JournalDraft) => void;
  deleteDraft: (draftId: string) => void;
  clearDraft: () => void;
  setDailyPrompts: (prompts: JournalPrompt[]) => void;
}

// Supabase table types
export interface BibleVerseRow {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  embedding?: number[];
}

export interface QueryLogRow {
  id: number;
  query: string;
  response: string;
  sources: VerseSource[];
  created_at: string;
  user_id?: string;
}

// Companion API types
export interface CompanionRequest {
  userId: string;
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  contextMode: ChatMode;
}

export interface CompanionResponse {
  response: string;
  sources: VerseSource[];
  toolsUsed?: string[];
  celebration?: CelebrationData;
  suggestedActions?: SuggestedAction[];
  savedData?: {
    journalId?: string;
    prayerId?: string;
    momentId?: string;
  };
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

// Chat context for FAB awareness
export type ChatScreenType = 'home' | 'bible' | 'devotional' | 'journey' | 'settings' | 'other';

export interface ChatBibleContext {
  book: string;
  chapter: number;
  selectedVerse?: {
    verse: number;
    text: string;
    translation: Translation;
  };
}

export interface ChatDevotionalContext {
  seriesId: string;
  seriesTitle: string;
  dayNumber: number;
  scriptureRef?: string;
}

export interface ChatContext {
  screenType: ChatScreenType;
  bibleContext?: ChatBibleContext;
  devotionalContext?: ChatDevotionalContext;
  timestamp: Date;
}
