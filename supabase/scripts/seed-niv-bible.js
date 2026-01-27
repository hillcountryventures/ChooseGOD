/**
 * NIV Bible Seeding Script
 *
 * Fetches NIV Bible data from https://github.com/aruljohn/Bible-niv
 * and seeds it into the bible_verses table with embeddings.
 *
 * Strategy:
 * 1. Fetch Books.json to get list of all books
 * 2. Fetch each book's JSON file (e.g., Genesis.json)
 * 3. Batch embeddings: Process 100 verses per API call
 * 4. Use text-embedding-3-small: $0.00002 per 1K tokens
 * 5. Batch DB inserts: 500 verses per insert
 * 6. Resume capability: Skip already-seeded NIV verses
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... node seed-niv-bible.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

// NIV Bible data - using local files from Desktop
const NIV_LOCAL_PATH = `${process.env.HOME}/Desktop/Bible-niv-main`;
const fs = require('fs');
const path = require('path');

// Configuration
const EMBEDDING_BATCH_SIZE = 100;  // Verses per embedding API call
const DB_BATCH_SIZE = 100;         // Verses per DB insert (reduced to avoid timeouts)
const EMBEDDING_MODEL = 'text-embedding-3-small';
const RATE_LIMIT_DELAY = 100;      // ms between API calls

function readBooksList() {
  console.log('Reading NIV books list from local files...');
  const booksPath = path.join(NIV_LOCAL_PATH, 'Books.json');
  const booksData = fs.readFileSync(booksPath, 'utf8');
  const books = JSON.parse(booksData);
  console.log(`Found ${books.length} books`);
  return books;
}

function readBookData(bookName) {
  const bookPath = path.join(NIV_LOCAL_PATH, `${bookName}.json`);
  console.log(`Reading ${bookName}...`);
  const bookData = fs.readFileSync(bookPath, 'utf8');
  return JSON.parse(bookData);
}

async function getExistingVerseCount() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?select=count&translation=eq.niv`,
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
  // Insert in very small chunks (10) to handle large embedding vectors
  const CHUNK_SIZE = 10;
  for (let i = 0; i < verses.length; i += CHUNK_SIZE) {
    const chunk = verses.slice(i, i + CHUNK_SIZE);

    try {
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
          body: JSON.stringify(chunk)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase insert error: ${response.status} - ${error}`);
      }
    } catch (error) {
      // If chunk fails, try inserting one at a time
      console.log(`\nChunk insert failed, trying individual inserts...`);
      for (const verse of chunk) {
        try {
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
              body: JSON.stringify([verse])
            }
          );

          if (!response.ok) {
            const error = await response.text();
            console.error(`Failed to insert ${verse.book} ${verse.chapter}:${verse.verse}: ${error}`);
          }
          await sleep(10);
        } catch (e) {
          console.error(`Error inserting ${verse.book} ${verse.chapter}:${verse.verse}:`, e.message);
        }
      }
    }

    // Small delay between chunks
    await sleep(20);
  }
}

function parseBookData(bookData) {
  const verses = [];
  const bookName = bookData.book;

  // The structure is: { book: "Genesis", chapters: [{ chapter: 1, verses: [{ verse: 1, text: "..." }] }] }
  bookData.chapters.forEach((chapterData) => {
    const chapterNum = chapterData.chapter;
    chapterData.verses.forEach((verseData) => {
      verses.push({
        book: bookName,
        chapter: chapterNum,
        verse: verseData.verse,
        text: verseData.text.trim(),
        translation: 'niv'
      });
    });
  });

  return verses;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedNIVBible() {
  console.log('=== NIV Bible Seeding Script ===\n');

  // Check existing verses
  const existingCount = await getExistingVerseCount();
  console.log(`Existing NIV verses in database: ${existingCount}`);

  if (existingCount >= 31000) {
    console.log('Database already seeded with NIV Bible. Exiting.');
    return;
  }

  // Read books list from local files
  const booksList = readBooksList();

  // Collect all verses from all books
  const allVerses = [];

  console.log('\nReading all book data from local files...');
  for (const bookName of booksList) {
    try {
      const bookData = readBookData(bookName);
      const verses = parseBookData(bookData);
      allVerses.push(...verses);
      console.log(`  ✓ ${bookName}: ${verses.length} verses`);
    } catch (error) {
      console.error(`  ✗ Error reading ${bookName}: ${error.message}`);
      // Continue with other books
    }
  }

  console.log(`\nTotal verses to process: ${allVerses.length}`);

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
seedNIVBible().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
