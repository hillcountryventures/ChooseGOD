import { logger } from '../utils/logger';
/**
 * AudioTreasure Public Domain Bible Audio
 * 
 * Free KJV audio from audiotreasure.com - no API key required!
 * License: Public domain, can be "copied and used for ministry purposes"
 * 
 * URL Pattern: https://audiotreasure.com/content/KJV_AT/{bookNum}_{BookName}{chapter}.mp3
 */

// =============================================================================
// Book Mapping
// =============================================================================

interface BookInfo {
  number: string; // 2-digit padded (01-66)
  name: string;   // Exact name used in URL
  chapters: number;
}

const BOOKS: BookInfo[] = [
  // Old Testament
  { number: '01', name: 'Genesis', chapters: 50 },
  { number: '02', name: 'Exodus', chapters: 40 },
  { number: '03', name: 'Leviticus', chapters: 27 },
  { number: '04', name: 'Numbers', chapters: 36 },
  { number: '05', name: 'Deuteronomy', chapters: 34 },
  { number: '06', name: 'Joshua', chapters: 24 },
  { number: '07', name: 'Judges', chapters: 21 },
  { number: '08', name: 'Ruth', chapters: 4 },
  { number: '09', name: '1Samuel', chapters: 31 },
  { number: '10', name: '2Samuel', chapters: 24 },
  { number: '11', name: '1Kings', chapters: 22 },
  { number: '12', name: '2Kings', chapters: 25 },
  { number: '13', name: '1Chronicles', chapters: 29 },
  { number: '14', name: '2Chronicles', chapters: 36 },
  { number: '15', name: 'Ezra', chapters: 10 },
  { number: '16', name: 'Nehemiah', chapters: 13 },
  { number: '17', name: 'Esther', chapters: 10 },
  { number: '18', name: 'Job', chapters: 42 },
  { number: '19', name: 'Psalms', chapters: 150 },
  { number: '20', name: 'Proverbs', chapters: 31 },
  { number: '21', name: 'Ecclesiastes', chapters: 12 },
  { number: '22', name: 'SongOfSolomon', chapters: 8 },
  { number: '23', name: 'Isaiah', chapters: 66 },
  { number: '24', name: 'Jeremiah', chapters: 52 },
  { number: '25', name: 'Lamentations', chapters: 5 },
  { number: '26', name: 'Ezekiel', chapters: 48 },
  { number: '27', name: 'Daniel', chapters: 12 },
  { number: '28', name: 'Hosea', chapters: 14 },
  { number: '29', name: 'Joel', chapters: 3 },
  { number: '30', name: 'Amos', chapters: 9 },
  { number: '31', name: 'Obadiah', chapters: 1 },
  { number: '32', name: 'Jonah', chapters: 4 },
  { number: '33', name: 'Micah', chapters: 7 },
  { number: '34', name: 'Nahum', chapters: 3 },
  { number: '35', name: 'Habakkuk', chapters: 3 },
  { number: '36', name: 'Zephaniah', chapters: 3 },
  { number: '37', name: 'Haggai', chapters: 2 },
  { number: '38', name: 'Zechariah', chapters: 14 },
  { number: '39', name: 'Malachi', chapters: 4 },
  // New Testament
  { number: '40', name: 'Matthew', chapters: 28 },
  { number: '41', name: 'Mark', chapters: 16 },
  { number: '42', name: 'Luke', chapters: 24 },
  { number: '43', name: 'John', chapters: 21 },
  { number: '44', name: 'Acts', chapters: 28 },
  { number: '45', name: 'Romans', chapters: 16 },
  { number: '46', name: '1Corinthians', chapters: 16 },
  { number: '47', name: '2Corinthians', chapters: 13 },
  { number: '48', name: 'Galatians', chapters: 6 },
  { number: '49', name: 'Ephesians', chapters: 6 },
  { number: '50', name: 'Philippians', chapters: 4 },
  { number: '51', name: 'Colossians', chapters: 4 },
  { number: '52', name: '1Thessalonians', chapters: 5 },
  { number: '53', name: '2Thessalonians', chapters: 3 },
  { number: '54', name: '1Timothy', chapters: 6 },
  { number: '55', name: '2Timothy', chapters: 4 },
  { number: '56', name: 'Titus', chapters: 3 },
  { number: '57', name: 'Philemon', chapters: 1 },
  { number: '58', name: 'Hebrews', chapters: 13 },
  { number: '59', name: 'James', chapters: 5 },
  { number: '60', name: '1Peter', chapters: 5 },
  { number: '61', name: '2Peter', chapters: 3 },
  { number: '62', name: '1John', chapters: 5 },
  { number: '63', name: '2John', chapters: 1 },
  { number: '64', name: '3John', chapters: 1 },
  { number: '65', name: 'Jude', chapters: 1 },
  { number: '66', name: 'Revelation', chapters: 22 },
];

// Map from common book names to AudioTreasure format
const BOOK_NAME_MAP: Record<string, string> = {
  'Genesis': 'Genesis',
  'Exodus': 'Exodus',
  'Leviticus': 'Leviticus',
  'Numbers': 'Numbers',
  'Deuteronomy': 'Deuteronomy',
  'Joshua': 'Joshua',
  'Judges': 'Judges',
  'Ruth': 'Ruth',
  '1 Samuel': '1Samuel',
  '2 Samuel': '2Samuel',
  '1 Kings': '1Kings',
  '2 Kings': '2Kings',
  '1 Chronicles': '1Chronicles',
  '2 Chronicles': '2Chronicles',
  'Ezra': 'Ezra',
  'Nehemiah': 'Nehemiah',
  'Esther': 'Esther',
  'Job': 'Job',
  'Psalms': 'Psalms',
  'Psalm': 'Psalms',
  'Proverbs': 'Proverbs',
  'Ecclesiastes': 'Ecclesiastes',
  'Song of Solomon': 'SongOfSolomon',
  'Song of Songs': 'SongOfSolomon',
  'Isaiah': 'Isaiah',
  'Jeremiah': 'Jeremiah',
  'Lamentations': 'Lamentations',
  'Ezekiel': 'Ezekiel',
  'Daniel': 'Daniel',
  'Hosea': 'Hosea',
  'Joel': 'Joel',
  'Amos': 'Amos',
  'Obadiah': 'Obadiah',
  'Jonah': 'Jonah',
  'Micah': 'Micah',
  'Nahum': 'Nahum',
  'Habakkuk': 'Habakkuk',
  'Zephaniah': 'Zephaniah',
  'Haggai': 'Haggai',
  'Zechariah': 'Zechariah',
  'Malachi': 'Malachi',
  'Matthew': 'Matthew',
  'Mark': 'Mark',
  'Luke': 'Luke',
  'John': 'John',
  'Acts': 'Acts',
  'Romans': 'Romans',
  '1 Corinthians': '1Corinthians',
  '2 Corinthians': '2Corinthians',
  'Galatians': 'Galatians',
  'Ephesians': 'Ephesians',
  'Philippians': 'Philippians',
  'Colossians': 'Colossians',
  '1 Thessalonians': '1Thessalonians',
  '2 Thessalonians': '2Thessalonians',
  '1 Timothy': '1Timothy',
  '2 Timothy': '2Timothy',
  'Titus': 'Titus',
  'Philemon': 'Philemon',
  'Hebrews': 'Hebrews',
  'James': 'James',
  '1 Peter': '1Peter',
  '2 Peter': '2Peter',
  '1 John': '1John',
  '2 John': '2John',
  '3 John': '3John',
  'Jude': 'Jude',
  'Revelation': 'Revelation',
};

// =============================================================================
// Service Functions
// =============================================================================

const BASE_URL = 'https://audiotreasure.com/content/KJV_AT';

/**
 * Get the AudioTreasure book info for a given book name
 */
function getBookInfo(bookName: string): BookInfo | null {
  const normalizedName = BOOK_NAME_MAP[bookName];
  if (!normalizedName) return null;
  
  return BOOKS.find(b => b.name === normalizedName) || null;
}

/**
 * Get direct MP3 URL for a chapter
 * 
 * @param bookName - Book name (e.g., "Genesis", "1 Corinthians")
 * @param chapter - Chapter number
 * @returns Direct MP3 URL or null if not found
 */
export function getChapterAudioUrl(bookName: string, chapter: number): string | null {
  const book = getBookInfo(bookName);
  if (!book) {
    logger.warn(`AudioTreasure: Unknown book "${bookName}"`);
    return null;
  }
  
  if (chapter < 1 || chapter > book.chapters) {
    logger.warn(`AudioTreasure: Invalid chapter ${chapter} for ${bookName} (max: ${book.chapters})`);
    return null;
  }
  
  // Pad chapter to 3 digits (001, 002, etc.)
  const chapterPadded = chapter.toString().padStart(3, '0');
  
  return `${BASE_URL}/${book.number}_${book.name}${chapterPadded}.mp3`;
}

/**
 * Get all chapter URLs for a book
 */
export function getBookAudioUrls(bookName: string): string[] {
  const book = getBookInfo(bookName);
  if (!book) return [];
  
  const urls: string[] = [];
  for (let ch = 1; ch <= book.chapters; ch++) {
    const url = getChapterAudioUrl(bookName, ch);
    if (url) urls.push(url);
  }
  return urls;
}

/**
 * Check if a book is available in AudioTreasure
 */
export function isBookAvailable(bookName: string): boolean {
  return getBookInfo(bookName) !== null;
}

/**
 * Get chapter count for a book
 */
export function getChapterCount(bookName: string): number {
  const book = getBookInfo(bookName);
  return book?.chapters || 0;
}

/**
 * Service class for AudioTreasure (matches BibleBrain interface pattern)
 */
class AudioTreasureService {
  /**
   * Always configured (no API key needed!)
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Only KJV is available
   */
  hasAudioForTranslation(translation: string): boolean {
    return translation === 'KJV';
  }

  /**
   * Get audio URL for a chapter
   */
  async getChapterAudio(
    bookName: string,
    chapter: number
  ): Promise<{ path: string; bookName: string; chapter: number } | null> {
    const url = getChapterAudioUrl(bookName, chapter);
    if (!url) return null;
    
    return {
      path: url,
      bookName,
      chapter,
    };
  }
}

// =============================================================================
// Exports
// =============================================================================

export const audioTreasure = new AudioTreasureService();
export { AudioTreasureService };

// Quick test URLs
export const TEST_URLS = {
  genesis1: getChapterAudioUrl('Genesis', 1),
  psalm23: getChapterAudioUrl('Psalms', 23),
  john3: getChapterAudioUrl('John', 3),
  matthew5: getChapterAudioUrl('Matthew', 5),
};
