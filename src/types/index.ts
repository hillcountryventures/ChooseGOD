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
  ChatHub: {
    contextVerse?: {
      book: string;
      chapter: number;
      verse: number;
      text: string;
      translation: string;
    };
    contextMode?: ChatMode;
    initialMessage?: string;
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

// Wit level for Grok-style personality
export type WitLevel = 'low' | 'medium' | 'high';

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
  translation?: Translation;
  reflection?: string;
}

// Bible translations
// Use AVAILABLE_TRANSLATIONS to get only translations seeded in the database
export type Translation =
  // English (Public Domain)
  | 'KJV' | 'ASV' | 'BBE' | 'WEB' | 'DARBY' | 'YLT'
  // Spanish
  | 'RVR'
  // Portuguese
  | 'PAA' | 'PACF'
  // German (Public Domain)
  | 'LUTHER' | 'SCHLACHTER'
  // French
  | 'FRENCH'
  // Chinese
  | 'CUV' | 'CNCV'
  // Korean
  | 'KOREAN'
  // Russian (Public Domain)
  | 'SYNODAL'
  // Arabic (Public Domain)
  | 'ARABIC'
  // Greek (Public Domain)
  | 'GREEK'
  // Vietnamese
  | 'VIETNAMESE'
  // Romanian (Public Domain)
  | 'ROMANIAN'
  // Finnish (Public Domain)
  | 'FINNISH';

export interface TranslationInfo {
  id: Translation;
  name: string;
  description: string;
  language: string;
  isAvailable: boolean; // Whether this translation is seeded in the database
}

export const TRANSLATIONS: TranslationInfo[] = [
  // ===== ENGLISH (Public Domain) =====
  {
    id: 'KJV',
    name: 'King James Version',
    description: 'Classic, traditional English (1611)',
    language: 'English',
    isAvailable: true,
  },
  {
    id: 'ASV',
    name: 'American Standard Version',
    description: 'Literal word-for-word (1901)',
    language: 'English',
    isAvailable: true,
  },
  {
    id: 'BBE',
    name: 'Bible in Basic English',
    description: 'Simple vocabulary translation',
    language: 'English',
    isAvailable: true,
  },
  {
    id: 'WEB',
    name: 'World English Bible',
    description: 'Modern public domain',
    language: 'English',
    isAvailable: false,
  },
  {
    id: 'DARBY',
    name: 'Darby Translation',
    description: 'Literal by J.N. Darby',
    language: 'English',
    isAvailable: false,
  },
  {
    id: 'YLT',
    name: "Young's Literal",
    description: 'Extremely literal translation',
    language: 'English',
    isAvailable: false,
  },

  // ===== SPANISH =====
  {
    id: 'RVR',
    name: 'Reina-Valera 1960',
    description: 'Traducción clásica en español',
    language: 'Español',
    isAvailable: true,
  },

  // ===== PORTUGUESE =====
  {
    id: 'PAA',
    name: 'Almeida Atualizada',
    description: 'Tradução portuguesa',
    language: 'Português',
    isAvailable: true,
  },
  {
    id: 'PACF',
    name: 'Almeida Corrigida',
    description: 'Tradução fiel',
    language: 'Português',
    isAvailable: false,
  },

  // ===== GERMAN =====
  {
    id: 'LUTHER',
    name: 'Luther 1912',
    description: 'Martin Luther Übersetzung',
    language: 'Deutsch',
    isAvailable: false,
  },
  {
    id: 'SCHLACHTER',
    name: 'Schlachter',
    description: 'Schlachter Übersetzung',
    language: 'Deutsch',
    isAvailable: true,
  },

  // ===== FRENCH =====
  {
    id: 'FRENCH',
    name: 'French Bible',
    description: 'Traduction française',
    language: 'Français',
    isAvailable: true,
  },

  // ===== CHINESE =====
  {
    id: 'CUV',
    name: '和合本',
    description: 'Chinese Union Version',
    language: '中文',
    isAvailable: true,
  },
  {
    id: 'CNCV',
    name: '新译本',
    description: 'New Contemporary',
    language: '中文',
    isAvailable: false,
  },

  // ===== KOREAN =====
  {
    id: 'KOREAN',
    name: '한국어 성경',
    description: 'Korean Bible',
    language: '한국어',
    isAvailable: true,
  },

  // ===== RUSSIAN =====
  {
    id: 'SYNODAL',
    name: 'Синодальный',
    description: 'Synodal Translation',
    language: 'Русский',
    isAvailable: true,
  },

  // ===== ARABIC =====
  {
    id: 'ARABIC',
    name: 'الكتاب المقدس',
    description: 'Smith & Van Dyke',
    language: 'العربية',
    isAvailable: true,
  },

  // ===== GREEK =====
  {
    id: 'GREEK',
    name: 'Ελληνική Βίβλος',
    description: 'Greek Bible',
    language: 'Ελληνικά',
    isAvailable: true,
  },

  // ===== VIETNAMESE =====
  {
    id: 'VIETNAMESE',
    name: 'Kinh Thánh',
    description: 'Vietnamese Bible',
    language: 'Tiếng Việt',
    isAvailable: true,
  },

  // ===== ROMANIAN =====
  {
    id: 'ROMANIAN',
    name: 'Cornilescu',
    description: 'Biblia Cornilescu',
    language: 'Română',
    isAvailable: true,
  },

  // ===== FINNISH =====
  {
    id: 'FINNISH',
    name: 'Raamattu',
    description: 'Finnish Bible',
    language: 'Suomi',
    isAvailable: true,
  },
];

// Helper to get only available translations (seeded in database)
export const AVAILABLE_TRANSLATIONS = TRANSLATIONS.filter(t => t.isAvailable);

// Helper to get translations by language
export const getTranslationsByLanguage = (language: string) =>
  TRANSLATIONS.filter(t => t.language === language);

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
  witLevel: WitLevel;
  isTyping: boolean;

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
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setDailyVerse: (verse: DailyVerse | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setIsQuerying: (isQuerying: boolean) => void;
  setCurrentMode: (mode: ChatMode) => void;
  setWitLevel: (level: WitLevel) => void;
  setIsTyping: (isTyping: boolean) => void;
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
  pendingMessage?: string; // Auto-send this message when chat opens
}
