#!/usr/bin/env node
/**
 * Cross-References Ingestion Script for ChooseGOD
 *
 * Ingests Bible cross-references from OpenBible.info's Treasury of Scripture Knowledge
 * data file into the Supabase cross_references table.
 *
 * Usage:
 *   node ingest-cross-refs.js /path/to/cross-references.txt [translation]
 *
 * Example:
 *   node ingest-cross-refs.js ~/Desktop/cross_references.txt kjv
 *
 * Dependencies:
 *   npm install @supabase/supabase-js papaparse dotenv
 *
 * Environment Variables (in .env file):
 *   SUPABASE_URL=your-supabase-url
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');

// =====================================================
// Configuration
// =====================================================

const BATCH_SIZE = 5000; // Number of records per batch insert
const VERSE_CACHE_SIZE = 50000; // Max verses to cache in memory
const LOG_INTERVAL = 10000; // Log progress every N rows

// Book name mappings (OpenBible format uses abbreviated names like Gen.1.1)
// Maps abbreviations AND full names to the database format
const BOOK_NAME_MAP = {
  // ===== ABBREVIATED NAMES (OpenBible format) =====
  'Gen': 'Genesis',
  'Ex': 'Exodus',
  'Exod': 'Exodus',
  'Lev': 'Leviticus',
  'Num': 'Numbers',
  'Deut': 'Deuteronomy',
  'Josh': 'Joshua',
  'Judg': 'Judges',
  'Jdg': 'Judges',
  '1Sam': '1 Samuel',
  '2Sam': '2 Samuel',
  '1Kgs': '1 Kings',
  '2Kgs': '2 Kings',
  '1Chron': '1 Chronicles',
  '1Chr': '1 Chronicles',
  '2Chron': '2 Chronicles',
  '2Chr': '2 Chronicles',
  'Neh': 'Nehemiah',
  'Esth': 'Esther',
  'Est': 'Esther',
  'Ps': 'Psalms',
  'Psa': 'Psalms',
  'Prov': 'Proverbs',
  'Pro': 'Proverbs',
  'Eccl': 'Ecclesiastes',
  'Ecc': 'Ecclesiastes',
  'Song': 'Song of Solomon',
  'Sos': 'Song of Solomon',
  'Isa': 'Isaiah',
  'Jer': 'Jeremiah',
  'Lam': 'Lamentations',
  'Ezek': 'Ezekiel',
  'Eze': 'Ezekiel',
  'Dan': 'Daniel',
  'Hos': 'Hosea',
  'Obad': 'Obadiah',
  'Oba': 'Obadiah',
  'Mic': 'Micah',
  'Nah': 'Nahum',
  'Hab': 'Habakkuk',
  'Zeph': 'Zephaniah',
  'Zep': 'Zephaniah',
  'Hag': 'Haggai',
  'Zech': 'Zechariah',
  'Zec': 'Zechariah',
  'Mal': 'Malachi',
  'Matt': 'Matthew',
  'Mat': 'Matthew',
  'Mk': 'Mark',
  'Mrk': 'Mark',
  'Lk': 'Luke',
  'Luk': 'Luke',
  'Jn': 'John',
  'Jhn': 'John',
  'Rom': 'Romans',
  '1Cor': '1 Corinthians',
  '2Cor': '2 Corinthians',
  'Gal': 'Galatians',
  'Eph': 'Ephesians',
  'Phil': 'Philippians',
  'Php': 'Philippians',
  'Col': 'Colossians',
  '1Thess': '1 Thessalonians',
  '1Thes': '1 Thessalonians',
  '2Thess': '2 Thessalonians',
  '2Thes': '2 Thessalonians',
  '1Tim': '1 Timothy',
  '2Tim': '2 Timothy',
  'Tit': 'Titus',
  'Phlm': 'Philemon',
  'Phm': 'Philemon',
  'Heb': 'Hebrews',
  'Jas': 'James',
  'Jam': 'James',
  '1Pet': '1 Peter',
  '1Pe': '1 Peter',
  '2Pet': '2 Peter',
  '2Pe': '2 Peter',
  '1Jn': '1 John',
  '1John': '1 John',
  '2Jn': '2 John',
  '2John': '2 John',
  '3Jn': '3 John',
  '3John': '3 John',
  'Rev': 'Revelation',

  // ===== FULL NAMES (pass-through) =====
  'Genesis': 'Genesis',
  'Exodus': 'Exodus',
  'Leviticus': 'Leviticus',
  'Numbers': 'Numbers',
  'Deuteronomy': 'Deuteronomy',
  'Joshua': 'Joshua',
  'Judges': 'Judges',
  'Ruth': 'Ruth',
  '1Samuel': '1 Samuel',
  '1 Samuel': '1 Samuel',
  '2Samuel': '2 Samuel',
  '2 Samuel': '2 Samuel',
  '1Kings': '1 Kings',
  '1 Kings': '1 Kings',
  '2Kings': '2 Kings',
  '2 Kings': '2 Kings',
  '1Chronicles': '1 Chronicles',
  '1 Chronicles': '1 Chronicles',
  '2Chronicles': '2 Chronicles',
  '2 Chronicles': '2 Chronicles',
  'Ezra': 'Ezra',
  'Nehemiah': 'Nehemiah',
  'Esther': 'Esther',
  'Job': 'Job',
  'Psalms': 'Psalms',
  'Psalm': 'Psalms',
  'Proverbs': 'Proverbs',
  'Ecclesiastes': 'Ecclesiastes',
  'SongofSolomon': 'Song of Solomon',
  'Song of Solomon': 'Song of Solomon',
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
  '1Corinthians': '1 Corinthians',
  '1 Corinthians': '1 Corinthians',
  '2Corinthians': '2 Corinthians',
  '2 Corinthians': '2 Corinthians',
  'Galatians': 'Galatians',
  'Ephesians': 'Ephesians',
  'Philippians': 'Philippians',
  'Colossians': 'Colossians',
  '1Thessalonians': '1 Thessalonians',
  '1 Thessalonians': '1 Thessalonians',
  '2Thessalonians': '2 Thessalonians',
  '2 Thessalonians': '2 Thessalonians',
  '1Timothy': '1 Timothy',
  '1 Timothy': '1 Timothy',
  '2Timothy': '2 Timothy',
  '2 Timothy': '2 Timothy',
  'Titus': 'Titus',
  'Philemon': 'Philemon',
  'Hebrews': 'Hebrews',
  'James': 'James',
  '1Peter': '1 Peter',
  '1 Peter': '1 Peter',
  '2Peter': '2 Peter',
  '2 Peter': '2 Peter',
  '1 John': '1 John',
  '2 John': '2 John',
  '3 John': '3 John',
  'Jude': 'Jude',
  'Revelation': 'Revelation',
};

// =====================================================
// Initialize Supabase Client
// =====================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  console.error('Please ensure your .env file contains these values.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// Verse ID Cache
// =====================================================

// Cache verse IDs to avoid repeated database lookups
// Key format: "translation:book:chapter:verse" -> verse_id
const verseIdCache = new Map();

/**
 * Get verse ID from cache or database
 */
async function getVerseId(translation, book, chapter, verse) {
  const cacheKey = `${translation}:${book}:${chapter}:${verse}`;

  // Check cache first
  if (verseIdCache.has(cacheKey)) {
    return verseIdCache.get(cacheKey);
  }

  // Query database
  const { data, error } = await supabase
    .from('bible_verses')
    .select('id')
    .eq('translation', translation)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .maybeSingle();

  if (error) {
    console.error(`Database error looking up ${book} ${chapter}:${verse}:`, error.message);
    return null;
  }

  const verseId = data?.id || null;

  // Cache the result (even nulls to avoid repeated lookups)
  if (verseIdCache.size < VERSE_CACHE_SIZE) {
    verseIdCache.set(cacheKey, verseId);
  }

  return verseId;
}

/**
 * Pre-load all verse IDs for a translation into cache
 * This dramatically speeds up the process for large files
 */
async function preloadVerseCache(translation) {
  console.log(`\nPre-loading verse cache for translation: ${translation}...`);

  let offset = 0;
  const pageSize = 1000; // Supabase default limit is 1000
  let totalLoaded = 0;

  while (true) {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('id, book, chapter, verse')
      .eq('translation', translation)
      .order('id', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error preloading verse cache:', error.message);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    // Add to cache
    for (const row of data) {
      const cacheKey = `${translation}:${row.book}:${row.chapter}:${row.verse}`;
      verseIdCache.set(cacheKey, row.id);
    }

    totalLoaded += data.length;
    offset += pageSize;

    process.stdout.write(`\r  Loaded ${totalLoaded} verses into cache...`);

    // If we got fewer than pageSize, we've reached the end
    if (data.length < pageSize) {
      break;
    }
  }

  console.log(`\n  ✓ Verse cache loaded with ${verseIdCache.size} entries.\n`);
}

// =====================================================
// Reference Parsing
// =====================================================

/**
 * Parse a reference string like "Genesis.1.1" or "1Corinthians.13.4"
 * Returns { book, chapter, verse } or null if invalid
 */
function parseReference(refString) {
  if (!refString || typeof refString !== 'string') {
    return null;
  }

  // Trim whitespace
  refString = refString.trim();

  // Handle format: Book.Chapter.Verse (e.g., "Genesis.1.1", "1Corinthians.13.4")
  // The book name may contain numbers (1John, 2Kings, etc.)

  // Split by periods
  const parts = refString.split('.');

  if (parts.length < 3) {
    return null;
  }

  // Last part is verse, second to last is chapter
  const verse = parseInt(parts[parts.length - 1], 10);
  const chapter = parseInt(parts[parts.length - 2], 10);

  // Everything else is the book name
  const bookRaw = parts.slice(0, parts.length - 2).join('.');

  if (isNaN(verse) || isNaN(chapter) || !bookRaw) {
    return null;
  }

  // Normalize book name
  const book = BOOK_NAME_MAP[bookRaw] || bookRaw;

  return { book, chapter, verse };
}

// =====================================================
// Batch Processing
// =====================================================

/**
 * Insert a batch of cross-references into the database
 */
async function insertBatch(batch) {
  if (batch.length === 0) return { inserted: 0, errors: 0 };

  const { data, error } = await supabase
    .from('cross_references')
    .upsert(batch, {
      onConflict: 'from_verse_id,to_verse_id',
      ignoreDuplicates: false, // Update votes if exists
    });

  if (error) {
    console.error(`\nBatch insert error: ${error.message}`);
    return { inserted: 0, errors: batch.length };
  }

  return { inserted: batch.length, errors: 0 };
}

// =====================================================
// Main Ingestion Function
// =====================================================

async function ingestCrossReferences(filePath, translation) {
  console.log('='.repeat(60));
  console.log('Cross-References Ingestion Script');
  console.log('='.repeat(60));
  console.log(`\nFile: ${filePath}`);
  console.log(`Translation: ${translation.toUpperCase()}`);
  console.log(`Batch Size: ${BATCH_SIZE}`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`\nERROR: File not found: ${filePath}`);
    process.exit(1);
  }

  // Pre-load verse cache for efficiency
  await preloadVerseCache(translation);

  // Read the file
  console.log('Reading and parsing file...');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Auto-detect delimiter (comma or tab)
  const firstLine = fileContent.split('\n')[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  console.log(`Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`);

  // Parse CSV/TSV with options to handle comment column
  const parseResult = Papa.parse(fileContent, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true, // Auto-parse numbers
    comments: '#', // Skip comment lines
    transformHeader: (header) => {
      // Strip comment marker from last column header (e.g., "Votes\t#www.openbible.info...")
      const cleaned = header.split('#')[0].trim();
      return cleaned || header.trim();
    },
  });

  // Only show actual errors, not field count mismatches (expected with comment column)
  const realErrors = parseResult.errors.filter(e =>
    !e.message?.includes('Too few fields') && !e.message?.includes('Too many fields')
  );
  if (realErrors.length > 0) {
    console.warn(`\nParsing warnings: ${realErrors.length} issues found`);
    realErrors.slice(0, 5).forEach(e => console.warn(`  - Row ${e.row}: ${e.message}`));
  }

  const rows = parseResult.data;
  console.log(`\nTotal rows to process: ${rows.length.toLocaleString()}`);

  // Detect column names (handle variations)
  const sampleRow = rows[0] || {};
  const columns = Object.keys(sampleRow);
  console.log(`Detected columns: ${columns.join(', ')}`);

  // Find the correct column names (case-insensitive)
  const findColumn = (options) => {
    for (const col of columns) {
      if (options.some(opt => col.toLowerCase().includes(opt.toLowerCase()))) {
        return col;
      }
    }
    return null;
  };

  const fromCol = findColumn(['From Verse', 'Reference', 'FromVerse', 'from']);
  const toCol = findColumn(['To Verse', 'Cross Reference', 'ToVerse', 'to', 'xref']);
  const votesCol = findColumn(['Votes', 'Vote', 'Score', 'Weight']);

  if (!fromCol || !toCol) {
    console.error('\nERROR: Could not detect reference columns in the file.');
    console.error('Expected columns like "From Verse" and "To Verse" or "Reference" and "Cross Reference"');
    process.exit(1);
  }

  console.log(`\nUsing columns:`);
  console.log(`  From: "${fromCol}"`);
  console.log(`  To: "${toCol}"`);
  console.log(`  Votes: "${votesCol || '(not found, defaulting to 1)'}"`);

  // Process rows
  console.log('\n' + '-'.repeat(60));
  console.log('Processing cross-references...');
  console.log('-'.repeat(60));

  let batch = [];
  let stats = {
    processed: 0,
    matched: 0,
    inserted: 0,
    skipped: 0,
    fromNotFound: 0,
    toNotFound: 0,
    parseErrors: 0,
    dbErrors: 0,
  };

  const startTime = Date.now();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    stats.processed++;

    // Parse from reference
    const fromRef = parseReference(row[fromCol]);
    if (!fromRef) {
      stats.parseErrors++;
      continue;
    }

    // Parse to reference
    const toRef = parseReference(row[toCol]);
    if (!toRef) {
      stats.parseErrors++;
      continue;
    }

    // Get votes (default to 1 if not present)
    const votes = votesCol ? (parseInt(row[votesCol], 10) || 1) : 1;

    // Look up verse IDs
    const fromVerseId = await getVerseId(translation, fromRef.book, fromRef.chapter, fromRef.verse);
    if (!fromVerseId) {
      stats.fromNotFound++;
      continue;
    }

    const toVerseId = await getVerseId(translation, toRef.book, toRef.chapter, toRef.verse);
    if (!toVerseId) {
      stats.toNotFound++;
      continue;
    }

    // Skip self-references
    if (fromVerseId === toVerseId) {
      stats.skipped++;
      continue;
    }

    // Add to batch
    batch.push({
      from_verse_id: fromVerseId,
      to_verse_id: toVerseId,
      votes,
      source: 'TSK',
    });
    stats.matched++;

    // Insert batch when full
    if (batch.length >= BATCH_SIZE) {
      const result = await insertBatch(batch);
      stats.inserted += result.inserted;
      stats.dbErrors += result.errors;
      batch = [];
    }

    // Log progress
    if (stats.processed % LOG_INTERVAL === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (stats.processed / elapsed).toFixed(0);
      const percent = ((stats.processed / rows.length) * 100).toFixed(1);
      process.stdout.write(
        `\r  Progress: ${stats.processed.toLocaleString()} / ${rows.length.toLocaleString()} (${percent}%) | ` +
        `Matched: ${stats.matched.toLocaleString()} | Rate: ${rate}/sec`
      );
    }
  }

  // Insert remaining batch
  if (batch.length > 0) {
    const result = await insertBatch(batch);
    stats.inserted += result.inserted;
    stats.dbErrors += result.errors;
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // Print summary
  console.log('\n\n' + '='.repeat(60));
  console.log('INGESTION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nTime elapsed: ${totalTime} seconds`);
  console.log(`\nStatistics:`);
  console.log(`  Total rows processed:    ${stats.processed.toLocaleString()}`);
  console.log(`  Cross-refs matched:      ${stats.matched.toLocaleString()}`);
  console.log(`  Records inserted:        ${stats.inserted.toLocaleString()}`);
  console.log(`  Self-refs skipped:       ${stats.skipped.toLocaleString()}`);
  console.log(`  Parse errors:            ${stats.parseErrors.toLocaleString()}`);
  console.log(`  From verse not found:    ${stats.fromNotFound.toLocaleString()}`);
  console.log(`  To verse not found:      ${stats.toNotFound.toLocaleString()}`);
  console.log(`  Database errors:         ${stats.dbErrors.toLocaleString()}`);

  const successRate = ((stats.matched / stats.processed) * 100).toFixed(1);
  console.log(`\n  Match rate: ${successRate}%`);

  if (stats.fromNotFound > 0 || stats.toNotFound > 0) {
    console.log(`\n  Note: Some verses may not exist in the "${translation}" translation.`);
    console.log(`  This is normal for translations with verse numbering differences.`);
  }

  console.log('\n' + '='.repeat(60));
}

// =====================================================
// CLI Entry Point
// =====================================================

function printUsage() {
  console.log(`
Usage: node ingest-cross-refs.js <file-path> [translation]

Arguments:
  file-path    Path to the cross-references file (CSV or TSV)
  translation  Bible translation to match verses against (default: kjv)

Examples:
  node ingest-cross-refs.js ~/Desktop/cross_references.txt kjv
  node ingest-cross-refs.js ./data/cross-refs.csv niv

Environment Variables Required:
  SUPABASE_URL              Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY Your Supabase service role key (not anon key)

The cross-references file should have columns like:
  - "From Verse" or "Reference" (format: Book.Chapter.Verse, e.g., Genesis.1.1)
  - "To Verse" or "Cross Reference" (same format)
  - "Votes" (optional, integer relevance score)
`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

const filePath = args[0];
const translation = (args[1] || 'kjv').toLowerCase();

// Resolve relative paths
const resolvedPath = path.resolve(filePath);

// Run ingestion
ingestCrossReferences(resolvedPath, translation)
  .then(() => {
    console.log('\nDone!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFATAL ERROR:', error);
    process.exit(1);
  });
