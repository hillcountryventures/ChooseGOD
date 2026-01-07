/**
 * Navigation Helpers
 * Consistent navigation utilities for the ChooseGOD app
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * These helpers make it easy to navigate users to Scripture from anywhere
 */

import { CommonActions } from '@react-navigation/native';
import { parseReference, ParsedVerse } from './verseParser';
import type { ChatMode } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNavigation = any;

/**
 * Navigate to a specific Bible verse
 * Can be called from anywhere in the app to open the Bible reader
 */
export function navigateToBibleVerse(
  navigation: AnyNavigation,
  book: string,
  chapter: number,
  verse?: number
): void {
  navigation.navigate('Bible', {
    book,
    chapter,
    verse,
  });
}

/**
 * Navigate to Bible using a reference string like "John 3:16"
 * Parses the reference and navigates to the correct location
 */
export function navigateToBibleReference(
  navigation: AnyNavigation,
  reference: string
): boolean {
  const parsed = parseReference(reference);
  if (!parsed) {
    console.warn(`Could not parse verse reference: ${reference}`);
    return false;
  }

  navigateToBibleVerse(navigation, parsed.book, parsed.chapter, parsed.verse);
  return true;
}

/**
 * Navigate to Bible using a ParsedVerse object
 */
export function navigateToParsedVerse(
  navigation: AnyNavigation,
  parsed: ParsedVerse
): void {
  navigateToBibleVerse(navigation, parsed.book, parsed.chapter, parsed.verse);
}

/**
 * @deprecated Use useStore().setChatSheetOpen(true) and setCurrentMode() instead
 * The Ask tab has been replaced with a Chat FAB and bottom sheet
 */
export function navigateToAskMode(
  _navigation: AnyNavigation,
  _mode: ChatMode,
  _initialMessage?: string
): void {
  console.warn('navigateToAskMode is deprecated. Use the Chat FAB instead.');
}

/**
 * @deprecated Use useStore().setChatSheetOpen(true) instead
 * The Ask tab has been replaced with a Chat FAB and bottom sheet
 */
export function askAboutVerse(
  _navigation: AnyNavigation,
  _reference: string,
  _question?: string
): void {
  console.warn('askAboutVerse is deprecated. Use the Chat FAB instead.');
}

/**
 * Navigate to the reflection modal for a verse
 */
export function openReflectionModal(
  navigation: AnyNavigation,
  verse: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  },
  reference: string
): void {
  navigation.navigate('ReflectionModal', {
    verse,
    reference,
  });
}

/**
 * Navigate to Journal Compose screen
 * Can optionally pass a verse to attach to the entry
 */
export function openJournalCompose(
  navigation: AnyNavigation,
  options?: {
    verse?: {
      book: string;
      chapter: number;
      verse: number;
      text: string;
      translation: string;
    };
    prompt?: string;
    source?: {
      type: 'standalone' | 'verse_reflection' | 'devotional' | 'ai_prompt' | 'bible_reading';
      referenceId?: string;
    };
  }
): void {
  navigation.navigate('JournalCompose', {
    initialVerse: options?.verse,
    initialPrompt: options?.prompt,
    source: options?.source,
  });
}

/**
 * Navigate to Journal Detail screen for a specific moment
 */
export function openJournalDetail(
  navigation: AnyNavigation,
  momentId: string,
  editMode?: boolean
): void {
  navigation.navigate('JournalDetail', { momentId, editMode });
}

/**
 * Navigate to Proverbs for the day
 */
export function navigateToProverbsOfDay(navigation: AnyNavigation): void {
  const dayOfMonth = new Date().getDate();
  const chapter = Math.min(dayOfMonth, 31); // Proverbs has 31 chapters
  navigateToBibleVerse(navigation, 'Proverbs', chapter);
}

/**
 * Open the ChatHub screen for "Ask the Bible" interactions
 * Can optionally pass context verse and initial message
 */
export function openChatHub(
  navigation: AnyNavigation,
  options?: {
    contextVerse?: {
      book: string;
      chapter: number;
      verse: number;
      text: string;
      translation: string;
    };
    contextMode?: ChatMode;
    initialMessage?: string;
  }
): void {
  navigation.navigate('ChatHub', {
    contextVerse: options?.contextVerse,
    contextMode: options?.contextMode,
    initialMessage: options?.initialMessage,
  });
}

/**
 * Navigate to Journey tab
 */
export function navigateToJourney(navigation: AnyNavigation): void {
  navigation.navigate('Journey');
}

/**
 * Navigate to Settings
 */
export function navigateToSettings(navigation: AnyNavigation): void {
  navigation.navigate('Settings');
}

/**
 * Navigate to Home tab
 */
export function navigateToHome(navigation: AnyNavigation): void {
  navigation.navigate('Home');
}

/**
 * Navigate to Devotionals
 */
export function navigateToDevotionals(navigation: AnyNavigation): void {
  navigation.navigate('Devotionals', { screen: 'DevotionalHub' });
}

/**
 * Reset navigation to main tabs
 * Useful after auth flows or deep links
 */
export function resetToMain(navigation: AnyNavigation): void {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    })
  );
}

/**
 * Hook-friendly verse press handler creator
 * Returns a function that can be passed directly to onPress
 */
export function createVerseNavHandler(
  navigation: AnyNavigation,
  book: string,
  chapter: number,
  verse?: number
) {
  return () => navigateToBibleVerse(navigation, book, chapter, verse);
}

/**
 * Creates a handler for tapping on a reference string
 */
export function createReferenceNavHandler(
  navigation: AnyNavigation,
  reference: string
) {
  return () => navigateToBibleReference(navigation, reference);
}

/**
 * Format a verse location for display
 */
export function formatVerseLocation(
  book: string,
  chapter: number,
  verse?: number,
  endVerse?: number
): string {
  let location = `${book} ${chapter}`;
  if (verse !== undefined) {
    location += `:${verse}`;
    if (endVerse !== undefined && endVerse !== verse) {
      location += `-${endVerse}`;
    }
  }
  return location;
}
