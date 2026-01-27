/**
 * NIV Bible Seeding Script - WITHOUT EMBEDDINGS
 *
 * First pass: Insert all verses without embeddings (very fast)
 * Second pass: Add embeddings separately using update queries
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node seed-niv-no-embeddings.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// NIV Bible data - using local files from Desktop
const NIV_LOCAL_PATH = `${process.env.HOME}/Desktop/Bible-niv-main`;
const fs = require('fs');
const path = require('path');

// Configuration
const BATCH_SIZE = 100; // Insert 100 verses at a time

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

async function insertVerses(verses) {
  // Use upsert to handle duplicates
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?on_conflict=book,chapter,verse,translation`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(verses)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase insert error: ${response.status} - ${error}`);
  }
}

function parseBookData(bookData) {
  const verses = [];
  const bookName = bookData.book;

  bookData.chapters.forEach((chapterData) => {
    const chapterNum = chapterData.chapter;
    chapterData.verses.forEach((verseData) => {
      verses.push({
        book: bookName,
        chapter: chapterNum,
        verse: verseData.verse,
        text: verseData.text.trim(),
        translation: 'niv'
        // NO EMBEDDING - will be added later
      });
    });
  });

  return verses;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedNIVBible() {
  console.log('=== NIV Bible Seeding Script (No Embeddings) ===\n');

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
    }
  }

  console.log(`\nTotal verses to insert: ${allVerses.length}`);
  console.log(`Batch size: ${BATCH_SIZE} verses per insert\n`);

  // Insert in batches (fast without embeddings)
  let insertedCount = 0;

  for (let i = 0; i < allVerses.length; i += BATCH_SIZE) {
    const batch = allVerses.slice(i, i + BATCH_SIZE);

    try {
      await insertVerses(batch);
      insertedCount += batch.length;
      const progress = ((insertedCount / allVerses.length) * 100).toFixed(1);
      console.log(`Progress: ${insertedCount}/${allVerses.length} verses (${progress}%)`);

      await sleep(100); // Small delay between batches
    } catch (error) {
      console.error(`\nError at batch ${i}: ${error.message}`);
      console.log(`Inserted ${insertedCount} verses before error`);
      throw error;
    }
  }

  console.log(`\n✓ Seeding complete! Total verses inserted: ${insertedCount}`);

  // Verify
  const finalCount = await getExistingVerseCount();
  console.log(`Verified NIV verses in database: ${finalCount}`);
  console.log('\nNote: Embeddings will need to be added in a separate step.');
}

// Run the script
seedNIVBible().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
