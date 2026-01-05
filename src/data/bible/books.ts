/**
 * Bible book data - canonical structure and metadata
 */

export const BIBLE_BOOKS = {
  'Old Testament': [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  ],
  'New Testament': [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
    'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
    'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation',
  ],
} as const;

// Flat list of all books in canonical order
export const ALL_BOOKS = [
  ...BIBLE_BOOKS['Old Testament'],
  ...BIBLE_BOOKS['New Testament'],
] as const;

// Chapter counts for each book
export const BOOK_CHAPTERS: Record<string, number> = {
  'Genesis': 50,
  'Exodus': 40,
  'Leviticus': 27,
  'Numbers': 36,
  'Deuteronomy': 34,
  'Joshua': 24,
  'Judges': 21,
  'Ruth': 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Kings': 22,
  '2 Kings': 25,
  '1 Chronicles': 29,
  '2 Chronicles': 36,
  'Ezra': 10,
  'Nehemiah': 13,
  'Esther': 10,
  'Job': 42,
  'Psalms': 150,
  'Proverbs': 31,
  'Ecclesiastes': 12,
  'Song of Solomon': 8,
  'Isaiah': 66,
  'Jeremiah': 52,
  'Lamentations': 5,
  'Ezekiel': 48,
  'Daniel': 12,
  'Hosea': 14,
  'Joel': 3,
  'Amos': 9,
  'Obadiah': 1,
  'Jonah': 4,
  'Micah': 7,
  'Nahum': 3,
  'Habakkuk': 3,
  'Zephaniah': 3,
  'Haggai': 2,
  'Zechariah': 14,
  'Malachi': 4,
  'Matthew': 28,
  'Mark': 16,
  'Luke': 24,
  'John': 21,
  'Acts': 28,
  'Romans': 16,
  '1 Corinthians': 16,
  '2 Corinthians': 13,
  'Galatians': 6,
  'Ephesians': 6,
  'Philippians': 4,
  'Colossians': 4,
  '1 Thessalonians': 5,
  '2 Thessalonians': 3,
  '1 Timothy': 6,
  '2 Timothy': 4,
  'Titus': 3,
  'Philemon': 1,
  'Hebrews': 13,
  'James': 5,
  '1 Peter': 5,
  '2 Peter': 3,
  '1 John': 5,
  '2 John': 1,
  '3 John': 1,
  'Jude': 1,
  'Revelation': 22,
};

// Book abbreviations for parsing and display
export const BOOK_ABBREVIATIONS: Record<string, string[]> = {
  'Genesis': ['gen', 'ge', 'gn'],
  'Exodus': ['exod', 'exo', 'ex'],
  'Leviticus': ['lev', 'le', 'lv'],
  'Numbers': ['num', 'nu', 'nm', 'nb'],
  'Deuteronomy': ['deut', 'de', 'dt'],
  'Joshua': ['josh', 'jos', 'jsh'],
  'Judges': ['judg', 'jdg', 'jg', 'jdgs'],
  'Ruth': ['rth', 'ru'],
  '1 Samuel': ['1sam', '1sa', '1s', 'i sam', 'i sa'],
  '2 Samuel': ['2sam', '2sa', '2s', 'ii sam', 'ii sa'],
  '1 Kings': ['1kgs', '1ki', '1k', 'i kgs', 'i ki'],
  '2 Kings': ['2kgs', '2ki', '2k', 'ii kgs', 'ii ki'],
  '1 Chronicles': ['1chr', '1ch', 'i chr', 'i ch'],
  '2 Chronicles': ['2chr', '2ch', 'ii chr', 'ii ch'],
  'Ezra': ['ezr', 'ez'],
  'Nehemiah': ['neh', 'ne'],
  'Esther': ['esth', 'est', 'es'],
  'Job': ['jb'],
  'Psalms': ['ps', 'psa', 'psm', 'pss', 'psalm'],
  'Proverbs': ['prov', 'pro', 'prv', 'pr'],
  'Ecclesiastes': ['eccl', 'ecc', 'ec', 'qoh'],
  'Song of Solomon': ['song', 'sos', 'so', 'canticles', 'cant'],
  'Isaiah': ['isa', 'is'],
  'Jeremiah': ['jer', 'je', 'jr'],
  'Lamentations': ['lam', 'la'],
  'Ezekiel': ['ezek', 'eze', 'ezk'],
  'Daniel': ['dan', 'da', 'dn'],
  'Hosea': ['hos', 'ho'],
  'Joel': ['joe', 'jl'],
  'Amos': ['am'],
  'Obadiah': ['obad', 'ob'],
  'Jonah': ['jon', 'jnh'],
  'Micah': ['mic', 'mc'],
  'Nahum': ['nah', 'na'],
  'Habakkuk': ['hab', 'hb'],
  'Zephaniah': ['zeph', 'zep', 'zp'],
  'Haggai': ['hag', 'hg'],
  'Zechariah': ['zech', 'zec', 'zc'],
  'Malachi': ['mal', 'ml'],
  'Matthew': ['matt', 'mat', 'mt'],
  'Mark': ['mrk', 'mk', 'mr'],
  'Luke': ['luk', 'lk'],
  'John': ['joh', 'jhn', 'jn'],
  'Acts': ['act', 'ac'],
  'Romans': ['rom', 'ro', 'rm'],
  '1 Corinthians': ['1cor', '1co', 'i cor', 'i co'],
  '2 Corinthians': ['2cor', '2co', 'ii cor', 'ii co'],
  'Galatians': ['gal', 'ga'],
  'Ephesians': ['eph', 'ephes'],
  'Philippians': ['phil', 'php', 'pp'],
  'Colossians': ['col', 'co'],
  '1 Thessalonians': ['1thess', '1th', 'i thess', 'i th'],
  '2 Thessalonians': ['2thess', '2th', 'ii thess', 'ii th'],
  '1 Timothy': ['1tim', '1ti', 'i tim', 'i ti'],
  '2 Timothy': ['2tim', '2ti', 'ii tim', 'ii ti'],
  'Titus': ['tit', 'ti'],
  'Philemon': ['philem', 'phm', 'pm'],
  'Hebrews': ['heb'],
  'James': ['jas', 'jm'],
  '1 Peter': ['1pet', '1pe', '1pt', 'i pet', 'i pe'],
  '2 Peter': ['2pet', '2pe', '2pt', 'ii pet', 'ii pe'],
  '1 John': ['1john', '1jn', '1joh', 'i john', 'i jn'],
  '2 John': ['2john', '2jn', '2joh', 'ii john', 'ii jn'],
  '3 John': ['3john', '3jn', '3joh', 'iii john', 'iii jn'],
  'Jude': ['jud', 'jd'],
  'Revelation': ['rev', 're', 'the revelation'],
};

// Helper to get chapter count for a book
export const getChapterCount = (book: string): number => {
  return BOOK_CHAPTERS[book] || 1;
};

// Helper to check if a book exists
export const isValidBook = (book: string): boolean => {
  return book in BOOK_CHAPTERS;
};

// Helper to get testament for a book
export const getTestament = (book: string): 'Old Testament' | 'New Testament' | null => {
  if (BIBLE_BOOKS['Old Testament'].includes(book as any)) return 'Old Testament';
  if (BIBLE_BOOKS['New Testament'].includes(book as any)) return 'New Testament';
  return null;
};
