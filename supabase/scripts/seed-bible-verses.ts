/**
 * Bible Verse Seeding Script
 *
 * This script populates the bible_verses table with verses and generates embeddings.
 * Run this script after setting up your database.
 *
 * Prerequisites:
 * 1. Run the migrations (001_create_bible_tables.sql, 002_create_rpc_functions.sql)
 * 2. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 *
 * Usage:
 * npx ts-node supabase/scripts/seed-bible-verses.ts
 *
 * Or with Deno:
 * deno run --allow-net --allow-env supabase/scripts/seed-bible-verses.ts
 */

// For Node.js usage, install: npm install @supabase/supabase-js openai
// For Deno, these imports work directly

const SUPABASE_URL = process.env.SUPABASE_URL || Deno?.env?.get?.("SUPABASE_URL");
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || Deno?.env?.get?.("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || Deno?.env?.get?.("OPENAI_API_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error("Missing required environment variables:");
  console.error("  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY");
  process.exit(1);
}

// Sample verses for testing - replace with full Bible data
const SAMPLE_VERSES = [
  {
    book: "Genesis",
    chapter: 1,
    verse: 1,
    text: "In the beginning God created the heaven and the earth.",
    translation: "kjv",
  },
  {
    book: "John",
    chapter: 3,
    verse: 16,
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    translation: "kjv",
  },
  {
    book: "Psalms",
    chapter: 23,
    verse: 1,
    text: "The LORD is my shepherd; I shall not want.",
    translation: "kjv",
  },
  {
    book: "Psalms",
    chapter: 23,
    verse: 4,
    text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
    translation: "kjv",
  },
  {
    book: "Proverbs",
    chapter: 3,
    verse: 5,
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    translation: "kjv",
  },
  {
    book: "Proverbs",
    chapter: 3,
    verse: 6,
    text: "In all thy ways acknowledge him, and he shall direct thy paths.",
    translation: "kjv",
  },
  {
    book: "Isaiah",
    chapter: 41,
    verse: 10,
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
    translation: "kjv",
  },
  {
    book: "Jeremiah",
    chapter: 29,
    verse: 11,
    text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
    translation: "kjv",
  },
  {
    book: "Romans",
    chapter: 8,
    verse: 28,
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    translation: "kjv",
  },
  {
    book: "Philippians",
    chapter: 4,
    verse: 13,
    text: "I can do all things through Christ which strengtheneth me.",
    translation: "kjv",
  },
  {
    book: "Matthew",
    chapter: 11,
    verse: 28,
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    translation: "kjv",
  },
  {
    book: "Matthew",
    chapter: 6,
    verse: 33,
    text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    translation: "kjv",
  },
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function insertVerse(
  supabase: any,
  verse: (typeof SAMPLE_VERSES)[0],
  embedding: number[]
) {
  const { error } = await supabase.from("bible_verses").upsert(
    {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      translation: verse.translation,
      embedding,
    },
    {
      onConflict: "book,chapter,verse,translation",
    }
  );

  if (error) {
    console.error(`Error inserting ${verse.book} ${verse.chapter}:${verse.verse}:`, error);
    return false;
  }
  return true;
}

async function main() {
  // Dynamic import for cross-runtime compatibility
  let createClient: any;

  try {
    // Try Deno-style import first
    const mod = await import("https://esm.sh/@supabase/supabase-js@2");
    createClient = mod.createClient;
  } catch {
    // Fall back to Node.js import
    const mod = await import("@supabase/supabase-js");
    createClient = mod.createClient;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log("Starting Bible verse seeding...\n");
  console.log(`Processing ${SAMPLE_VERSES.length} sample verses...`);
  console.log("(Replace SAMPLE_VERSES with full Bible data for production)\n");

  let successful = 0;
  let failed = 0;

  for (const verse of SAMPLE_VERSES) {
    const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
    process.stdout?.write?.(`Processing ${reference}... `) || console.log(`Processing ${reference}...`);

    try {
      // Generate embedding
      const embedding = await generateEmbedding(verse.text);

      // Insert into database
      const success = await insertVerse(supabase, verse, embedding);

      if (success) {
        console.log("Done");
        successful++;
      } else {
        failed++;
      }

      // Rate limiting - OpenAI has limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`Failed: ${error}`);
      failed++;
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed: ${failed}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Get full KJV Bible data (JSON format)`);
  console.log(`  2. Update SAMPLE_VERSES with all verses`);
  console.log(`  3. Run this script again`);
  console.log(`  4. Test with: supabase functions serve query-bible`);
}

main().catch(console.error);
