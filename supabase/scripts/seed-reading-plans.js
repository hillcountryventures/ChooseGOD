/**
 * Seed script for Wayfarer Bible Reading Plans
 * Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/scripts/seed-reading-plans.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// BOOK CHAPTER COUNTS
// =====================================================

const BOOK_CHAPTERS = {
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Kings': 22,
  '2 Kings': 25,
  '1 Chronicles': 29,
  '2 Chronicles': 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  'Song of Solomon': 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  '1 Corinthians': 16,
  '2 Corinthians': 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  '1 Thessalonians': 5,
  '2 Thessalonians': 3,
  '1 Timothy': 6,
  '2 Timothy': 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  '1 Peter': 5,
  '2 Peter': 3,
  '1 John': 5,
  '2 John': 1,
  '3 John': 1,
  Jude: 1,
  Revelation: 22,
};

// =====================================================
// READING PLAN DATA
// =====================================================

const READING_PLAN = {
  slug: 'canonical-365',
  name: 'Canon Order Bible Reading',
  description:
    'Read through the entire Bible in one year, following the canonical order from Genesis to Revelation. Perfect for understanding the grand narrative of Scripture.',
  total_days: 365,
  plan_type: 'canonical',
  is_active: true,
};

// =====================================================
// GENERATE 365-DAY PLAN
// =====================================================

function formatDisplayTitle(refs) {
  return refs
    .map((ref) => {
      if (ref.startChapter === ref.endChapter) {
        return `${ref.book} ${ref.startChapter}`;
      }
      return `${ref.book} ${ref.startChapter}-${ref.endChapter}`;
    })
    .join(', ');
}

function generateSummaryPrompt(refs) {
  return `Provide a concise spiritual summary of ${formatDisplayTitle(refs)}. Highlight key themes, God's character revealed, and practical application for daily life.`;
}

function generateCanonicalPlan() {
  const readings = [];
  const books = Object.keys(BOOK_CHAPTERS);

  let currentBookIndex = 0;
  let currentChapter = 1;
  let dayNumber = 1;

  while (dayNumber <= 365 && currentBookIndex < books.length) {
    const refs = [];
    let chaptersToday = 0;
    const targetChapters = dayNumber <= 360 ? 3 : 4; // Slightly more chapters at end to finish

    while (chaptersToday < targetChapters && currentBookIndex < books.length) {
      const currentBook = books[currentBookIndex];
      const maxChapter = BOOK_CHAPTERS[currentBook];
      const startChapter = currentChapter;

      // Calculate how many chapters we can read from this book today
      const remainingInBook = maxChapter - currentChapter + 1;
      const remainingToday = targetChapters - chaptersToday;
      const chaptersFromThisBook = Math.min(remainingInBook, remainingToday);

      const endChapter = startChapter + chaptersFromThisBook - 1;

      refs.push({
        book: currentBook,
        startChapter,
        endChapter,
      });

      chaptersToday += chaptersFromThisBook;
      currentChapter = endChapter + 1;

      // Move to next book if we've finished this one
      if (currentChapter > maxChapter) {
        currentBookIndex++;
        currentChapter = 1;
      }
    }

    if (refs.length > 0) {
      readings.push({
        day_number: dayNumber,
        display_title: formatDisplayTitle(refs),
        verses_json: refs,
        summary_prompt: generateSummaryPrompt(refs),
        estimated_read_minutes: Math.ceil(chaptersToday * 4), // ~4 min per chapter
      });
    }

    dayNumber++;
  }

  // If we finished before day 365, pad with Psalms/Proverbs readings
  while (readings.length < 365) {
    const day = readings.length + 1;
    const psalmDay = ((day - 1) % 150) + 1;
    const refs = [{ book: 'Psalms', startChapter: psalmDay, endChapter: psalmDay }];
    readings.push({
      day_number: day,
      display_title: `Psalms ${psalmDay}`,
      verses_json: refs,
      summary_prompt: `Provide a reflective summary of Psalm ${psalmDay}, focusing on its worship themes and personal application.`,
      estimated_read_minutes: 5,
    });
  }

  return readings;
}

// =====================================================
// SEED FUNCTIONS
// =====================================================

async function seedReadingPlan() {
  console.log('Seeding reading plan...');

  // Check if plan already exists
  const { data: existingPlan } = await supabase
    .from('reading_plans')
    .select('id')
    .eq('slug', READING_PLAN.slug)
    .single();

  if (existingPlan) {
    console.log(`Reading plan "${READING_PLAN.slug}" already exists, skipping...`);
    return existingPlan.id;
  }

  // Insert the plan
  const { data: plan, error } = await supabase
    .from('reading_plans')
    .insert(READING_PLAN)
    .select('id')
    .single();

  if (error) {
    console.error('Error inserting reading plan:', error);
    throw error;
  }

  console.log(`Created reading plan: ${READING_PLAN.name} (${plan.id})`);
  return plan.id;
}

async function seedPlanSections(planId) {
  console.log('Generating 365-day reading schedule...');

  // Check if sections already exist
  const { data: existingSections, error: checkError } = await supabase
    .from('plan_sections')
    .select('id')
    .eq('plan_id', planId)
    .limit(1);

  if (existingSections && existingSections.length > 0) {
    console.log('Plan sections already exist, skipping...');
    return;
  }

  const readings = generateCanonicalPlan();
  console.log(`Generated ${readings.length} daily readings`);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < readings.length; i += batchSize) {
    const batch = readings.slice(i, i + batchSize).map((reading) => ({
      plan_id: planId,
      ...reading,
    }));

    const { error } = await supabase.from('plan_sections').insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }

    console.log(
      `Inserted days ${i + 1} to ${Math.min(i + batchSize, readings.length)}`
    );
  }

  console.log('All plan sections inserted successfully!');
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('='.repeat(50));
  console.log('Wayfarer Bible Reading Plan Seeder');
  console.log('='.repeat(50));

  try {
    // Seed the reading plan
    const planId = await seedReadingPlan();

    // Seed the plan sections
    await seedPlanSections(planId);

    console.log('\n' + '='.repeat(50));
    console.log('Seeding complete!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
