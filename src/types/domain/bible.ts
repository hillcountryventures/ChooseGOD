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

// Bible translations
// Use AVAILABLE_TRANSLATIONS to get only translations seeded in the database
export type Translation =
  // English (Public Domain & Modern)
  | 'KJV' | 'NIV' | 'ASV' | 'BBE' | 'WEB' | 'DARBY' | 'YLT'
  // Spanish
  | 'RVR' | 'RVR1960'
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
  // ===== ENGLISH =====
  {
    id: 'KJV',
    name: 'King James Version',
    description: 'Classic, traditional English (1611)',
    language: 'English',
    isAvailable: true,
  },
  {
    id: 'NIV',
    name: 'New International Version',
    description: 'Modern, readable English translation',
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
    description: 'Simple vocabulary translation (partial)',
    language: 'English',
    isAvailable: false, // Only 6,675 verses - incomplete
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
    name: 'Reina-Valera',
    description: 'Traducción clásica en español',
    language: 'Español',
    isAvailable: true,
  },
  {
    id: 'RVR1960',
    name: 'Reina-Valera 1960',
    description: 'Revisión 1960 en español',
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
    isAvailable: false, // Not yet seeded
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
