/**
 * Curated Reading Plans
 * 
 * 10 diverse reading plans to compete with YouVersion.
 * Each plan targets a different user need or spiritual goal.
 */

import { DailyReading, ReadingPlan } from './readingPlans';

// ============================================================================
// 1. NEW BELIEVER'S JOURNEY (30 Days)
// For those just starting their faith walk
// ============================================================================

export const NEW_BELIEVERS_PLAN: ReadingPlan = {
  id: 'new-believers-30',
  name: "New Believer's Journey",
  description: "Start your faith walk with 30 days of foundational Scripture. Perfect for those new to the Bible or rediscovering their faith.",
  totalDays: 30,
  readings: [
    { dayNumber: 1, displayTitle: "God's Love for You", verseReferences: [{ book: 'John', startChapter: 3, endChapter: 3 }], summaryPrompt: "What does John 3:16 mean for your life?" },
    { dayNumber: 2, displayTitle: "In the Beginning", verseReferences: [{ book: 'Genesis', startChapter: 1, endChapter: 1 }], summaryPrompt: "What does creation tell us about God?" },
    { dayNumber: 3, displayTitle: "The Fall & Promise", verseReferences: [{ book: 'Genesis', startChapter: 3, endChapter: 3 }], summaryPrompt: "How does sin enter the world, and what hope is given?" },
    { dayNumber: 4, displayTitle: "Faith Like Abraham", verseReferences: [{ book: 'Genesis', startChapter: 12, endChapter: 12 }], summaryPrompt: "What did it cost Abraham to follow God?" },
    { dayNumber: 5, displayTitle: "The Ten Commandments", verseReferences: [{ book: 'Exodus', startChapter: 20, endChapter: 20 }], summaryPrompt: "How do these commands shape our relationship with God and others?" },
    { dayNumber: 6, displayTitle: "The Lord is My Shepherd", verseReferences: [{ book: 'Psalms', startChapter: 23, endChapter: 23 }], summaryPrompt: "What does it mean to have God as your shepherd?" },
    { dayNumber: 7, displayTitle: "Trust in the Lord", verseReferences: [{ book: 'Proverbs', startChapter: 3, endChapter: 3 }], summaryPrompt: "How can you trust God with all your heart?" },
    { dayNumber: 8, displayTitle: "The Suffering Servant", verseReferences: [{ book: 'Isaiah', startChapter: 53, endChapter: 53 }], summaryPrompt: "How does this prophecy point to Jesus?" },
    { dayNumber: 9, displayTitle: "Jesus is Born", verseReferences: [{ book: 'Luke', startChapter: 2, endChapter: 2 }], summaryPrompt: "Why did God come as a baby?" },
    { dayNumber: 10, displayTitle: "The Sermon on the Mount", verseReferences: [{ book: 'Matthew', startChapter: 5, endChapter: 5 }], summaryPrompt: "What does it mean to be 'blessed'?" },
    { dayNumber: 11, displayTitle: "The Lord's Prayer", verseReferences: [{ book: 'Matthew', startChapter: 6, endChapter: 6 }], summaryPrompt: "How does Jesus teach us to pray?" },
    { dayNumber: 12, displayTitle: "Don't Worry", verseReferences: [{ book: 'Matthew', startChapter: 6, endChapter: 6 }], summaryPrompt: "What does Jesus say about anxiety?" },
    { dayNumber: 13, displayTitle: "The Good Samaritan", verseReferences: [{ book: 'Luke', startChapter: 10, endChapter: 10 }], summaryPrompt: "Who is your neighbor?" },
    { dayNumber: 14, displayTitle: "The Prodigal Son", verseReferences: [{ book: 'Luke', startChapter: 15, endChapter: 15 }], summaryPrompt: "What does this teach about God's forgiveness?" },
    { dayNumber: 15, displayTitle: "The Way, Truth, Life", verseReferences: [{ book: 'John', startChapter: 14, endChapter: 14 }], summaryPrompt: "What comfort does Jesus offer?" },
    { dayNumber: 16, displayTitle: "The Vine and Branches", verseReferences: [{ book: 'John', startChapter: 15, endChapter: 15 }], summaryPrompt: "How do we stay connected to Jesus?" },
    { dayNumber: 17, displayTitle: "The Crucifixion", verseReferences: [{ book: 'John', startChapter: 19, endChapter: 19 }], summaryPrompt: "Why did Jesus have to die?" },
    { dayNumber: 18, displayTitle: "The Resurrection", verseReferences: [{ book: 'John', startChapter: 20, endChapter: 20 }], summaryPrompt: "What does the resurrection mean for you?" },
    { dayNumber: 19, displayTitle: "The Great Commission", verseReferences: [{ book: 'Matthew', startChapter: 28, endChapter: 28 }], summaryPrompt: "What is our mission as believers?" },
    { dayNumber: 20, displayTitle: "The Holy Spirit Comes", verseReferences: [{ book: 'Acts', startChapter: 2, endChapter: 2 }], summaryPrompt: "How does the Spirit empower us?" },
    { dayNumber: 21, displayTitle: "Saved by Grace", verseReferences: [{ book: 'Ephesians', startChapter: 2, endChapter: 2 }], summaryPrompt: "What is grace and why does it matter?" },
    { dayNumber: 22, displayTitle: "The Armor of God", verseReferences: [{ book: 'Ephesians', startChapter: 6, endChapter: 6 }], summaryPrompt: "How do we stand firm in faith?" },
    { dayNumber: 23, displayTitle: "Joy in All Circumstances", verseReferences: [{ book: 'Philippians', startChapter: 4, endChapter: 4 }], summaryPrompt: "How can we rejoice always?" },
    { dayNumber: 24, displayTitle: "Faith and Works", verseReferences: [{ book: 'James', startChapter: 2, endChapter: 2 }], summaryPrompt: "How does faith show in action?" },
    { dayNumber: 25, displayTitle: "God is Love", verseReferences: [{ book: '1 John', startChapter: 4, endChapter: 4 }], summaryPrompt: "What does it mean that God IS love?" },
    { dayNumber: 26, displayTitle: "The Love Chapter", verseReferences: [{ book: '1 Corinthians', startChapter: 13, endChapter: 13 }], summaryPrompt: "How does love look in practice?" },
    { dayNumber: 27, displayTitle: "More Than Conquerors", verseReferences: [{ book: 'Romans', startChapter: 8, endChapter: 8 }], summaryPrompt: "What can separate us from God's love?" },
    { dayNumber: 28, displayTitle: "A Living Hope", verseReferences: [{ book: '1 Peter', startChapter: 1, endChapter: 1 }], summaryPrompt: "What hope do we have in Christ?" },
    { dayNumber: 29, displayTitle: "The New Heaven", verseReferences: [{ book: 'Revelation', startChapter: 21, endChapter: 21 }], summaryPrompt: "What is our eternal hope?" },
    { dayNumber: 30, displayTitle: "Go and Make Disciples", verseReferences: [{ book: 'Acts', startChapter: 1, endChapter: 1 }], summaryPrompt: "How will you continue your journey?" },
  ],
};

// ============================================================================
// 2. PSALMS & PROVERBS (61 Days)
// Wisdom and worship for daily life
// ============================================================================

export const PSALMS_PROVERBS_PLAN: ReadingPlan = {
  id: 'psalms-proverbs-61',
  name: "Psalms & Proverbs",
  description: "61 days of wisdom and worship. Read through Psalms and Proverbs for daily guidance, comfort, and praise.",
  totalDays: 61,
  readings: generatePsalmsProverbsReadings(),
};

function generatePsalmsProverbsReadings(): DailyReading[] {
  const readings: DailyReading[] = [];
  let dayNum = 1;
  
  // Proverbs 1-31 (31 days)
  for (let ch = 1; ch <= 31; ch++) {
    readings.push({
      dayNumber: dayNum++,
      displayTitle: `Proverbs ${ch}`,
      verseReferences: [{ book: 'Proverbs', startChapter: ch, endChapter: ch }],
      summaryPrompt: `What wisdom stands out to you in Proverbs ${ch}?`,
    });
  }
  
  // Selected Psalms (30 days)
  const selectedPsalms = [1, 8, 19, 23, 27, 34, 37, 42, 46, 51, 63, 84, 90, 91, 100, 103, 119, 121, 127, 139, 145, 146, 147, 148, 149, 150, 16, 22, 40, 73];
  for (const ps of selectedPsalms) {
    readings.push({
      dayNumber: dayNum++,
      displayTitle: `Psalm ${ps}`,
      verseReferences: [{ book: 'Psalms', startChapter: ps, endChapter: ps }],
      summaryPrompt: `How does Psalm ${ps} speak to your heart today?`,
    });
  }
  
  return readings;
}

// ============================================================================
// 3. THE GOSPELS (60 Days)
// Walk with Jesus through all four accounts
// ============================================================================

export const GOSPELS_PLAN: ReadingPlan = {
  id: 'gospels-60',
  name: "Walk with Jesus: The Gospels",
  description: "60 days through Matthew, Mark, Luke, and John. Experience the life, teachings, death, and resurrection of Jesus.",
  totalDays: 60,
  readings: generateGospelsReadings(),
};

function generateGospelsReadings(): DailyReading[] {
  const readings: DailyReading[] = [];
  let dayNum = 1;
  
  // Matthew (15 days, ~2 chapters/day)
  for (let i = 0; i < 14; i++) {
    const start = i * 2 + 1;
    const end = Math.min(start + 1, 28);
    readings.push({
      dayNumber: dayNum++,
      displayTitle: `Matthew ${start}-${end}`,
      verseReferences: [{ book: 'Matthew', startChapter: start, endChapter: end }],
      summaryPrompt: `What did you learn about Jesus in today's reading?`,
    });
  }
  
  // Mark (8 days, 2 chapters/day)
  for (let i = 0; i < 8; i++) {
    const start = i * 2 + 1;
    const end = Math.min(start + 1, 16);
    readings.push({
      dayNumber: dayNum++,
      displayTitle: `Mark ${start}-${end}`,
      verseReferences: [{ book: 'Mark', startChapter: start, endChapter: end }],
      summaryPrompt: `Mark emphasizes action. What did Jesus DO today?`,
    });
  }
  
  // Luke (12 days, 2 chapters/day)
  for (let i = 0; i < 12; i++) {
    const start = i * 2 + 1;
    const end = Math.min(start + 1, 24);
    readings.push({
      dayNumber: dayNum++,
      displayTitle: `Luke ${start}-${end}`,
      verseReferences: [{ book: 'Luke', startChapter: start, endChapter: end }],
      summaryPrompt: `Luke focuses on people. Who stood out in today's reading?`,
    });
  }
  
  // John (10 days, ~2 chapters/day)
  for (let i = 0; i < 10; i++) {
    const start = i * 2 + 1;
    const end = Math.min(start + 1, 21);
    readings.push({
      dayNumber: dayNum++,
      displayTitle: `John ${start}-${end}`,
      verseReferences: [{ book: 'John', startChapter: start, endChapter: end }],
      summaryPrompt: `John reveals Jesus' identity. Who is Jesus according to this passage?`,
    });
  }
  
  // Fill remaining days with key passages review
  while (readings.length < 60) {
    readings.push({
      dayNumber: dayNum++,
      displayTitle: "Reflection Day",
      verseReferences: [{ book: 'John', startChapter: 1, endChapter: 1 }],
      summaryPrompt: "Review your favorite passages from the Gospels this week.",
    });
  }
  
  return readings;
}

// ============================================================================
// 4. WOMEN OF THE BIBLE (21 Days)
// Stories of faith, courage, and redemption
// ============================================================================

export const WOMEN_OF_BIBLE_PLAN: ReadingPlan = {
  id: 'women-of-bible-21',
  name: "Women of the Bible",
  description: "21 days exploring the remarkable women of Scripture. From Eve to Mary, discover stories of faith, courage, and God's faithfulness.",
  totalDays: 21,
  readings: [
    { dayNumber: 1, displayTitle: "Eve: Mother of All Living", verseReferences: [{ book: 'Genesis', startChapter: 2, endChapter: 3 }], summaryPrompt: "What can we learn from Eve's story?" },
    { dayNumber: 2, displayTitle: "Sarah: Mother of Nations", verseReferences: [{ book: 'Genesis', startChapter: 18, endChapter: 18 }], summaryPrompt: "How did Sarah's faith grow over time?" },
    { dayNumber: 3, displayTitle: "Hagar: God Sees Me", verseReferences: [{ book: 'Genesis', startChapter: 16, endChapter: 16 }], summaryPrompt: "How does God meet Hagar in her distress?" },
    { dayNumber: 4, displayTitle: "Rebekah: Chosen Bride", verseReferences: [{ book: 'Genesis', startChapter: 24, endChapter: 24 }], summaryPrompt: "What role did Rebekah play in God's plan?" },
    { dayNumber: 5, displayTitle: "Rachel & Leah: Sisters in Struggle", verseReferences: [{ book: 'Genesis', startChapter: 29, endChapter: 30 }], summaryPrompt: "What do their stories teach about comparison?" },
    { dayNumber: 6, displayTitle: "Miriam: Prophetess & Leader", verseReferences: [{ book: 'Exodus', startChapter: 15, endChapter: 15 }], summaryPrompt: "How did Miriam lead in worship?" },
    { dayNumber: 7, displayTitle: "Rahab: Faith in Action", verseReferences: [{ book: 'Joshua', startChapter: 2, endChapter: 2 }], summaryPrompt: "How did Rahab's faith change her destiny?" },
    { dayNumber: 8, displayTitle: "Deborah: Judge & Warrior", verseReferences: [{ book: 'Judges', startChapter: 4, endChapter: 5 }], summaryPrompt: "What leadership qualities did Deborah display?" },
    { dayNumber: 9, displayTitle: "Ruth: Loyalty & Redemption", verseReferences: [{ book: 'Ruth', startChapter: 1, endChapter: 2 }], summaryPrompt: "What can we learn from Ruth's loyalty?" },
    { dayNumber: 10, displayTitle: "Ruth: A Kinsman Redeemer", verseReferences: [{ book: 'Ruth', startChapter: 3, endChapter: 4 }], summaryPrompt: "How does Ruth's story point to Jesus?" },
    { dayNumber: 11, displayTitle: "Hannah: Prayer & Surrender", verseReferences: [{ book: '1 Samuel', startChapter: 1, endChapter: 2 }], summaryPrompt: "What does Hannah teach us about prayer?" },
    { dayNumber: 12, displayTitle: "Abigail: Wisdom & Peace", verseReferences: [{ book: '1 Samuel', startChapter: 25, endChapter: 25 }], summaryPrompt: "How did Abigail's wisdom save lives?" },
    { dayNumber: 13, displayTitle: "Esther: For Such a Time", verseReferences: [{ book: 'Esther', startChapter: 4, endChapter: 5 }], summaryPrompt: "What courage did Esther display?" },
    { dayNumber: 14, displayTitle: "Esther: Victory & Deliverance", verseReferences: [{ book: 'Esther', startChapter: 7, endChapter: 8 }], summaryPrompt: "How did God use Esther to save His people?" },
    { dayNumber: 15, displayTitle: "The Proverbs 31 Woman", verseReferences: [{ book: 'Proverbs', startChapter: 31, endChapter: 31 }], summaryPrompt: "What qualities define a woman of valor?" },
    { dayNumber: 16, displayTitle: "Mary: Favored & Faithful", verseReferences: [{ book: 'Luke', startChapter: 1, endChapter: 1 }], summaryPrompt: "How did Mary respond to God's call?" },
    { dayNumber: 17, displayTitle: "Elizabeth: Joy in Waiting", verseReferences: [{ book: 'Luke', startChapter: 1, endChapter: 1 }], summaryPrompt: "What can we learn from Elizabeth's patience?" },
    { dayNumber: 18, displayTitle: "Mary Magdalene: Transformed", verseReferences: [{ book: 'John', startChapter: 20, endChapter: 20 }], summaryPrompt: "How did encountering Jesus change Mary?" },
    { dayNumber: 19, displayTitle: "Martha & Mary: Two Responses", verseReferences: [{ book: 'Luke', startChapter: 10, endChapter: 10 }], summaryPrompt: "What balance do we need between service and sitting at Jesus' feet?" },
    { dayNumber: 20, displayTitle: "The Woman at the Well", verseReferences: [{ book: 'John', startChapter: 4, endChapter: 4 }], summaryPrompt: "How did Jesus meet this woman's deepest need?" },
    { dayNumber: 21, displayTitle: "Lydia: First European Convert", verseReferences: [{ book: 'Acts', startChapter: 16, endChapter: 16 }], summaryPrompt: "How did Lydia's faith impact her community?" },
  ],
};

// ============================================================================
// 5. MEN OF THE BIBLE (21 Days)
// Lessons in faith, failure, and redemption
// ============================================================================

export const MEN_OF_BIBLE_PLAN: ReadingPlan = {
  id: 'men-of-bible-21',
  name: "Men of the Bible",
  description: "21 days studying the men of Scripture. Learn from their triumphs and failures, and discover what it means to follow God as a man.",
  totalDays: 21,
  readings: [
    { dayNumber: 1, displayTitle: "Adam: The First Man", verseReferences: [{ book: 'Genesis', startChapter: 2, endChapter: 3 }], summaryPrompt: "What responsibility did Adam bear?" },
    { dayNumber: 2, displayTitle: "Noah: Faithful in a Wicked World", verseReferences: [{ book: 'Genesis', startChapter: 6, endChapter: 7 }], summaryPrompt: "What did it cost Noah to obey God?" },
    { dayNumber: 3, displayTitle: "Abraham: Father of Faith", verseReferences: [{ book: 'Genesis', startChapter: 22, endChapter: 22 }], summaryPrompt: "How did Abraham's faith show in action?" },
    { dayNumber: 4, displayTitle: "Jacob: Wrestled & Changed", verseReferences: [{ book: 'Genesis', startChapter: 32, endChapter: 32 }], summaryPrompt: "What does it mean to wrestle with God?" },
    { dayNumber: 5, displayTitle: "Joseph: Faithful in Suffering", verseReferences: [{ book: 'Genesis', startChapter: 39, endChapter: 41 }], summaryPrompt: "How did Joseph remain faithful through trials?" },
    { dayNumber: 6, displayTitle: "Moses: Called & Equipped", verseReferences: [{ book: 'Exodus', startChapter: 3, endChapter: 4 }], summaryPrompt: "How does God answer Moses' objections?" },
    { dayNumber: 7, displayTitle: "Joshua: Courageous Leader", verseReferences: [{ book: 'Joshua', startChapter: 1, endChapter: 1 }], summaryPrompt: "What made Joshua a strong leader?" },
    { dayNumber: 8, displayTitle: "Gideon: Unlikely Hero", verseReferences: [{ book: 'Judges', startChapter: 6, endChapter: 7 }], summaryPrompt: "How did God use Gideon's weakness?" },
    { dayNumber: 9, displayTitle: "Samson: Strength & Weakness", verseReferences: [{ book: 'Judges', startChapter: 16, endChapter: 16 }], summaryPrompt: "What warnings can we learn from Samson?" },
    { dayNumber: 10, displayTitle: "Samuel: Hearing God's Voice", verseReferences: [{ book: '1 Samuel', startChapter: 3, endChapter: 3 }], summaryPrompt: "How can we hear God's voice?" },
    { dayNumber: 11, displayTitle: "David: A Heart After God", verseReferences: [{ book: '1 Samuel', startChapter: 17, endChapter: 17 }], summaryPrompt: "What gave David courage against Goliath?" },
    { dayNumber: 12, displayTitle: "David: Fall & Restoration", verseReferences: [{ book: '2 Samuel', startChapter: 11, endChapter: 12 }], summaryPrompt: "How did David respond to conviction?" },
    { dayNumber: 13, displayTitle: "Solomon: Wisdom & Warning", verseReferences: [{ book: '1 Kings', startChapter: 3, endChapter: 3 }], summaryPrompt: "What can we learn from Solomon's request?" },
    { dayNumber: 14, displayTitle: "Elijah: Bold Prophet", verseReferences: [{ book: '1 Kings', startChapter: 18, endChapter: 18 }], summaryPrompt: "What gave Elijah boldness?" },
    { dayNumber: 15, displayTitle: "Job: Faith in Suffering", verseReferences: [{ book: 'Job', startChapter: 1, endChapter: 2 }], summaryPrompt: "How did Job respond to loss?" },
    { dayNumber: 16, displayTitle: "Daniel: Uncompromising Faith", verseReferences: [{ book: 'Daniel', startChapter: 6, endChapter: 6 }], summaryPrompt: "What did Daniel's consistency cost him?" },
    { dayNumber: 17, displayTitle: "Jonah: Running & Returning", verseReferences: [{ book: 'Jonah', startChapter: 1, endChapter: 2 }], summaryPrompt: "Why do we run from God's call?" },
    { dayNumber: 18, displayTitle: "Peter: Failure & Restoration", verseReferences: [{ book: 'John', startChapter: 21, endChapter: 21 }], summaryPrompt: "How did Jesus restore Peter?" },
    { dayNumber: 19, displayTitle: "Paul: Transformed Persecutor", verseReferences: [{ book: 'Acts', startChapter: 9, endChapter: 9 }], summaryPrompt: "How radically can God change someone?" },
    { dayNumber: 20, displayTitle: "Timothy: Young but Faithful", verseReferences: [{ book: '1 Timothy', startChapter: 4, endChapter: 4 }], summaryPrompt: "What encouragement does Paul give Timothy?" },
    { dayNumber: 21, displayTitle: "Jesus: The Perfect Man", verseReferences: [{ book: 'Philippians', startChapter: 2, endChapter: 2 }], summaryPrompt: "How is Jesus our ultimate example?" },
  ],
};

// ============================================================================
// 6. OVERCOMING ANXIETY (14 Days)
// Scripture for peace and trust
// ============================================================================

export const ANXIETY_PLAN: ReadingPlan = {
  id: 'overcoming-anxiety-14',
  name: "Overcoming Anxiety",
  description: "14 days of Scripture to help you find peace in anxious times. God's Word speaks directly to our worries and fears.",
  totalDays: 14,
  readings: [
    { dayNumber: 1, displayTitle: "Do Not Fear", verseReferences: [{ book: 'Isaiah', startChapter: 41, endChapter: 41 }], summaryPrompt: "What promises does God make about fear?" },
    { dayNumber: 2, displayTitle: "Cast Your Cares", verseReferences: [{ book: 'Psalms', startChapter: 55, endChapter: 55 }], summaryPrompt: "What does it mean to cast your burden on the Lord?" },
    { dayNumber: 3, displayTitle: "Peace I Leave With You", verseReferences: [{ book: 'John', startChapter: 14, endChapter: 14 }], summaryPrompt: "What kind of peace does Jesus offer?" },
    { dayNumber: 4, displayTitle: "Don't Worry About Tomorrow", verseReferences: [{ book: 'Matthew', startChapter: 6, endChapter: 6 }], summaryPrompt: "How does Jesus address worry?" },
    { dayNumber: 5, displayTitle: "The Lord is My Shepherd", verseReferences: [{ book: 'Psalms', startChapter: 23, endChapter: 23 }], summaryPrompt: "How does the shepherd imagery bring comfort?" },
    { dayNumber: 6, displayTitle: "Pray About Everything", verseReferences: [{ book: 'Philippians', startChapter: 4, endChapter: 4 }], summaryPrompt: "What is the result of bringing everything to God?" },
    { dayNumber: 7, displayTitle: "God is Our Refuge", verseReferences: [{ book: 'Psalms', startChapter: 46, endChapter: 46 }], summaryPrompt: "Where do you find refuge in storms?" },
    { dayNumber: 8, displayTitle: "Nothing Can Separate Us", verseReferences: [{ book: 'Romans', startChapter: 8, endChapter: 8 }], summaryPrompt: "What security do we have in Christ?" },
    { dayNumber: 9, displayTitle: "Trust in the Lord", verseReferences: [{ book: 'Proverbs', startChapter: 3, endChapter: 3 }], summaryPrompt: "What does wholehearted trust look like?" },
    { dayNumber: 10, displayTitle: "When I Am Afraid", verseReferences: [{ book: 'Psalms', startChapter: 56, endChapter: 56 }], summaryPrompt: "How did David respond to fear?" },
    { dayNumber: 11, displayTitle: "Perfect Love Casts Out Fear", verseReferences: [{ book: '1 John', startChapter: 4, endChapter: 4 }], summaryPrompt: "How does God's love address our fears?" },
    { dayNumber: 12, displayTitle: "Rest for the Weary", verseReferences: [{ book: 'Matthew', startChapter: 11, endChapter: 11 }], summaryPrompt: "What rest does Jesus offer?" },
    { dayNumber: 13, displayTitle: "God's Thoughts Toward You", verseReferences: [{ book: 'Jeremiah', startChapter: 29, endChapter: 29 }], summaryPrompt: "What are God's plans for you?" },
    { dayNumber: 14, displayTitle: "Be Strong and Courageous", verseReferences: [{ book: 'Joshua', startChapter: 1, endChapter: 1 }], summaryPrompt: "What gives us courage to face the future?" },
  ],
};

// ============================================================================
// 7. MARRIAGE & FAMILY (21 Days)
// Building a God-centered home
// ============================================================================

export const MARRIAGE_FAMILY_PLAN: ReadingPlan = {
  id: 'marriage-family-21',
  name: "Marriage & Family",
  description: "21 days of wisdom for building a God-centered home. Whether married, single, or a parent, discover biblical principles for relationships.",
  totalDays: 21,
  readings: [
    { dayNumber: 1, displayTitle: "Two Become One", verseReferences: [{ book: 'Genesis', startChapter: 2, endChapter: 2 }], summaryPrompt: "What was God's design for marriage?" },
    { dayNumber: 2, displayTitle: "Love is Patient", verseReferences: [{ book: '1 Corinthians', startChapter: 13, endChapter: 13 }], summaryPrompt: "How does this love look in daily life?" },
    { dayNumber: 3, displayTitle: "Wives and Husbands", verseReferences: [{ book: 'Ephesians', startChapter: 5, endChapter: 5 }], summaryPrompt: "What mutual submission looks like?" },
    { dayNumber: 4, displayTitle: "A Cord of Three Strands", verseReferences: [{ book: 'Ecclesiastes', startChapter: 4, endChapter: 4 }], summaryPrompt: "Why is God essential in marriage?" },
    { dayNumber: 5, displayTitle: "Guard Your Heart", verseReferences: [{ book: 'Proverbs', startChapter: 4, endChapter: 4 }], summaryPrompt: "How do we protect our relationships?" },
    { dayNumber: 6, displayTitle: "Forgiveness in Marriage", verseReferences: [{ book: 'Colossians', startChapter: 3, endChapter: 3 }], summaryPrompt: "Why is forgiveness essential?" },
    { dayNumber: 7, displayTitle: "The Excellent Wife", verseReferences: [{ book: 'Proverbs', startChapter: 31, endChapter: 31 }], summaryPrompt: "What qualities build a strong marriage?" },
    { dayNumber: 8, displayTitle: "Train Up a Child", verseReferences: [{ book: 'Proverbs', startChapter: 22, endChapter: 22 }], summaryPrompt: "What is our responsibility as parents?" },
    { dayNumber: 9, displayTitle: "The Father's Instruction", verseReferences: [{ book: 'Proverbs', startChapter: 1, endChapter: 1 }], summaryPrompt: "How do we pass on wisdom?" },
    { dayNumber: 10, displayTitle: "Children Are a Blessing", verseReferences: [{ book: 'Psalms', startChapter: 127, endChapter: 128 }], summaryPrompt: "How does God view children?" },
    { dayNumber: 11, displayTitle: "Discipline with Love", verseReferences: [{ book: 'Hebrews', startChapter: 12, endChapter: 12 }], summaryPrompt: "What is the purpose of discipline?" },
    { dayNumber: 12, displayTitle: "Honor Your Parents", verseReferences: [{ book: 'Ephesians', startChapter: 6, endChapter: 6 }], summaryPrompt: "What does honoring parents look like?" },
    { dayNumber: 13, displayTitle: "Teaching Children", verseReferences: [{ book: 'Deuteronomy', startChapter: 6, endChapter: 6 }], summaryPrompt: "When and how do we teach our children?" },
    { dayNumber: 14, displayTitle: "A House Built on Rock", verseReferences: [{ book: 'Matthew', startChapter: 7, endChapter: 7 }], summaryPrompt: "What foundation is your home built on?" },
    { dayNumber: 15, displayTitle: "Speaking Life", verseReferences: [{ book: 'Proverbs', startChapter: 18, endChapter: 18 }], summaryPrompt: "How do words build or destroy?" },
    { dayNumber: 16, displayTitle: "Managing Conflict", verseReferences: [{ book: 'James', startChapter: 4, endChapter: 4 }], summaryPrompt: "What causes conflict and how do we resolve it?" },
    { dayNumber: 17, displayTitle: "Serving One Another", verseReferences: [{ book: 'Galatians', startChapter: 5, endChapter: 5 }], summaryPrompt: "How does service transform relationships?" },
    { dayNumber: 18, displayTitle: "Generosity in Family", verseReferences: [{ book: '2 Corinthians', startChapter: 9, endChapter: 9 }], summaryPrompt: "How do we model generosity at home?" },
    { dayNumber: 19, displayTitle: "Prayer for Family", verseReferences: [{ book: 'Job', startChapter: 1, endChapter: 1 }], summaryPrompt: "How did Job intercede for his family?" },
    { dayNumber: 20, displayTitle: "Legacy of Faith", verseReferences: [{ book: '2 Timothy', startChapter: 1, endChapter: 1 }], summaryPrompt: "What faith legacy are you leaving?" },
    { dayNumber: 21, displayTitle: "Choose This Day", verseReferences: [{ book: 'Joshua', startChapter: 24, endChapter: 24 }], summaryPrompt: "What commitment will your family make?" },
  ],
};

// ============================================================================
// 8. SPIRITUAL WARFARE (14 Days)
// Standing firm in faith
// ============================================================================

export const SPIRITUAL_WARFARE_PLAN: ReadingPlan = {
  id: 'spiritual-warfare-14',
  name: "Spiritual Warfare",
  description: "14 days learning to stand firm against spiritual attacks. Understand the battle and equip yourself with God's armor.",
  totalDays: 14,
  readings: [
    { dayNumber: 1, displayTitle: "The Real Enemy", verseReferences: [{ book: 'Ephesians', startChapter: 6, endChapter: 6 }], summaryPrompt: "Who is our real enemy?" },
    { dayNumber: 2, displayTitle: "Schemes of the Devil", verseReferences: [{ book: '2 Corinthians', startChapter: 2, endChapter: 2 }], summaryPrompt: "How does Satan attack believers?" },
    { dayNumber: 3, displayTitle: "Resist the Devil", verseReferences: [{ book: 'James', startChapter: 4, endChapter: 4 }], summaryPrompt: "How do we resist effectively?" },
    { dayNumber: 4, displayTitle: "The Belt of Truth", verseReferences: [{ book: 'John', startChapter: 8, endChapter: 8 }], summaryPrompt: "Why is truth essential for victory?" },
    { dayNumber: 5, displayTitle: "Breastplate of Righteousness", verseReferences: [{ book: 'Romans', startChapter: 3, endChapter: 3 }], summaryPrompt: "How does Christ's righteousness protect us?" },
    { dayNumber: 6, displayTitle: "Shoes of Peace", verseReferences: [{ book: 'Romans', startChapter: 10, endChapter: 10 }], summaryPrompt: "How does the Gospel give us sure footing?" },
    { dayNumber: 7, displayTitle: "Shield of Faith", verseReferences: [{ book: 'Hebrews', startChapter: 11, endChapter: 11 }], summaryPrompt: "How does faith extinguish doubt?" },
    { dayNumber: 8, displayTitle: "Helmet of Salvation", verseReferences: [{ book: 'Romans', startChapter: 8, endChapter: 8 }], summaryPrompt: "How does assurance of salvation protect your mind?" },
    { dayNumber: 9, displayTitle: "Sword of the Spirit", verseReferences: [{ book: 'Hebrews', startChapter: 4, endChapter: 4 }], summaryPrompt: "How do we wield God's Word?" },
    { dayNumber: 10, displayTitle: "The Power of Prayer", verseReferences: [{ book: 'Daniel', startChapter: 10, endChapter: 10 }], summaryPrompt: "What happens in the spiritual realm when we pray?" },
    { dayNumber: 11, displayTitle: "Victory in Christ", verseReferences: [{ book: 'Colossians', startChapter: 2, endChapter: 2 }], summaryPrompt: "How did Jesus defeat the enemy?" },
    { dayNumber: 12, displayTitle: "Authority of Believers", verseReferences: [{ book: 'Luke', startChapter: 10, endChapter: 10 }], summaryPrompt: "What authority has Jesus given us?" },
    { dayNumber: 13, displayTitle: "Standing Firm", verseReferences: [{ book: '1 Peter', startChapter: 5, endChapter: 5 }], summaryPrompt: "How do we stand firm in faith?" },
    { dayNumber: 14, displayTitle: "More Than Conquerors", verseReferences: [{ book: 'Revelation', startChapter: 12, endChapter: 12 }], summaryPrompt: "How do believers overcome?" },
  ],
};

// ============================================================================
// 9. FINDING PURPOSE (21 Days)
// Discovering God's will for your life
// ============================================================================

export const FINDING_PURPOSE_PLAN: ReadingPlan = {
  id: 'finding-purpose-21',
  name: "Finding Your Purpose",
  description: "21 days discovering God's unique purpose for your life. Learn to discern His will and walk confidently in your calling.",
  totalDays: 21,
  readings: [
    { dayNumber: 1, displayTitle: "Created for a Purpose", verseReferences: [{ book: 'Ephesians', startChapter: 2, endChapter: 2 }], summaryPrompt: "What were you created to do?" },
    { dayNumber: 2, displayTitle: "Plans to Prosper You", verseReferences: [{ book: 'Jeremiah', startChapter: 29, endChapter: 29 }], summaryPrompt: "What are God's intentions for you?" },
    { dayNumber: 3, displayTitle: "Gifts for Service", verseReferences: [{ book: 'Romans', startChapter: 12, endChapter: 12 }], summaryPrompt: "What gifts has God given you?" },
    { dayNumber: 4, displayTitle: "The Body of Christ", verseReferences: [{ book: '1 Corinthians', startChapter: 12, endChapter: 12 }], summaryPrompt: "Where do you fit in the body?" },
    { dayNumber: 5, displayTitle: "Seeking God's Will", verseReferences: [{ book: 'Proverbs', startChapter: 3, endChapter: 3 }], summaryPrompt: "How do we find God's direction?" },
    { dayNumber: 6, displayTitle: "Called to Follow", verseReferences: [{ book: 'Mark', startChapter: 1, endChapter: 1 }], summaryPrompt: "What did the disciples leave behind?" },
    { dayNumber: 7, displayTitle: "Moses' Calling", verseReferences: [{ book: 'Exodus', startChapter: 3, endChapter: 4 }], summaryPrompt: "How does God equip the called?" },
    { dayNumber: 8, displayTitle: "Esther's Moment", verseReferences: [{ book: 'Esther', startChapter: 4, endChapter: 4 }], summaryPrompt: "Are you positioned for such a time as this?" },
    { dayNumber: 9, displayTitle: "Paul's Transformation", verseReferences: [{ book: 'Galatians', startChapter: 1, endChapter: 1 }], summaryPrompt: "How did God redirect Paul's purpose?" },
    { dayNumber: 10, displayTitle: "The Great Commission", verseReferences: [{ book: 'Matthew', startChapter: 28, endChapter: 28 }], summaryPrompt: "What mission are we all called to?" },
    { dayNumber: 11, displayTitle: "Work as Worship", verseReferences: [{ book: 'Colossians', startChapter: 3, endChapter: 3 }], summaryPrompt: "How does work become worship?" },
    { dayNumber: 12, displayTitle: "Faithful in Little", verseReferences: [{ book: 'Luke', startChapter: 16, endChapter: 16 }], summaryPrompt: "Why does faithfulness in small things matter?" },
    { dayNumber: 13, displayTitle: "Running the Race", verseReferences: [{ book: 'Hebrews', startChapter: 12, endChapter: 12 }], summaryPrompt: "How do we run with endurance?" },
    { dayNumber: 14, displayTitle: "The Vine and Branches", verseReferences: [{ book: 'John', startChapter: 15, endChapter: 15 }], summaryPrompt: "What is the key to fruitfulness?" },
    { dayNumber: 15, displayTitle: "Salt and Light", verseReferences: [{ book: 'Matthew', startChapter: 5, endChapter: 5 }], summaryPrompt: "How do we influence the world?" },
    { dayNumber: 16, displayTitle: "Whatever You Do", verseReferences: [{ book: '1 Corinthians', startChapter: 10, endChapter: 10 }], summaryPrompt: "How does everything glorify God?" },
    { dayNumber: 17, displayTitle: "Gifted to Serve", verseReferences: [{ book: '1 Peter', startChapter: 4, endChapter: 4 }], summaryPrompt: "How do we steward our gifts?" },
    { dayNumber: 18, displayTitle: "Walking in Good Works", verseReferences: [{ book: 'Ephesians', startChapter: 2, endChapter: 2 }], summaryPrompt: "What works did God prepare for you?" },
    { dayNumber: 19, displayTitle: "Patience in Purpose", verseReferences: [{ book: 'Habakkuk', startChapter: 2, endChapter: 2 }], summaryPrompt: "How do we wait for God's timing?" },
    { dayNumber: 20, displayTitle: "Pressing On", verseReferences: [{ book: 'Philippians', startChapter: 3, endChapter: 3 }], summaryPrompt: "What keeps us moving forward?" },
    { dayNumber: 21, displayTitle: "Well Done, Good Servant", verseReferences: [{ book: 'Matthew', startChapter: 25, endChapter: 25 }], summaryPrompt: "What will matter at the end?" },
  ],
};

// ============================================================================
// 10. PRAYER LIFE (14 Days)
// Deepening your conversation with God
// ============================================================================

export const PRAYER_LIFE_PLAN: ReadingPlan = {
  id: 'prayer-life-14',
  name: "Deepening Your Prayer Life",
  description: "14 days learning to pray more effectively. Discover different types of prayer and develop a richer conversation with God.",
  totalDays: 14,
  readings: [
    { dayNumber: 1, displayTitle: "The Lord's Prayer", verseReferences: [{ book: 'Matthew', startChapter: 6, endChapter: 6 }], summaryPrompt: "What does Jesus' model prayer teach us?" },
    { dayNumber: 2, displayTitle: "Hannah's Prayer", verseReferences: [{ book: '1 Samuel', startChapter: 1, endChapter: 2 }], summaryPrompt: "How did Hannah pour out her heart?" },
    { dayNumber: 3, displayTitle: "Solomon's Prayer", verseReferences: [{ book: '1 Kings', startChapter: 8, endChapter: 8 }], summaryPrompt: "What did Solomon prioritize in prayer?" },
    { dayNumber: 4, displayTitle: "Daniel's Prayer", verseReferences: [{ book: 'Daniel', startChapter: 9, endChapter: 9 }], summaryPrompt: "What made Daniel's prayer powerful?" },
    { dayNumber: 5, displayTitle: "Jesus in Gethsemane", verseReferences: [{ book: 'Matthew', startChapter: 26, endChapter: 26 }], summaryPrompt: "How did Jesus pray in anguish?" },
    { dayNumber: 6, displayTitle: "Pray Without Ceasing", verseReferences: [{ book: '1 Thessalonians', startChapter: 5, endChapter: 5 }], summaryPrompt: "What does continual prayer look like?" },
    { dayNumber: 7, displayTitle: "The Prayer of Faith", verseReferences: [{ book: 'James', startChapter: 5, endChapter: 5 }], summaryPrompt: "What is the prayer of faith?" },
    { dayNumber: 8, displayTitle: "Praying in the Spirit", verseReferences: [{ book: 'Romans', startChapter: 8, endChapter: 8 }], summaryPrompt: "How does the Spirit help us pray?" },
    { dayNumber: 9, displayTitle: "Bold Access", verseReferences: [{ book: 'Hebrews', startChapter: 4, endChapter: 4 }], summaryPrompt: "Why can we approach God boldly?" },
    { dayNumber: 10, displayTitle: "Ask, Seek, Knock", verseReferences: [{ book: 'Matthew', startChapter: 7, endChapter: 7 }], summaryPrompt: "What promises does Jesus make about prayer?" },
    { dayNumber: 11, displayTitle: "Praying for Others", verseReferences: [{ book: 'Ephesians', startChapter: 1, endChapter: 1 }], summaryPrompt: "How did Paul pray for believers?" },
    { dayNumber: 12, displayTitle: "Praying for Enemies", verseReferences: [{ book: 'Matthew', startChapter: 5, endChapter: 5 }], summaryPrompt: "How do we pray for those who hurt us?" },
    { dayNumber: 13, displayTitle: "Corporate Prayer", verseReferences: [{ book: 'Acts', startChapter: 4, endChapter: 4 }], summaryPrompt: "What happens when believers pray together?" },
    { dayNumber: 14, displayTitle: "Worship & Prayer", verseReferences: [{ book: 'Psalms', startChapter: 100, endChapter: 100 }], summaryPrompt: "How does worship enrich prayer?" },
  ],
};

// ============================================================================
// EXPORT ALL PLANS
// ============================================================================

export const CURATED_READING_PLANS: ReadingPlan[] = [
  NEW_BELIEVERS_PLAN,
  PSALMS_PROVERBS_PLAN,
  GOSPELS_PLAN,
  WOMEN_OF_BIBLE_PLAN,
  MEN_OF_BIBLE_PLAN,
  ANXIETY_PLAN,
  MARRIAGE_FAMILY_PLAN,
  SPIRITUAL_WARFARE_PLAN,
  FINDING_PURPOSE_PLAN,
  PRAYER_LIFE_PLAN,
];

export default CURATED_READING_PLANS;
