/**
 * Verse Parser Utility
 * Parses and detects Bible verse references in text
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Every verse reference should be tappable, pointing users back to Scripture
 */

// All Bible book names with common abbreviations
const BOOK_PATTERNS: Record<string, string> = {
  // Old Testament
  'genesis': 'Genesis',
  'gen': 'Genesis',
  'ge': 'Genesis',
  'exodus': 'Exodus',
  'exod': 'Exodus',
  'ex': 'Exodus',
  'leviticus': 'Leviticus',
  'lev': 'Leviticus',
  'lv': 'Leviticus',
  'numbers': 'Numbers',
  'num': 'Numbers',
  'nm': 'Numbers',
  'deuteronomy': 'Deuteronomy',
  'deut': 'Deuteronomy',
  'dt': 'Deuteronomy',
  'joshua': 'Joshua',
  'josh': 'Joshua',
  'jos': 'Joshua',
  'judges': 'Judges',
  'judg': 'Judges',
  'jdg': 'Judges',
  'ruth': 'Ruth',
  'ru': 'Ruth',
  '1 samuel': '1 Samuel',
  '1 sam': '1 Samuel',
  '1samuel': '1 Samuel',
  '1sam': '1 Samuel',
  '2 samuel': '2 Samuel',
  '2 sam': '2 Samuel',
  '2samuel': '2 Samuel',
  '2sam': '2 Samuel',
  '1 kings': '1 Kings',
  '1 kgs': '1 Kings',
  '1kings': '1 Kings',
  '1kgs': '1 Kings',
  '2 kings': '2 Kings',
  '2 kgs': '2 Kings',
  '2kings': '2 Kings',
  '2kgs': '2 Kings',
  '1 chronicles': '1 Chronicles',
  '1 chr': '1 Chronicles',
  '1chronicles': '1 Chronicles',
  '1chr': '1 Chronicles',
  '2 chronicles': '2 Chronicles',
  '2 chr': '2 Chronicles',
  '2chronicles': '2 Chronicles',
  '2chr': '2 Chronicles',
  'ezra': 'Ezra',
  'ezr': 'Ezra',
  'nehemiah': 'Nehemiah',
  'neh': 'Nehemiah',
  'esther': 'Esther',
  'est': 'Esther',
  'job': 'Job',
  'jb': 'Job',
  'psalms': 'Psalms',
  'psalm': 'Psalms',
  'ps': 'Psalms',
  'psa': 'Psalms',
  'proverbs': 'Proverbs',
  'prov': 'Proverbs',
  'pr': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes',
  'eccl': 'Ecclesiastes',
  'ecc': 'Ecclesiastes',
  'song of solomon': 'Song of Solomon',
  'song': 'Song of Solomon',
  'sos': 'Song of Solomon',
  'isaiah': 'Isaiah',
  'isa': 'Isaiah',
  'is': 'Isaiah',
  'jeremiah': 'Jeremiah',
  'jer': 'Jeremiah',
  'lamentations': 'Lamentations',
  'lam': 'Lamentations',
  'ezekiel': 'Ezekiel',
  'ezek': 'Ezekiel',
  'eze': 'Ezekiel',
  'daniel': 'Daniel',
  'dan': 'Daniel',
  'dn': 'Daniel',
  'hosea': 'Hosea',
  'hos': 'Hosea',
  'joel': 'Joel',
  'jl': 'Joel',
  'amos': 'Amos',
  'am': 'Amos',
  'obadiah': 'Obadiah',
  'obad': 'Obadiah',
  'ob': 'Obadiah',
  'jonah': 'Jonah',
  'jon': 'Jonah',
  'micah': 'Micah',
  'mic': 'Micah',
  'nahum': 'Nahum',
  'nah': 'Nahum',
  'habakkuk': 'Habakkuk',
  'hab': 'Habakkuk',
  'zephaniah': 'Zephaniah',
  'zeph': 'Zephaniah',
  'zep': 'Zephaniah',
  'haggai': 'Haggai',
  'hag': 'Haggai',
  'zechariah': 'Zechariah',
  'zech': 'Zechariah',
  'zec': 'Zechariah',
  'malachi': 'Malachi',
  'mal': 'Malachi',

  // New Testament
  'matthew': 'Matthew',
  'matt': 'Matthew',
  'mt': 'Matthew',
  'mark': 'Mark',
  'mk': 'Mark',
  'luke': 'Luke',
  'lk': 'Luke',
  'john': 'John',
  'jn': 'John',
  'acts': 'Acts',
  'ac': 'Acts',
  'romans': 'Romans',
  'rom': 'Romans',
  'rm': 'Romans',
  '1 corinthians': '1 Corinthians',
  '1 cor': '1 Corinthians',
  '1corinthians': '1 Corinthians',
  '1cor': '1 Corinthians',
  '2 corinthians': '2 Corinthians',
  '2 cor': '2 Corinthians',
  '2corinthians': '2 Corinthians',
  '2cor': '2 Corinthians',
  'galatians': 'Galatians',
  'gal': 'Galatians',
  'ephesians': 'Ephesians',
  'eph': 'Ephesians',
  'philippians': 'Philippians',
  'phil': 'Philippians',
  'php': 'Philippians',
  'colossians': 'Colossians',
  'col': 'Colossians',
  '1 thessalonians': '1 Thessalonians',
  '1 thess': '1 Thessalonians',
  '1thessalonians': '1 Thessalonians',
  '1thess': '1 Thessalonians',
  '2 thessalonians': '2 Thessalonians',
  '2 thess': '2 Thessalonians',
  '2thessalonians': '2 Thessalonians',
  '2thess': '2 Thessalonians',
  '1 timothy': '1 Timothy',
  '1 tim': '1 Timothy',
  '1timothy': '1 Timothy',
  '1tim': '1 Timothy',
  '2 timothy': '2 Timothy',
  '2 tim': '2 Timothy',
  '2timothy': '2 Timothy',
  '2tim': '2 Timothy',
  'titus': 'Titus',
  'tit': 'Titus',
  'philemon': 'Philemon',
  'philem': 'Philemon',
  'phm': 'Philemon',
  'hebrews': 'Hebrews',
  'heb': 'Hebrews',
  'james': 'James',
  'jas': 'James',
  'jm': 'James',
  '1 peter': '1 Peter',
  '1 pet': '1 Peter',
  '1peter': '1 Peter',
  '1pet': '1 Peter',
  '2 peter': '2 Peter',
  '2 pet': '2 Peter',
  '2peter': '2 Peter',
  '2pet': '2 Peter',
  '1 john': '1 John',
  '1 jn': '1 John',
  '1john': '1 John',
  '1jn': '1 John',
  '2 john': '2 John',
  '2 jn': '2 John',
  '2john': '2 John',
  '2jn': '2 John',
  '3 john': '3 John',
  '3 jn': '3 John',
  '3john': '3 John',
  '3jn': '3 John',
  'jude': 'Jude',
  'jd': 'Jude',
  'revelation': 'Revelation',
  'rev': 'Revelation',
  'rv': 'Revelation',
};

export interface ParsedVerse {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
  reference: string; // Original matched text
}

export interface DetectedReference {
  reference: string;
  parsed: ParsedVerse;
  start: number;
  end: number;
}

/**
 * Normalizes a book name to its canonical form
 */
function normalizeBookName(bookName: string): string | null {
  const normalized = bookName.toLowerCase().trim();
  return BOOK_PATTERNS[normalized] || null;
}

/**
 * Parses a single verse reference string
 * Examples: "John 3:16", "Romans 8:28-30", "Psalm 23", "1 Cor 13:4-7"
 */
export function parseReference(reference: string): ParsedVerse | null {
  if (!reference || typeof reference !== 'string') {
    return null;
  }

  // Clean up the reference
  const cleaned = reference.trim();

  // Regex to match verse references
  // Matches: "Book Chapter:Verse" or "Book Chapter:Verse-EndVerse" or "Book Chapter"
  const verseRegex = /^(\d?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i;

  const match = cleaned.match(verseRegex);
  if (!match) {
    return null;
  }

  const [, bookPart, chapterStr, verseStr, endVerseStr] = match;

  const book = normalizeBookName(bookPart);
  if (!book) {
    return null;
  }

  const chapter = parseInt(chapterStr, 10);
  if (isNaN(chapter) || chapter < 1) {
    return null;
  }

  const verse = verseStr ? parseInt(verseStr, 10) : undefined;
  const endVerse = endVerseStr ? parseInt(endVerseStr, 10) : undefined;

  return {
    book,
    chapter,
    verse,
    endVerse,
    reference: cleaned,
  };
}

/**
 * Detects all verse references in a text string
 * Returns array of detected references with their positions
 */
export function detectReferences(text: string): DetectedReference[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const results: DetectedReference[] = [];

  // Build regex pattern from all book names
  const bookNames = Object.keys(BOOK_PATTERNS)
    .map(name => name.replace(/\s+/g, '\\s+'))
    .sort((a, b) => b.length - a.length) // Sort by length (longest first) to match "1 Corinthians" before "1 Cor"
    .join('|');

  // Match pattern: Book Chapter:Verse or Book Chapter:Verse-EndVerse or Book Chapter
  const pattern = new RegExp(
    `((?:${bookNames}))\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?`,
    'gi'
  );

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, bookPart, chapterStr, verseStr, endVerseStr] = match;

    const book = normalizeBookName(bookPart);
    if (!book) continue;

    const chapter = parseInt(chapterStr, 10);
    const verse = verseStr ? parseInt(verseStr, 10) : undefined;
    const endVerse = endVerseStr ? parseInt(endVerseStr, 10) : undefined;

    results.push({
      reference: fullMatch,
      parsed: {
        book,
        chapter,
        verse,
        endVerse,
        reference: fullMatch,
      },
      start: match.index,
      end: match.index + fullMatch.length,
    });
  }

  return results;
}

/**
 * Formats a parsed verse back to a readable reference string
 */
export function formatReference(parsed: ParsedVerse): string {
  let ref = `${parsed.book} ${parsed.chapter}`;
  if (parsed.verse !== undefined) {
    ref += `:${parsed.verse}`;
    if (parsed.endVerse !== undefined && parsed.endVerse !== parsed.verse) {
      ref += `-${parsed.endVerse}`;
    }
  }
  return ref;
}

/**
 * Checks if a string contains any verse references
 */
export function containsVerseReference(text: string): boolean {
  return detectReferences(text).length > 0;
}

/**
 * Extracts just the book name from a reference
 */
export function extractBookName(reference: string): string | null {
  const parsed = parseReference(reference);
  return parsed?.book || null;
}

/**
 * Gets the canonical book name from any variation
 */
export function getCanonicalBookName(bookName: string): string | null {
  return normalizeBookName(bookName);
}

/**
 * List of all canonical book names in order
 */
export const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];
