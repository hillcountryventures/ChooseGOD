import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps as RNBottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { OnboardingResponses, DevotionalSeries } from './devotional';
import type { ChatMode } from './domain/chat';
import type { BibleVerse, VerseSource } from './domain/bible';

// Auth Stack Navigator param list
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Onboarding Stack Navigator param list
export type OnboardingStackParamList = {
  // Primary 4-screen flow (Decision #7)
  Welcome: undefined;
  GraceModeDemo: undefined;
  Quiz: { emotionalContext?: string } | undefined;
  NotificationSetup: { selectedSeriesIds?: string[] };

  // Legacy \u2014 retained for deep-link compat only
  Carousel: undefined;
  Recommendations: { quizResponses: OnboardingResponses };
  AIDemo: { selectedSeriesIds?: string[]; emotionalContext?: string; skipPaywall?: boolean };
  TranslationSelect: { emotionalContext?: string };
  Paywall: { selectedSeriesIds: string[] };
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
  Referral: undefined;
  PrivacyCenter: undefined;
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
    conversationId?: string; // Resume a saved conversation
  };
  ConversationList: undefined;
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
  SubscriptionDebug: undefined;
  CameraScreen: {
    mode: 'scripture-scan';
  };
  MemoryPractice: undefined;
  LectioDivina: {
    verseRef?: string;
    verseText?: string;
  };
  JourneyInsights: undefined;
  PrayerCircles: undefined;
  CircleDetail: {
    circleId: string;
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
