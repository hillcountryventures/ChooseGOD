/**
 * Multi-Translation Bible Seeding Script
 *
 * Seeds multiple Bible translations from various free/public domain sources.
 * Supports translations from:
 * - thiagobodruk/bible (multiple languages)
 * - scrollmapper/bible_databases (extensive public domain collection)
 *
 * Usage:
 *   node supabase/scripts/seed-translations.js [translation_code]
 *
 * Examples:
 *   node supabase/scripts/seed-translations.js asv      # Seed ASV only
 *   node supabase/scripts/seed-translations.js all      # Seed all translations
 *   node supabase/scripts/seed-translations.js web      # Seed WEB only
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

// Standard book names (English) for consistent storage
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

// Available translations with their sources and metadata
const TRANSLATIONS = {
  // ===== PUBLIC DOMAIN ENGLISH TRANSLATIONS =====
  asv: {
    name: 'American Standard Version',
    language: 'English',
    code: 'asv',
    source: 'scrollmapper',
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/sources/en/ASV/ASV.json',
    description: 'Literal word-for-word translation (1901)',
    publicDomain: true,
  },
  bbe: {
    name: 'Bible in Basic English',
    language: 'English',
    code: 'bbe',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_bbe.json',
    description: 'Simple vocabulary translation',
    publicDomain: true,
  },
  web: {
    name: 'World English Bible',
    language: 'English',
    code: 'web',
    source: 'scrollmapper',
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/NHEB.json',
    description: 'Modern public domain translation',
    publicDomain: true,
  },
  darby: {
    name: 'Darby Translation',
    language: 'English',
    code: 'darby',
    source: 'scrollmapper',
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/Darby.json',
    description: 'Literal translation by John Nelson Darby',
    publicDomain: true,
  },
  ylt: {
    name: "Young's Literal Translation",
    language: 'English',
    code: 'ylt',
    source: 'scrollmapper',
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/YLT.json',
    description: 'Extremely literal translation',
    publicDomain: true,
  },

  // ===== SPANISH =====
  rvr: {
    name: 'Reina-Valera 1960',
    language: 'Spanish',
    code: 'rvr',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/es_rvr.json',
    description: 'Traducción clásica en español',
    publicDomain: false, // Check licensing
  },

  // ===== PORTUGUESE =====
  paa: {
    name: 'Almeida Atualizada',
    language: 'Portuguese',
    code: 'paa',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/pt_aa.json',
    description: 'Tradução portuguesa clássica',
    publicDomain: false,
  },
  pacf: {
    name: 'Almeida Corrigida Fiel',
    language: 'Portuguese',
    code: 'pacf',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/pt_acf.json',
    description: 'Tradução fiel portuguesa',
    publicDomain: false,
  },

  // ===== GERMAN =====
  luther: {
    name: 'Luther Bible 1912',
    language: 'German',
    code: 'luther',
    source: 'scrollmapper',
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/GerBoLut.json',
    description: 'Deutsche Übersetzung von Martin Luther',
    publicDomain: true,
  },
  schlachter: {
    name: 'Schlachter 1951',
    language: 'German',
    code: 'schlachter',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/de_schlachter.json',
    description: 'Deutsche Schlachter Übersetzung',
    publicDomain: true,
  },

  // ===== FRENCH =====
  french: {
    name: 'French APEE',
    language: 'French',
    code: 'french',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/fr_apee.json',
    description: 'Traduction française',
    publicDomain: false,
  },

  // ===== CHINESE =====
  cuv: {
    name: 'Chinese Union Version',
    language: 'Chinese',
    code: 'cuv',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/zh_cuv.json',
    description: '和合本圣经',
    publicDomain: true,
  },
  cncv: {
    name: 'Chinese New Contemporary',
    language: 'Chinese',
    code: 'cncv',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/zh_ncv.json',
    description: '新译本圣经',
    publicDomain: false,
  },

  // ===== KOREAN =====
  korean: {
    name: 'Korean Bible',
    language: 'Korean',
    code: 'korean',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/ko_ko.json',
    description: '한국어 성경',
    publicDomain: false,
  },

  // ===== RUSSIAN =====
  synodal: {
    name: 'Synodal Translation',
    language: 'Russian',
    code: 'synodal',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/ru_synodal.json',
    description: 'Синодальный перевод',
    publicDomain: true,
  },

  // ===== ARABIC =====
  arabic: {
    name: 'Smith & Van Dyke',
    language: 'Arabic',
    code: 'arabic',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/ar_svd.json',
    description: 'الترجمة العربية',
    publicDomain: true,
  },

  // ===== GREEK =====
  greek: {
    name: 'Greek Bible',
    language: 'Greek',
    code: 'greek',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/el_greek.json',
    description: 'Ελληνική Αγία Γραφή',
    publicDomain: true,
  },

  // ===== VIETNAMESE =====
  vietnamese: {
    name: 'Vietnamese Bible',
    language: 'Vietnamese',
    code: 'vietnamese',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/vi_vietnamese.json',
    description: 'Kinh Thánh Tiếng Việt',
    publicDomain: false,
  },

  // ===== ROMANIAN =====
  romanian: {
    name: 'Cornilescu',
    language: 'Romanian',
    code: 'romanian',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/ro_cornilescu.json',
    description: 'Biblia Cornilescu',
    publicDomain: true,
  },

  // ===== FINNISH =====
  finnish: {
    name: 'Finnish Bible',
    language: 'Finnish',
    code: 'finnish',
    source: 'thiagobodruk',
    url: 'https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/fi_finnish.json',
    description: 'Suomalainen Raamattu',
    publicDomain: true,
  },
};

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

// Insert verses into Supabase with proper upsert and retry logic
async function insertVerses(verses, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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
        if (error.includes('57014') && attempt < retries) {
          console.log(`\n  Timeout on attempt ${attempt}, retrying...`);
          await sleep(2000 * attempt);
          continue;
        }
        throw new Error(`Supabase insert error: ${error}`);
      }

      return true;
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(2000 * attempt);
    }
  }
}

// Check how many verses exist for a translation
async function getTranslationVerseCount(translationCode) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?translation=eq.${translationCode}&select=id`,
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

// Parse thiagobodruk format: array of books with chapters as nested arrays
function parseThiagobodrukFormat(bibleData) {
  const verses = [];

  for (let bookIndex = 0; bookIndex < bibleData.length; bookIndex++) {
    const book = bibleData[bookIndex];
    const bookName = BOOK_NAMES[bookIndex] || book.abbrev || `Book ${bookIndex + 1}`;
    const chapters = book.chapters;

    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const chapter = chapters[chapterIndex];
      for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
        verses.push({
          book: bookName,
          chapter: chapterIndex + 1,
          verse: verseIndex + 1,
          text: chapter[verseIndex],
        });
      }
    }
  }

  return verses;
}

// Parse scrollmapper format: object with books as keys containing verses array
function parseScrollmapperFormat(bibleData) {
  const verses = [];

  // scrollmapper format has verses as array with book_id, chapter, verse, text
  if (Array.isArray(bibleData)) {
    // It's a verses array
    for (const v of bibleData) {
      const bookIndex = (v.book_id || v.book) - 1;
      const bookName = BOOK_NAMES[bookIndex] || `Book ${bookIndex + 1}`;
      verses.push({
        book: bookName,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
      });
    }
  } else if (bibleData.verses) {
    // Has a verses property
    return parseScrollmapperFormat(bibleData.verses);
  } else if (bibleData.books) {
    // Has a books property
    for (const book of bibleData.books) {
      const bookIndex = book.book_id - 1;
      const bookName = BOOK_NAMES[bookIndex] || book.name || `Book ${bookIndex + 1}`;
      for (const v of book.verses || []) {
        verses.push({
          book: bookName,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
        });
      }
    }
  }

  return verses;
}

// Parse Bible data based on source format
function parseBibleData(bibleData, source) {
  if (source === 'thiagobodruk') {
    return parseThiagobodrukFormat(bibleData);
  } else if (source === 'scrollmapper') {
    return parseScrollmapperFormat(bibleData);
  }

  // Try to auto-detect
  if (Array.isArray(bibleData) && bibleData[0]?.chapters) {
    return parseThiagobodrukFormat(bibleData);
  }
  return parseScrollmapperFormat(bibleData);
}

async function seedTranslation(translationKey) {
  const translation = TRANSLATIONS[translationKey];
  if (!translation) {
    console.error(`Unknown translation: ${translationKey}`);
    console.log('Available translations:', Object.keys(TRANSLATIONS).join(', '));
    return false;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Seeding: ${translation.name} (${translation.code})`);
  console.log(`Language: ${translation.language}`);
  console.log(`Source: ${translation.source}`);
  console.log(`${'='.repeat(60)}\n`);

  // Check existing verse count
  const existingCount = await getTranslationVerseCount(translation.code);
  console.log(`Existing verses in DB: ${existingCount}`);

  // Fetch Bible data
  console.log(`Fetching from: ${translation.url}`);
  const response = await fetch(translation.url);

  if (!response.ok) {
    throw new Error(`Failed to fetch Bible data: ${response.status}`);
  }

  const bibleData = await response.json();
  console.log('Data fetched successfully');

  // Parse the data
  const verses = parseBibleData(bibleData, translation.source);
  console.log(`Parsed ${verses.length} verses`);

  // Skip if already complete
  if (existingCount >= verses.length) {
    console.log('Translation already complete, skipping...');
    return true;
  }

  // Process in chunks
  const chunkSize = 25; // Smaller chunks for stability
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < verses.length; i += chunkSize) {
    const chunk = verses.slice(i, i + chunkSize);
    const verseTexts = chunk.map(v => v.text);

    try {
      // Generate embeddings
      const embeddings = await generateEmbeddings(verseTexts);

      // Prepare data for insertion
      const versesToInsert = chunk.map((v, idx) => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        translation: translation.code,
        embedding: embeddings[idx],
      }));

      // Insert into database
      await insertVerses(versesToInsert);
      processed += chunk.length;

      process.stdout.write(`  Progress: ${processed}/${verses.length} verses (${Math.round(processed/verses.length*100)}%)\r`);
    } catch (error) {
      console.error(`\n  Error at verse ${i}: ${error.message}`);
      errors++;
      if (errors > 10) {
        throw new Error('Too many errors, aborting');
      }
    }
  }

  console.log(`\nCompleted: ${processed} verses inserted for ${translation.name}`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'list';

  if (target === 'list') {
    console.log('\n=== Available Bible Translations ===\n');
    for (const [key, t] of Object.entries(TRANSLATIONS)) {
      const pd = t.publicDomain ? '✓ Public Domain' : '⚠ Check License';
      console.log(`  ${key.padEnd(12)} - ${t.name} (${t.language}) - ${pd}`);
    }
    console.log('\nUsage: node seed-translations.js <code>');
    console.log('       node seed-translations.js all     (seed all translations)');
    console.log('\nExample: node seed-translations.js asv');
    return;
  }

  console.log('=== Multi-Translation Bible Seeding Script ===');
  console.log(`Supabase URL: ${SUPABASE_URL.substring(0, 30)}...`);

  if (target === 'all') {
    // Seed all translations
    const keys = Object.keys(TRANSLATIONS);
    console.log(`\nSeeding ${keys.length} translations...\n`);

    let success = 0;
    let failed = 0;

    for (const key of keys) {
      try {
        await seedTranslation(key);
        success++;
      } catch (error) {
        console.error(`Failed to seed ${key}: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`COMPLETE: ${success} succeeded, ${failed} failed`);
  } else {
    // Seed specific translation
    try {
      await seedTranslation(target);
    } catch (error) {
      console.error(`Failed: ${error.message}`);
      process.exit(1);
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
