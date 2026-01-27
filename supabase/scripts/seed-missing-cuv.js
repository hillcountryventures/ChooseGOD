/**
 * CUV Missing Verses Seeding Script
 *
 * Finds and inserts only the missing CUV verses to avoid timeout issues.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
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

async function generateEmbeddings(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data.map(d => d.embedding);
}

// Simple insert (not upsert) to avoid conflict check overhead
async function insertVersesSimple(verses, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bible_verses`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(verses),
      });

      if (!response.ok) {
        const error = await response.text();
        if (error.includes('duplicate key') || error.includes('23505')) {
          // Already exists, skip
          return true;
        }
        if (error.includes('57014') && attempt < retries) {
          console.log(`  Timeout on attempt ${attempt}, retrying...`);
          await sleep(3000 * attempt);
          continue;
        }
        throw new Error(`Insert error: ${error}`);
      }
      return true;
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(3000 * attempt);
    }
  }
}

// Get all existing CUV verse keys
async function getExistingCUVKeys() {
  const keys = new Set();
  let offset = 0;
  const limit = 1000;

  while (true) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bible_verses?translation=eq.cuv&select=book,chapter,verse&offset=${offset}&limit=${limit}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch existing verses');
    }

    const data = await response.json();
    if (data.length === 0) break;

    for (const v of data) {
      keys.add(`${v.book}|${v.chapter}|${v.verse}`);
    }

    offset += limit;
    if (data.length < limit) break;
  }

  return keys;
}

async function main() {
  console.log('=== CUV Missing Verses Seeding Script ===\n');

  // Fetch CUV Bible data
  console.log('Fetching CUV Bible data...');
  const response = await fetch('https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/zh_cuv.json');
  if (!response.ok) throw new Error('Failed to fetch Bible data');

  const bibleData = await response.json();

  // Parse all verses
  const allVerses = [];
  for (let bookIndex = 0; bookIndex < bibleData.length; bookIndex++) {
    const book = bibleData[bookIndex];
    const bookName = BOOK_NAMES[bookIndex];
    const chapters = book.chapters;

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
  }

  console.log(`Total verses in source: ${allVerses.length}`);

  // Get existing verses
  console.log('Fetching existing CUV verses from database...');
  const existingKeys = await getExistingCUVKeys();
  console.log(`Existing verses in DB: ${existingKeys.size}`);

  // Find missing verses
  const missingVerses = allVerses.filter(v =>
    !existingKeys.has(`${v.book}|${v.chapter}|${v.verse}`)
  );

  console.log(`Missing verses to insert: ${missingVerses.length}\n`);

  if (missingVerses.length === 0) {
    console.log('All CUV verses already present!');
    return;
  }

  // Insert missing verses in small batches
  const chunkSize = 10; // Very small chunks to avoid timeouts
  let inserted = 0;

  for (let i = 0; i < missingVerses.length; i += chunkSize) {
    const chunk = missingVerses.slice(i, i + chunkSize);
    const verseTexts = chunk.map(v => v.text);

    try {
      // Generate embeddings
      const embeddings = await generateEmbeddings(verseTexts);

      // Prepare verses for insertion
      const versesToInsert = chunk.map((v, idx) => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        translation: 'cuv',
        embedding: embeddings[idx],
      }));

      // Insert one at a time if batches fail
      for (let j = 0; j < versesToInsert.length; j++) {
        try {
          await insertVersesSimple([versesToInsert[j]]);
          inserted++;
        } catch (e) {
          if (e.message.includes('duplicate')) {
            inserted++;
          } else {
            console.error(`  Error inserting ${versesToInsert[j].book} ${versesToInsert[j].chapter}:${versesToInsert[j].verse}: ${e.message}`);
          }
        }
      }

      process.stdout.write(`  Inserted: ${inserted}/${missingVerses.length}\r`);
      await sleep(200);
    } catch (error) {
      console.error(`\n  Chunk error: ${error.message}`);
    }
  }

  console.log(`\n\nCompleted: ${inserted} verses inserted`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
