/**
 * Full KJV Bible Seeding Script
 *
 * Downloads KJV Bible from a reliable source and generates embeddings.
 *
 * Usage:
 *   node supabase/scripts/seed-full-bible.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate embeddings in batches
async function generateEmbeddings(texts, batchSize = 50) {
  const embeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: batch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    embeddings.push(...data.data.map(d => d.embedding));

    // Rate limiting
    if (i + batchSize < texts.length) {
      await sleep(100);
    }
  }

  return embeddings;
}

// Insert verses into Supabase with proper upsert
async function insertVerses(verses) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/bible_verses?on_conflict=book,chapter,verse,translation`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(verses),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase insert error: ${error}`);
  }

  return true;
}

// Check how many verses exist for a book
async function getBookVerseCount(bookName) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?book=eq.${encodeURIComponent(bookName)}&translation=eq.kjv&select=id`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact',
      },
    }
  );

  const count = response.headers.get('content-range');
  if (count) {
    const match = count.match(/\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return 0;
}

async function main() {
  console.log('=== KJV Bible Seeding Script ===\n');

  // Book names mapping (abbrev -> full name)
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

  // Fetch KJV Bible JSON from jsDelivr CDN
  console.log('Fetching KJV Bible data...');
  const bibleResponse = await fetch('https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_kjv.json');

  if (!bibleResponse.ok) {
    throw new Error('Failed to fetch Bible data');
  }

  const bibleData = await bibleResponse.json();
  console.log(`Loaded ${bibleData.length} books\n`);

  let totalVerses = 0;
  let totalErrors = 0;

  for (let bookIndex = 0; bookIndex < bibleData.length; bookIndex++) {
    const book = bibleData[bookIndex];
    const bookName = BOOK_NAMES[bookIndex] || book.abbrev;
    const chapters = book.chapters;

    console.log(`\n[${bookIndex + 1}/${bibleData.length}] Processing ${bookName}...`);

    try {
      // Check if book already exists
      const existingCount = await getBookVerseCount(bookName);

      // Flatten all verses in this book
      const allVerses = [];
      for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
        const chapter = chapters[chapterIndex];
        for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
          allVerses.push({
            book: bookName,
            chapter: chapterIndex + 1,
            verse: verseIndex + 1,
            text: chapter[verseIndex],
          });
        }
      }

      console.log(`  Found ${allVerses.length} verses (${existingCount} already in DB)`);

      // Skip if book is complete
      if (existingCount >= allVerses.length) {
        console.log(`  Skipping - already complete`);
        totalVerses += existingCount;
        continue;
      }

      // Process in smaller chunks to avoid timeouts on free tier
      const chunkSize = 100;
      for (let i = 0; i < allVerses.length; i += chunkSize) {
        const chunk = allVerses.slice(i, i + chunkSize);
        const verseTexts = chunk.map(v => v.text);

        // Generate embeddings
        const embeddings = await generateEmbeddings(verseTexts);

        // Prepare data for insertion
        const versesToInsert = chunk.map((v, idx) => ({
          book: v.book,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          translation: 'kjv',
          embedding: embeddings[idx],
        }));

        // Insert into database
        await insertVerses(versesToInsert);

        process.stdout.write(`  Processed ${Math.min(i + chunkSize, allVerses.length)}/${allVerses.length} verses\r`);
      }

      console.log(`  Completed ${allVerses.length} verses          `);
      totalVerses += allVerses.length;

    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
      totalErrors++;
    }
  }

  console.log('\n=== Seeding Complete ===');
  console.log(`Total verses inserted: ${totalVerses}`);
  console.log(`Books with errors: ${totalErrors}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
