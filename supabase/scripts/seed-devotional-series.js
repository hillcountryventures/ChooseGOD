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

  // =====================================================
  // BEGINNER LEVEL - Building Foundations
  // =====================================================
  {
    slug: 'overcoming-fear',
    title: 'Overcoming Fear and Anxiety',
    description: 'A 7-day journey to conquer fear through faith. Discover God\'s perfect love that casts out all fear.',
    total_days: 7,
    topics: ['fear', 'anxiety', 'courage', 'faith', 'trust'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'gods-unfailing-love',
    title: 'God\'s Unfailing Love',
    description: 'Experience the depths of God\'s steadfast love over 10 transformative days. Nothing can separate you from His love.',
    total_days: 10,
    topics: ['love', 'grace', 'identity', 'acceptance', 'belonging'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'daily-gratitude',
    title: 'Daily Gratitude and Thanksgiving',
    description: 'A 14-day journey to cultivate a thankful heart. Transform your perspective through the discipline of gratitude.',
    total_days: 14,
    topics: ['gratitude', 'thanksgiving', 'joy', 'contentment', 'praise'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'hearing-gods-voice-beginner',
    title: 'Hearing God\'s Voice',
    description: 'Learn the basics of discerning God\'s voice in 7 days. Discover how God speaks through Scripture, prayer, and daily life.',
    total_days: 7,
    topics: ['hearing_god', 'discernment', 'guidance', 'prayer', 'listening'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },

  // =====================================================
  // INTERMEDIATE LEVEL - Growing in Application
  // =====================================================
  {
    slug: 'power-of-prayer',
    title: 'The Power of Prayer',
    description: 'A 14-day deep dive into powerful, effective prayer. Learn to pray with confidence and see God move.',
    total_days: 14,
    topics: ['prayer', 'faith', 'intercession', 'petition', 'worship'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'fruit-of-the-spirit',
    title: 'Fruit of the Spirit',
    description: 'A comprehensive 21-day study on the nine fruits of the Spirit. Cultivate love, joy, peace, and more in your daily life.',
    total_days: 21,
    topics: ['fruit_spirit', 'character', 'holiness', 'love', 'self_control'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'trusting-gods-timing',
    title: 'Trusting God\'s Timing',
    description: 'A 10-day journey to embrace God\'s perfect timing. Learn patience and trust when answers seem delayed.',
    total_days: 10,
    topics: ['patience', 'trust', 'waiting', 'faith', 'sovereignty'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'forgiveness-healing',
    title: 'Forgiveness and Healing',
    description: 'A 14-day path to freedom through forgiveness. Release bitterness and experience God\'s healing touch.',
    total_days: 14,
    topics: ['forgiveness', 'healing', 'freedom', 'grace', 'reconciliation'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },

  // =====================================================
  // ADVANCED LEVEL - Deeper Study and Challenge
  // =====================================================
  {
    slug: 'armor-of-god',
    title: 'The Armor of God',
    description: 'A 10-day intensive study on spiritual warfare. Learn to stand firm against the enemy with God\'s full armor.',
    total_days: 10,
    topics: ['spiritual_warfare', 'armor', 'protection', 'victory', 'faith'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  {
    slug: 'attributes-of-god',
    title: 'Attributes of God',
    description: 'A 21-day exploration of God\'s divine attributes. Deepen your theology and transform your worship.',
    total_days: 21,
    topics: ['knowing_god', 'attributes', 'theology', 'worship', 'holiness'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  {
    slug: 'faith-in-trials',
    title: 'Faith in Trials',
    description: 'A 14-day guide to standing strong when life is hard. Discover how trials produce perseverance and hope.',
    total_days: 14,
    topics: ['trials', 'perseverance', 'faith', 'hope', 'suffering'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  {
    slug: 'discipleship-obedience',
    title: 'Discipleship and Obedience',
    description: 'A comprehensive 30-day journey into radical discipleship. Count the cost and follow Jesus wholeheartedly.',
    total_days: 30,
    topics: ['discipleship', 'obedience', 'surrender', 'following_jesus', 'commitment'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },

  // =====================================================
  // SEASONAL DEVOTIONALS
  // =====================================================
  {
    slug: 'advent-waiting-hope',
    title: 'Waiting in Hope: Advent Journey',
    description: 'A 25-day Advent journey preparing your heart for Christ\'s coming. Experience hope, peace, joy, and love.',
    total_days: 25,
    topics: ['advent', 'hope', 'waiting', 'christmas', 'prophecy'],
    is_seasonal: true,
    season_start_month: 12,
    season_start_day: 1,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'lent-journey-cross',
    title: 'Journey to the Cross: Lent Reflections',
    description: 'A 40-day Lenten journey of reflection, repentance, and renewal. Walk with Jesus to Calvary.',
    total_days: 40,
    topics: ['lent', 'repentance', 'sacrifice', 'cross', 'surrender'],
    is_seasonal: true,
    season_start_month: 2,
    season_start_day: 14,
    difficulty_level: 'advanced',
  },
  {
    slug: 'easter-triumph',
    title: 'From Darkness to Light: Easter Triumph',
    description: 'A 14-day celebration of resurrection and new life. Experience the power of the risen Christ.',
    total_days: 14,
    topics: ['easter', 'resurrection', 'hope', 'new_life', 'victory'],
    is_seasonal: true,
    season_start_month: 4,
    season_start_day: 1,
    difficulty_level: 'intermediate',
  },

  // =====================================================
  // FAMILY-FOCUSED DEVOTIONALS
  // =====================================================
  {
    slug: 'family-faith-builders',
    title: 'Family Faith Builders',
    description: 'A 21-day journey to strengthen family bonds through Scripture. Build a foundation of faith together.',
    total_days: 21,
    topics: ['family', 'faith', 'unity', 'parenting', 'legacy'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'gods-promises-families',
    title: 'God\'s Promises for Families',
    description: 'A 14-day exploration of God\'s promises for your family. Claim His blessings for your household.',
    total_days: 14,
    topics: ['family', 'promises', 'blessing', 'covenant', 'protection'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'fruit-spirit-home',
    title: 'Fruit of the Spirit in the Home',
    description: 'A 30-day family devotional growing love, joy, peace, and more together. Transform your home atmosphere.',
    total_days: 30,
    topics: ['family', 'fruit_spirit', 'home', 'character', 'relationships'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },

  // =====================================================
  // FOR MEN
  // =====================================================
  {
    slug: 'man-of-valor',
    title: 'Man of Valor: Biblical Courage',
    description: 'A 14-day study on biblical manhood and courage. Draw strength from heroes like David, Joshua, and Paul.',
    total_days: 14,
    topics: ['men', 'courage', 'strength', 'leadership', 'integrity'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'strength-in-lord',
    title: 'Strength in the Lord',
    description: 'A 21-day journey for men facing life\'s battles. Find your strength in God alone.',
    total_days: 21,
    topics: ['men', 'strength', 'spiritual_warfare', 'perseverance', 'faith'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  {
    slug: 'leading-like-christ',
    title: 'Leading Like Christ',
    description: 'A 10-day guide for husbands, fathers, and leaders. Learn servant leadership from Jesus Himself.',
    total_days: 10,
    topics: ['men', 'leadership', 'servant_leadership', 'marriage', 'fatherhood'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },

  // =====================================================
  // FOR WOMEN
  // =====================================================
  {
    slug: 'woman-of-grace',
    title: 'Woman of Grace',
    description: 'A 14-day journey embracing your identity in Christ. Discover the beauty of being a daughter of the King.',
    total_days: 14,
    topics: ['women', 'identity', 'grace', 'beauty', 'worth'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  {
    slug: 'proverbs-31-heart',
    title: 'Proverbs 31 Heart',
    description: 'A 21-day study on the virtuous woman. Gain wisdom for daily living, relationships, and purpose.',
    total_days: 21,
    topics: ['women', 'wisdom', 'virtue', 'proverbs', 'character'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  {
    slug: 'beauty-from-ashes',
    title: 'Beauty from Ashes: Healing and Hope',
    description: 'A 10-day journey from brokenness to wholeness. God turns your mourning into dancing.',
    total_days: 10,
    topics: ['women', 'healing', 'hope', 'restoration', 'redemption'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },

  // =====================================================
  // FOR TEENAGERS
  // =====================================================
  {
    slug: 'teen-identity-christ',
    title: 'Identity in Christ',
    description: 'A 14-day journey for teens navigating life\'s pressures. Discover who you really are in Jesus.',
    total_days: 14,
    topics: ['teens', 'identity', 'purpose', 'self_worth', 'belonging'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'teen-faith-over-fear',
    title: 'Faith Over Fear',
    description: 'A 7-day guide for teens handling anxiety and peer pressure. Choose faith over fear every day.',
    total_days: 7,
    topics: ['teens', 'fear', 'faith', 'courage', 'peer_pressure'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  {
    slug: 'teen-live-boldly',
    title: 'Live Boldly: Teen Discipleship',
    description: 'A 30-day journey to grow deeper in faith, prayer, and purpose. Live boldly for Christ.',
    total_days: 30,
    topics: ['teens', 'discipleship', 'boldness', 'prayer', 'purpose'],
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
    // New topic areas for expanded devotional library
    'fear': [
      { book: '2 Timothy', chapter: 1, verseStart: 7, verseEnd: 7 },
      { book: 'Isaiah', chapter: 41, verseStart: 10, verseEnd: 13 },
      { book: '1 John', chapter: 4, verseStart: 18, verseEnd: 18 },
    ],
    'love': [
      { book: 'Romans', chapter: 8, verseStart: 38, verseEnd: 39 },
      { book: '1 John', chapter: 4, verseStart: 7, verseEnd: 12 },
      { book: 'Jeremiah', chapter: 31, verseStart: 3, verseEnd: 3 },
    ],
    'fruit_spirit': [
      { book: 'Galatians', chapter: 5, verseStart: 22, verseEnd: 23 },
      { book: 'John', chapter: 15, verseStart: 1, verseEnd: 8 },
      { book: 'Colossians', chapter: 3, verseStart: 12, verseEnd: 17 },
    ],
    'patience': [
      { book: 'Psalm', chapter: 27, verseStart: 14, verseEnd: 14 },
      { book: 'Isaiah', chapter: 40, verseStart: 31, verseEnd: 31 },
      { book: 'James', chapter: 5, verseStart: 7, verseEnd: 8 },
    ],
    'spiritual_warfare': [
      { book: 'Ephesians', chapter: 6, verseStart: 10, verseEnd: 18 },
      { book: '2 Corinthians', chapter: 10, verseStart: 3, verseEnd: 5 },
      { book: 'James', chapter: 4, verseStart: 7, verseEnd: 7 },
    ],
    'trials': [
      { book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 },
      { book: 'Romans', chapter: 5, verseStart: 3, verseEnd: 5 },
      { book: '1 Peter', chapter: 1, verseStart: 6, verseEnd: 7 },
    ],
    'discipleship': [
      { book: 'Luke', chapter: 9, verseStart: 23, verseEnd: 25 },
      { book: 'Matthew', chapter: 28, verseStart: 19, verseEnd: 20 },
      { book: 'John', chapter: 8, verseStart: 31, verseEnd: 32 },
    ],
    'easter': [
      { book: 'Romans', chapter: 6, verseStart: 9, verseEnd: 11 },
      { book: '1 Corinthians', chapter: 15, verseStart: 55, verseEnd: 57 },
      { book: 'John', chapter: 11, verseStart: 25, verseEnd: 26 },
    ],
    'family': [
      { book: 'Joshua', chapter: 24, verseStart: 15, verseEnd: 15 },
      { book: 'Psalm', chapter: 127, verseStart: 3, verseEnd: 5 },
      { book: 'Colossians', chapter: 3, verseStart: 18, verseEnd: 21 },
    ],
    'men': [
      { book: 'Joshua', chapter: 1, verseStart: 9, verseEnd: 9 },
      { book: '1 Corinthians', chapter: 16, verseStart: 13, verseEnd: 14 },
      { book: 'Micah', chapter: 6, verseStart: 8, verseEnd: 8 },
    ],
    'women': [
      { book: 'Proverbs', chapter: 31, verseStart: 25, verseEnd: 31 },
      { book: '1 Peter', chapter: 3, verseStart: 3, verseEnd: 4 },
      { book: 'Isaiah', chapter: 61, verseStart: 3, verseEnd: 3 },
    ],
    'teens': [
      { book: '1 Timothy', chapter: 4, verseStart: 12, verseEnd: 12 },
      { book: 'Jeremiah', chapter: 29, verseStart: 11, verseEnd: 11 },
      { book: 'Psalm', chapter: 119, verseStart: 9, verseEnd: 11 },
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
