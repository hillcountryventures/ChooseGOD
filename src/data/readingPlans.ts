/**
 * 365-Day Canon Order Bible Reading Plan
 *
 * This plan covers the entire Bible in canonical order over 365 days.
 * Approximately 3-4 chapters per day (1,189 total chapters / 365 days ≈ 3.26 chapters/day)
 */

export interface DailyReading {
  dayNumber: number;
  displayTitle: string;
  verseReferences: {
    book: string;
    startChapter: number;
    endChapter: number;
  }[];
  summaryPrompt: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  readings: DailyReading[];
}

// Book chapter counts for reference
export const BOOK_CHAPTERS: Record<string, number> = {
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

// Helper to format display title
function formatDisplayTitle(
  refs: { book: string; startChapter: number; endChapter: number }[]
): string {
  return refs
    .map((ref) => {
      if (ref.startChapter === ref.endChapter) {
        return `${ref.book} ${ref.startChapter}`;
      }
      return `${ref.book} ${ref.startChapter}-${ref.endChapter}`;
    })
    .join(', ');
}

// Helper to generate AI summary prompt for a reading
function generateSummaryPrompt(
  refs: { book: string; startChapter: number; endChapter: number }[]
): string {
  const books = refs.map((r) => r.book).join(', ');
  return `Provide a concise spiritual summary of ${formatDisplayTitle(refs)}. Highlight key themes, God's character revealed, and practical application for daily life.`;
}

// Generate the 365-day canonical reading plan
function generateCanonicalPlan(): DailyReading[] {
  const readings: DailyReading[] = [];
  const books = Object.keys(BOOK_CHAPTERS);

  let currentBookIndex = 0;
  let currentChapter = 1;
  let dayNumber = 1;

  while (dayNumber <= 365 && currentBookIndex < books.length) {
    const refs: { book: string; startChapter: number; endChapter: number }[] =
      [];
    let chaptersToday = 0;
    const targetChapters = dayNumber <= 360 ? 3 : 4; // Slightly more chapters at end to finish

    while (
      chaptersToday < targetChapters &&
      currentBookIndex < books.length
    ) {
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
        dayNumber,
        displayTitle: formatDisplayTitle(refs),
        verseReferences: refs,
        summaryPrompt: generateSummaryPrompt(refs),
      });
    }

    dayNumber++;
  }

  // If we finished before day 365, pad with Psalms/Proverbs readings
  while (readings.length < 365) {
    const day = readings.length + 1;
    const psalmDay = ((day - 1) % 150) + 1;
    readings.push({
      dayNumber: day,
      displayTitle: `Psalms ${psalmDay}`,
      verseReferences: [{ book: 'Psalms', startChapter: psalmDay, endChapter: psalmDay }],
      summaryPrompt: `Provide a reflective summary of Psalm ${psalmDay}, focusing on its worship themes and personal application.`,
    });
  }

  return readings;
}

export const CANONICAL_READING_PLAN: ReadingPlan = {
  id: 'canonical-365',
  name: 'Canon Order Bible Reading',
  description:
    'Read through the entire Bible in one year, following the canonical order from Genesis to Revelation. Perfect for understanding the grand narrative of Scripture.',
  totalDays: 365,
  readings: generateCanonicalPlan(),
};

// Alternative chronological plan metadata (readings would be generated separately)
export const CHRONOLOGICAL_PLAN_META = {
  id: 'chronological-365',
  name: 'Chronological Bible Reading',
  description:
    'Read the Bible in the order events occurred, weaving together Old Testament history, prophets, and poetry for deeper historical context.',
  totalDays: 365,
};

// Gospels & Letters plan for new believers
export const GOSPELS_FIRST_PLAN_META = {
  id: 'gospels-first-90',
  name: 'Gospels & Letters',
  description:
    'Start with Jesus! A 90-day plan covering the Gospels, Acts, and key epistles. Perfect for new believers or those wanting to focus on Christ.',
  totalDays: 90,
};

// Export all plan metadata for UI selection
export const AVAILABLE_PLANS = [
  {
    id: CANONICAL_READING_PLAN.id,
    name: CANONICAL_READING_PLAN.name,
    description: CANONICAL_READING_PLAN.description,
    totalDays: CANONICAL_READING_PLAN.totalDays,
    isAvailable: true,
  },
  {
    ...CHRONOLOGICAL_PLAN_META,
    isAvailable: false, // Coming soon
  },
  {
    ...GOSPELS_FIRST_PLAN_META,
    isAvailable: false, // Coming soon
  },
];
