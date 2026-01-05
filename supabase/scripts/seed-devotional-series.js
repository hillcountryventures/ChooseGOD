/**
 * Seed script for devotional series
 * Run with: node supabase/scripts/seed-devotional-series.js
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
// DEVOTIONAL SERIES DATA
// =====================================================

const DEVOTIONAL_SERIES = [
  {
    slug: 'overcoming-anxiety',
    title: 'Overcoming Anxiety & Finding Peace',
    description: 'A 21-day journey to discover God\'s peace in uncertain times. Learn to cast your anxieties on Him and find rest for your soul.',
    total_days: 21,
    topics: ['anxiety', 'peace', 'trust', 'worry', 'rest'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'strengthening-marriage',
    title: 'Strengthening Your Marriage',
    description: 'Build a Christ-centered marriage through 14 days of biblical wisdom, practical insights, and guided conversations.',
    total_days: 14,
    topics: ['marriage', 'love', 'relationships', 'family', 'communication'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'biblical-parenting',
    title: 'Biblical Parenting in Today\'s World',
    description: 'Navigate the challenges of modern parenting with timeless biblical principles. Raise children who love God.',
    total_days: 14,
    topics: ['parenting', 'family', 'children', 'wisdom', 'discipline'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'trusting-god-finances',
    title: 'Trusting God with Finances',
    description: 'A 10-day study on biblical stewardship. Learn to honor God with your resources and trust Him as your provider.',
    total_days: 10,
    topics: ['finances', 'stewardship', 'trust', 'generosity', 'provision'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'dealing-grief',
    title: 'Dealing with Grief & Loss',
    description: 'Find comfort in God\'s presence during life\'s hardest seasons. A compassionate 14-day guide through grief.',
    total_days: 14,
    topics: ['grief', 'loss', 'comfort', 'hope', 'healing'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'cultivating-gratitude',
    title: 'Cultivating Daily Gratitude',
    description: 'Transform your perspective in just 7 days. Discover the life-changing power of thanksgiving.',
    total_days: 7,
    topics: ['gratitude', 'thanksgiving', 'joy', 'contentment', 'praise'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'deepening-prayer',
    title: 'Deepening Your Prayer Life',
    description: 'A 21-day intensive to revolutionize your prayer life. Learn different types of prayer and grow closer to God.',
    total_days: 21,
    topics: ['prayer', 'intimacy', 'listening', 'worship', 'intercession'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'knowing-gods-character',
    title: 'Knowing God\'s Character',
    description: 'A comprehensive 30-day exploration of who God is. Study His attributes and fall deeper in love with Him.',
    total_days: 30,
    topics: ['knowing_god', 'attributes', 'theology', 'worship', 'identity'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'walking-grace-forgiveness',
    title: 'Walking in Grace & Forgiveness',
    description: 'Experience freedom through forgiveness. A 14-day journey to receive and extend God\'s grace.',
    total_days: 14,
    topics: ['forgiveness', 'grace', 'freedom', 'healing', 'reconciliation'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'hearing-gods-voice',
    title: 'Hearing God\'s Voice',
    description: 'Learn to recognize and respond to God\'s voice in your life. A 14-day guide to spiritual discernment.',
    total_days: 14,
    topics: ['hearing_god', 'discernment', 'guidance', 'holy_spirit', 'listening'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  {
    slug: 'advent',
    title: 'Advent: Preparing for Christmas',
    description: 'A 25-day journey through Advent, preparing your heart for the celebration of Christ\'s birth.',
    total_days: 25,
    topics: ['advent', 'christmas', 'hope', 'prophecy', 'incarnation'],
    is_seasonal: true,
    season_start_month: 12,
    season_start_day: 1,
    difficulty_level: 'beginner',
  },
  {
    slug: 'lent',
    title: 'Lent: Journey to the Cross',
    description: 'A 40-day Lenten devotional walking with Jesus toward the cross. Reflect, repent, and prepare for Easter.',
    total_days: 40,
    topics: ['lent', 'easter', 'sacrifice', 'repentance', 'resurrection'],
    is_seasonal: true,
    season_start_month: 2,
    season_start_day: 14,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'names-attributes-jesus',
    title: 'Names & Attributes of Jesus',
    description: 'Discover Jesus through 21 of His names and titles. Deepen your understanding of who He is.',
    total_days: 21,
    topics: ['jesus', 'christology', 'names', 'identity', 'worship'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'victory-temptation',
    title: 'Victory Over Temptation & Sin',
    description: 'Practical biblical strategies for overcoming temptation. A 14-day battle plan for spiritual victory.',
    total_days: 14,
    topics: ['temptation', 'sin', 'victory', 'holiness', 'spiritual_warfare'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  {
    slug: 'renewing-your-mind',
    title: 'Renewing Your Mind',
    description: 'Transform your thinking with Scripture. A 21-day journey to align your thoughts with God\'s truth.',
    total_days: 21,
    topics: ['mind', 'thoughts', 'transformation', 'truth', 'identity'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
];

// =====================================================
// SAMPLE DEVOTIONAL DAYS GENERATOR
// =====================================================

function generateDaysForSeries(series) {
  const days = [];

  // Scripture references for each topic area (simplified - just first few days)
  const scriptureByTopic = {
    'anxiety': [
      { book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 7 },
      { book: 'Matthew', chapter: 6, verseStart: 25, verseEnd: 34 },
      { book: '1 Peter', chapter: 5, verseStart: 6, verseEnd: 7 },
    ],
    'peace': [
      { book: 'John', chapter: 14, verseStart: 27, verseEnd: 27 },
      { book: 'Isaiah', chapter: 26, verseStart: 3, verseEnd: 4 },
    ],
    'marriage': [
      { book: 'Ephesians', chapter: 5, verseStart: 25, verseEnd: 33 },
      { book: 'Genesis', chapter: 2, verseStart: 24, verseEnd: 24 },
    ],
    'parenting': [
      { book: 'Proverbs', chapter: 22, verseStart: 6, verseEnd: 6 },
      { book: 'Deuteronomy', chapter: 6, verseStart: 6, verseEnd: 9 },
    ],
    'finances': [
      { book: 'Matthew', chapter: 6, verseStart: 19, verseEnd: 21 },
      { book: 'Proverbs', chapter: 3, verseStart: 9, verseEnd: 10 },
    ],
    'grief': [
      { book: 'Psalm', chapter: 23, verseStart: 1, verseEnd: 6 },
      { book: '2 Corinthians', chapter: 1, verseStart: 3, verseEnd: 4 },
    ],
    'gratitude': [
      { book: '1 Thessalonians', chapter: 5, verseStart: 18, verseEnd: 18 },
      { book: 'Psalm', chapter: 100, verseStart: 1, verseEnd: 5 },
    ],
    'prayer': [
      { book: 'Matthew', chapter: 6, verseStart: 9, verseEnd: 13 },
      { book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 7 },
    ],
    'knowing_god': [
      { book: 'Exodus', chapter: 34, verseStart: 6, verseEnd: 7 },
      { book: 'Psalm', chapter: 103, verseStart: 8, verseEnd: 13 },
    ],
    'forgiveness': [
      { book: 'Ephesians', chapter: 4, verseStart: 32, verseEnd: 32 },
      { book: 'Matthew', chapter: 6, verseStart: 14, verseEnd: 15 },
    ],
    'hearing_god': [
      { book: 'John', chapter: 10, verseStart: 27, verseEnd: 28 },
      { book: '1 Kings', chapter: 19, verseStart: 11, verseEnd: 13 },
    ],
    'advent': [
      { book: 'Isaiah', chapter: 9, verseStart: 6, verseEnd: 7 },
      { book: 'Luke', chapter: 1, verseStart: 26, verseEnd: 38 },
    ],
    'lent': [
      { book: 'Matthew', chapter: 4, verseStart: 1, verseEnd: 11 },
      { book: 'Isaiah', chapter: 53, verseStart: 3, verseEnd: 6 },
    ],
    'jesus': [
      { book: 'John', chapter: 1, verseStart: 1, verseEnd: 14 },
      { book: 'Colossians', chapter: 1, verseStart: 15, verseEnd: 20 },
    ],
    'temptation': [
      { book: '1 Corinthians', chapter: 10, verseStart: 13, verseEnd: 13 },
      { book: 'James', chapter: 1, verseStart: 12, verseEnd: 15 },
    ],
    'mind': [
      { book: 'Romans', chapter: 12, verseStart: 1, verseEnd: 2 },
      { book: 'Philippians', chapter: 4, verseStart: 8, verseEnd: 9 },
    ],
  };

  // Get relevant scriptures for this series
  const mainTopic = series.topics[0];
  const scriptures = scriptureByTopic[mainTopic] || [
    { book: 'Psalm', chapter: 119, verseStart: 105, verseEnd: 105 },
  ];

  for (let dayNum = 1; dayNum <= series.total_days; dayNum++) {
    const scriptureIndex = (dayNum - 1) % scriptures.length;

    days.push({
      day_number: dayNum,
      title: `Day ${dayNum}: ${getDayTitle(series.slug, dayNum)}`,
      scripture_refs: [scriptures[scriptureIndex]],
      content_prompt: getContentPrompt(series, dayNum),
      reflection_questions: getReflectionQuestions(series, dayNum),
      prayer_focus: getPrayerFocus(series, dayNum),
    });
  }

  return days;
}

function getDayTitle(slug, dayNum) {
  const titles = {
    'overcoming-anxiety': [
      'Understanding Anxiety', 'The Peace of God', 'Casting Your Cares',
      'Trust in His Timing', 'The Mind of Christ', 'Rest for the Weary',
      'God\'s Presence', 'Letting Go', 'Standing Firm', 'Perfect Peace',
    ],
    'strengthening-marriage': [
      'Foundation of Love', 'Communication', 'Serving Each Other',
      'Conflict Resolution', 'Growing Together', 'Prayer as Partners',
    ],
    'biblical-parenting': [
      'God\'s Design for Family', 'Teaching by Example', 'Discipline in Love',
      'Building Character', 'Faith at Home', 'Leaving a Legacy',
    ],
    // Add more as needed...
  };

  const seriesTitles = titles[slug] || [];
  return seriesTitles[(dayNum - 1) % Math.max(seriesTitles.length, 1)] || 'Growing in Faith';
}

function getContentPrompt(series, dayNum) {
  return `Generate a personalized devotional reflection for Day ${dayNum} of "${series.title}".
    Focus on the Scripture passage and help the reader apply it to their life in relation to ${series.topics.join(', ')}.
    Be warm, encouraging, and practical. Include personal application points.`;
}

function getReflectionQuestions(series, dayNum) {
  const questions = [
    `What does today's Scripture teach you about ${series.topics[0]}?`,
    'How can you apply this truth to your life today?',
    'What is one practical step you can take based on this reading?',
    'What is God speaking to your heart through this passage?',
  ];
  return [questions[(dayNum - 1) % questions.length]];
}

function getPrayerFocus(series, dayNum) {
  const focuses = [
    `Lord, help me to trust You with my ${series.topics[0]}.`,
    'Father, transform my heart and mind through Your Word.',
    'Holy Spirit, guide me as I seek to apply this truth.',
    'Jesus, help me to follow Your example in this area.',
  ];
  return focuses[(dayNum - 1) % focuses.length];
}

// =====================================================
// MAIN SEED FUNCTION
// =====================================================

async function seedDevotionalSeries() {
  console.log('Starting devotional series seed...\n');

  for (const seriesData of DEVOTIONAL_SERIES) {
    console.log(`Seeding: ${seriesData.title}`);

    try {
      // Insert series
      const { data: series, error: seriesError } = await supabase
        .from('devotional_series')
        .upsert(seriesData, { onConflict: 'slug' })
        .select()
        .single();

      if (seriesError) {
        console.error(`  Error inserting series: ${seriesError.message}`);
        continue;
      }

      console.log(`  Series ID: ${series.id}`);

      // Generate and insert days
      const days = generateDaysForSeries(seriesData);

      for (const day of days) {
        const dayData = {
          ...day,
          series_id: series.id,
        };

        const { error: dayError } = await supabase
          .from('devotional_days')
          .upsert(dayData, { onConflict: 'series_id,day_number' });

        if (dayError) {
          console.error(`  Error inserting day ${day.day_number}: ${dayError.message}`);
        }
      }

      console.log(`  Inserted ${days.length} days\n`);
    } catch (error) {
      console.error(`  Error: ${error.message}\n`);
    }
  }

  console.log('Devotional series seed complete!');
}

// Run the seed
seedDevotionalSeries().catch(console.error);
