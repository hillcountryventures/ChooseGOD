/**
 * String constants for default values and UI text
 */

// Default Bible settings
export const BIBLE_DEFAULTS = {
  translation: 'KJV',
  book: 'Proverbs',
  chapter: 1,
  verse: 1,
} as const;

// Supported translations
export const TRANSLATIONS = {
  KJV: 'KJV',
  ESV: 'ESV',
  NIV: 'NIV',
  NASB: 'NASB',
  NLT: 'NLT',
} as const;

// Font size options
export const FONT_SIZE_OPTIONS = {
  small: 'small',
  medium: 'medium',
  large: 'large',
} as const;

// Maturity levels
export const MATURITY_LEVELS = {
  new: 'new',
  growing: 'growing',
  mature: 'mature',
} as const;

// Day abbreviations
export const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

// Full day names
export const WEEK_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// Greeting messages
export const GREETINGS = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
} as const;

// Placeholder texts
export const PLACEHOLDERS = {
  chatInput: 'Ask anything about Scripture...',
  journalPrompt: "What's on your heart today?",
  noteInput: 'Write your notes, thoughts, or reflections...',
  search: 'Search the Bible...',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  verse: "Loading today's verse...",
  chapter: 'Loading chapter...',
  devotional: 'Loading devotional...',
  search: 'Searching...',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  edgeFunctionNotDeployed: 'Edge Function may not be deployed',
  missingEnvVars: 'Missing environment variables',
  databaseFunctionMissing: 'Database function missing',
  networkError: 'Network error. Please check your connection.',
  genericError: 'Something went wrong. Please try again.',
} as const;

// Empty state messages
export const EMPTY_STATES = {
  journeyTitle: 'Your Journey Begins',
  journeySubtitle: 'Start capturing moments of faith, reflection, and growth.',
  journeyCta: 'Record your first moment',
  noResults: 'No results found',
  noVerses: 'No verses found',
} as const;

// Streak messages
export const STREAK_MESSAGES = {
  active: (days: number) => `${days} day streak`,
  inactive: 'Start your streak',
} as const;
