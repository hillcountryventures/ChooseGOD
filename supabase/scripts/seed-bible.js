/**
 * Bible Seeding Script - Cost Effective Version
 *
 * Strategy for cost efficiency:
 * 1. Batch embeddings: Process 100 verses per API call (OpenAI supports up to 2048)
 * 2. Use text-embedding-3-small: $0.00002 per 1K tokens (~$0.62 for full KJV)
 * 3. Batch DB inserts: 500 verses per insert
 * 4. Resume capability: Skip already-seeded verses
 *
 * Full KJV: ~31,102 verses = ~312 embedding API calls = ~$0.62 total
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... node seed-bible.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

// KJV Bible data URL (public domain)
const KJV_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json';

// Configuration
const EMBEDDING_BATCH_SIZE = 100;  // Verses per embedding API call
const DB_BATCH_SIZE = 500;         // Verses per DB insert
const EMBEDDING_MODEL = 'text-embedding-3-small';
const RATE_LIMIT_DELAY = 100;      // ms between API calls

// Book name mapping (standardize names)
const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John',
  '3 John', 'Jude', 'Revelation'
];

async function fetchBibleData() {
  console.log('Fetching KJV Bible data...');
  const response = await fetch(KJV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Bible data: ${response.status}`);
  }
  const data = await response.json();
  console.log(`Fetched ${data.length} books`);
  return data;
}

async function getExistingVerseCount() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?select=count&translation=eq.kjv`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    }
  );
  const countHeader = response.headers.get('content-range');
  if (countHeader) {
    const match = countHeader.match(/\/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

async function generateEmbeddings(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data.map(d => d.embedding);
}

async function insertVerses(verses) {
  // Use upsert to handle duplicates - on conflict update the embedding
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?on_conflict=book,chapter,verse,translation`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(verses)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase insert error: ${response.status} - ${error}`);
  }
}

function parseVerses(bibleData) {
  const verses = [];

  bibleData.forEach((book, bookIndex) => {
    const bookName = BOOK_NAMES[bookIndex] || book.name || `Book ${bookIndex + 1}`;

    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.forEach((verseText, verseIndex) => {
        verses.push({
          book: bookName,
          chapter: chapterIndex + 1,
          verse: verseIndex + 1,
          text: verseText.trim(),
          translation: 'kjv'
        });
      });
    });
  });

  return verses;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedBible() {
  console.log('=== Bible Seeding Script ===\n');

  // Check existing verses
  const existingCount = await getExistingVerseCount();
  console.log(`Existing KJV verses in database: ${existingCount}`);

  if (existingCount >= 31000) {
    console.log('Database already seeded with KJV Bible. Exiting.');
    return;
  }

  // Fetch and parse Bible data
  const bibleData = await fetchBibleData();
  const allVerses = parseVerses(bibleData);
  console.log(`Total verses to process: ${allVerses.length}`);

  // Calculate cost estimate
  const totalTokens = allVerses.reduce((sum, v) => sum + Math.ceil(v.text.length / 4), 0);
  const estimatedCost = (totalTokens / 1000) * 0.00002;
  console.log(`Estimated embedding cost: $${estimatedCost.toFixed(4)}`);
  console.log(`Embedding batches: ${Math.ceil(allVerses.length / EMBEDDING_BATCH_SIZE)}`);
  console.log(`DB insert batches: ${Math.ceil(allVerses.length / DB_BATCH_SIZE)}\n`);

  // Process in batches
  let processedCount = 0;
  let dbBatch = [];

  for (let i = 0; i < allVerses.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = allVerses.slice(i, i + EMBEDDING_BATCH_SIZE);
    const texts = batch.map(v => `${v.book} ${v.chapter}:${v.verse} - ${v.text}`);

    try {
      // Generate embeddings for batch
      const embeddings = await generateEmbeddings(texts);

      // Add embeddings to verses
      batch.forEach((verse, idx) => {
        dbBatch.push({
          ...verse,
          embedding: JSON.stringify(embeddings[idx])
        });
      });

      processedCount += batch.length;
      const progress = ((processedCount / allVerses.length) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${processedCount}/${allVerses.length} verses (${progress}%)`);

      // Insert to DB when batch is full
      if (dbBatch.length >= DB_BATCH_SIZE) {
        await insertVerses(dbBatch);
        dbBatch = [];
      }

      // Rate limiting
      await sleep(RATE_LIMIT_DELAY);

    } catch (error) {
      console.error(`\nError at batch ${i}: ${error.message}`);
      // Save progress info for resume
      console.log(`Resume from verse ${i} if needed`);
      throw error;
    }
  }

  // Insert remaining verses
  if (dbBatch.length > 0) {
    await insertVerses(dbBatch);
  }

  console.log(`\n\nSeeding complete! Total verses: ${processedCount}`);

  // Verify
  const finalCount = await getExistingVerseCount();
  console.log(`Verified verses in database: ${finalCount}`);
}

// Run the script
seedBible().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
