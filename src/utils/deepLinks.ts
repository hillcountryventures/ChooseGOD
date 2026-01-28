/**
 * Deep Link Utilities for ChooseGOD
 *
 * Generates and parses deep links for verse sharing and referrals.
 * Supports both universal links (https://choosegod.app/...) and
 * custom scheme (choosegod://...).
 */

const BASE_URL = 'https://choosegod.app';
const SCHEME = 'choosegod';

// --- Route types ---

export interface VerseRoute {
  type: 'verse';
  book: string;
  chapter: number;
  verse: number;
}

export interface ReferralRoute {
  type: 'referral';
  code: string;
}

export interface UnknownRoute {
  type: 'unknown';
  path: string;
}

export type DeepLinkRoute = VerseRoute | ReferralRoute | UnknownRoute;

// --- Generators ---

/**
 * Generate a shareable verse link.
 * e.g. https://choosegod.app/verse/John/3/16
 */
export function generateVerseLink(book: string, chapter: number, verse: number): string {
  const encodedBook = encodeURIComponent(book);
  return `${BASE_URL}/verse/${encodedBook}/${chapter}/${verse}`;
}

/**
 * Generate a referral invite link.
 * e.g. https://choosegod.app/refer/CG1A2B3C
 */
export function generateReferralLink(code: string): string {
  return `${BASE_URL}/refer/${encodeURIComponent(code)}`;
}

// --- Parser ---

/**
 * Parse an incoming deep link URL into a route object.
 * Handles both universal links and custom-scheme links.
 *
 * Supported patterns:
 *   /verse/:book/:chapter/:verse
 *   /refer/:code   (also /invite/:code for legacy compat)
 */
export function parseDeepLink(url: string): DeepLinkRoute {
  try {
    // Normalise custom scheme to something URL-parsable
    const normalised = url.startsWith(`${SCHEME}://`)
      ? url.replace(`${SCHEME}://`, `${BASE_URL}/`)
      : url;

    const parsed = new URL(normalised);
    const segments = parsed.pathname.split('/').filter(Boolean);

    // /verse/:book/:chapter/:verse
    if (segments[0] === 'verse' && segments.length >= 4) {
      const book = decodeURIComponent(segments[1]);
      const chapter = parseInt(segments[2], 10);
      const verse = parseInt(segments[3], 10);

      if (!isNaN(chapter) && !isNaN(verse)) {
        return { type: 'verse', book, chapter, verse };
      }
    }

    // /refer/:code  or  /invite/:code
    if ((segments[0] === 'refer' || segments[0] === 'invite') && segments[1]) {
      return { type: 'referral', code: decodeURIComponent(segments[1]) };
    }

    return { type: 'unknown', path: parsed.pathname };
  } catch {
    return { type: 'unknown', path: url };
  }
}
