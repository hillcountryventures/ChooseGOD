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

// Bible translations - only those actually seeded in database
export type Translation =
  // English
  | 'KJV' | 'NIV' | 'ASV'
  // Spanish
  | 'RVR' | 'RVR1960'
  // Portuguese
  | 'PAA'
  // German
  | 'SCHLACHTER'
  // French
  | 'FRENCH'
  // Chinese
  | 'CUV'
  // Korean
  | 'KOREAN'
  // Russian
  | 'SYNODAL'
  // Greek
  | 'GREEK'
  // Vietnamese
  | 'VIETNAMESE'
  // Romanian
  | 'ROMANIAN'
  // Finnish
  | 'FINNISH';

export interface TranslationInfo {
  id: Translation;
  name: string;
  description: string;
  language: string;
}

// Only translations actually seeded in database
export const TRANSLATIONS: TranslationInfo[] = [
  // ===== ENGLISH =====
  {
    id: 'NIV',
    name: 'New International Version',
    description: 'Modern, easy to read',
    language: 'English',
  },
  {
    id: 'KJV',
    name: 'King James Version',
    description: 'Classic, traditional (1611)',
    language: 'English',
  },
  {
    id: 'ASV',
    name: 'American Standard Version',
    description: 'Literal, word-for-word',
    language: 'English',
  },

  // ===== SPANISH =====
  {
    id: 'RVR1960',
    name: 'Reina-Valera 1960',
    description: 'La más popular en español',
    language: 'Español',
  },
  {
    id: 'RVR',
    name: 'Reina-Valera',
    description: 'Traducción clásica',
    language: 'Español',
  },

  // ===== PORTUGUESE =====
  {
    id: 'PAA',
    name: 'Almeida Atualizada',
    description: 'Tradução portuguesa',
    language: 'Português',
  },

  // ===== GERMAN =====
  {
    id: 'SCHLACHTER',
    name: 'Schlachter',
    description: 'Deutsche Übersetzung',
    language: 'Deutsch',
  },

  // ===== FRENCH =====
  {
    id: 'FRENCH',
    name: 'Bible Française',
    description: 'Traduction française',
    language: 'Français',
  },

  // ===== CHINESE =====
  {
    id: 'CUV',
    name: '和合本',
    description: 'Chinese Union Version',
    language: '中文',
  },

  // ===== KOREAN =====
  {
    id: 'KOREAN',
    name: '한국어 성경',
    description: 'Korean Bible',
    language: '한국어',
  },

  // ===== RUSSIAN =====
  {
    id: 'SYNODAL',
    name: 'Синодальный',
    description: 'Синодальный перевод',
    language: 'Русский',
  },

  // ===== GREEK =====
  {
    id: 'GREEK',
    name: 'Ελληνική Βίβλος',
    description: 'Greek Bible',
    language: 'Ελληνικά',
  },

  // ===== VIETNAMESE =====
  {
    id: 'VIETNAMESE',
    name: 'Kinh Thánh',
    description: 'Vietnamese Bible',
    language: 'Tiếng Việt',
  },

  // ===== ROMANIAN =====
  {
    id: 'ROMANIAN',
    name: 'Cornilescu',
    description: 'Biblia Cornilescu',
    language: 'Română',
  },

  // ===== FINNISH =====
  {
    id: 'FINNISH',
    name: 'Raamattu',
    description: 'Finnish Bible',
    language: 'Suomi',
  },
];

// All translations are available (we removed unavailable ones)
export const AVAILABLE_TRANSLATIONS = TRANSLATIONS;

// Helper to get translations by language
export const getTranslationsByLanguage = (language: string) =>
  TRANSLATIONS.filter(t => t.language === language);

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

// Daily verse
export interface DailyVerse {
  verse: BibleVerse;
  date: string;
  translation?: Translation;
  reflection?: string;
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
