/**
 * Single Book Seeding Script
 *
 * Usage:
 *   node supabase/scripts/seed-single-book.js "Matthew"
 *   node supabase/scripts/seed-single-book.js "Luke"
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const TARGET_BOOK = process.argv[2];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

if (!TARGET_BOOK) {
  console.error('Usage: node seed-single-book.js "Book Name"');
  console.error('Example: node seed-single-book.js "Matthew"');
  process.exit(1);
}

const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
  '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function insertVerse(verse) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?on_conflict=book,chapter,verse,translation`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify([verse]),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${error}`);
  }
  return true;
}

async function getExistingVerses(bookName) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?book=eq.${encodeURIComponent(bookName)}&translation=eq.kjv&select=chapter,verse`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!response.ok) return new Set();

  const data = await response.json();
  return new Set(data.map(v => `${v.chapter}:${v.verse}`));
}

async function main() {
  console.log(`=== Seeding: ${TARGET_BOOK} ===\n`);

  // Fetch Bible data
  console.log('Fetching Bible data...');
  const bibleResponse = await fetch('https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_kjv.json');
  const bibleData = await bibleResponse.json();

  // Find the book
  const bookIndex = BOOK_NAMES.findIndex(b => b.toLowerCase() === TARGET_BOOK.toLowerCase());
  if (bookIndex === -1) {
    console.error(`Book "${TARGET_BOOK}" not found. Available books:`);
    console.error(BOOK_NAMES.join(', '));
    process.exit(1);
  }

  const book = bibleData[bookIndex];
  const bookName = BOOK_NAMES[bookIndex];
  const chapters = book.chapters;

  // Get existing verses
  const existing = await getExistingVerses(bookName);
  console.log(`Found ${existing.size} existing verses in DB\n`);

  // Flatten verses
  const allVerses = [];
  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const chapter = chapters[chapterIndex];
    for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
      const key = `${chapterIndex + 1}:${verseIndex + 1}`;
      if (!existing.has(key)) {
        allVerses.push({
          book: bookName,
          chapter: chapterIndex + 1,
          verse: verseIndex + 1,
          text: chapter[verseIndex],
        });
      }
    }
  }

  console.log(`${allVerses.length} verses to insert\n`);

  if (allVerses.length === 0) {
    console.log('Book is already complete!');
    return;
  }

  // Process one verse at a time
  let success = 0;
  let errors = 0;

  for (let i = 0; i < allVerses.length; i++) {
    const v = allVerses[i];
    const ref = `${v.book} ${v.chapter}:${v.verse}`;

    try {
      // Generate embedding
      const embedding = await generateEmbedding(v.text);

      // Insert verse
      await insertVerse({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        translation: 'kjv',
        embedding,
      });

      success++;
      process.stdout.write(`\r  ${success}/${allVerses.length} inserted (${ref})          `);

      // Small delay to avoid rate limits
      await sleep(50);

    } catch (error) {
      errors++;
      console.error(`\n  ERROR at ${ref}: ${error.message}`);
    }
  }

  console.log(`\n\n=== Complete ===`);
  console.log(`Inserted: ${success}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
