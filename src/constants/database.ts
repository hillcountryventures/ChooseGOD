/**
 * Database constants for Supabase tables and functions
 */

// Table names
export const TABLES = {
  bibleVerses: 'bible_verses',
  userProfiles: 'user_profiles',
  userAnnotations: 'user_annotations',
  userHighlights: 'user_highlights',
  userBookmarks: 'user_bookmarks',
  userNotes: 'user_notes',
  devotionals: 'devotionals',
  journalEntries: 'journal_entries',
  spiritualMoments: 'spiritual_moments',
  growthInsights: 'growth_insights',
} as const;

// Edge function names
export const EDGE_FUNCTIONS = {
  companion: 'companion',
  queryBible: 'query-bible',
  generateEmbedding: 'generate-embedding',
} as const;

// Column names (commonly referenced)
export const COLUMNS = {
  id: 'id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  userId: 'user_id',
  book: 'book',
  chapter: 'chapter',
  verse: 'verse',
  text: 'text',
  translation: 'translation',
  embedding: 'embedding',
} as const;

// RPC function names
export const RPC_FUNCTIONS = {
  matchVerses: 'match_verses',
  searchVerses: 'search_verses',
} as const;

// Notification channels
export const NOTIFICATION_CHANNELS = {
  devotionalReminders: 'devotional-reminders',
  dailyVerse: 'daily-verse',
} as const;
