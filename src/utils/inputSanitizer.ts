/**
 * Input Sanitization Utilities
 *
 * Prevents injection attacks and enforces safe input boundaries
 * across search, chat, and general user input.
 */

/** Dangerous patterns: script tags, SQL keywords used in injection, etc. */
const DANGEROUS_PATTERNS = /(<\s*script[^>]*>|<\/script>|javascript:|on\w+\s*=|union\s+select|drop\s+table|insert\s+into|delete\s+from|--\s|;\s*drop|;\s*delete)/gi;

/** Strip HTML tags */
const HTML_TAG = /<[^>]*>/g;

/** Control characters (except newline/tab for chat) */
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Core sanitization shared by all sanitizers.
 * - Trims whitespace
 * - Removes control characters
 * - Strips HTML tags
 * - Removes dangerous patterns
 * - Enforces max length
 */
function sanitizeCore(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(CONTROL_CHARS, '')
    .replace(HTML_TAG, '')
    .replace(DANGEROUS_PATTERNS, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize a Bible / verse search query.
 * Max 500 characters. Strips anything that isn't alphanumeric,
 * spaces, basic punctuation, or Bible-reference characters (: , -).
 */
export function sanitizeSearchQuery(input: string): string {
  const cleaned = sanitizeCore(input, 500);
  // Allow letters, numbers, spaces, colons, hyphens, commas, periods, apostrophes, quotes
  return cleaned.replace(/[^a-zA-Z0-9\s:,.\-'"?!]/g, '');
}

/**
 * General-purpose user input sanitization.
 * Max 1000 characters. Preserves most readable text.
 */
export function sanitizeUserInput(input: string): string {
  return sanitizeCore(input, 1000);
}

/**
 * Sanitize a chat message before sending to the companion API.
 * Max 2000 characters. Preserves newlines for multi-line messages.
 */
export function sanitizeChatMessage(input: string): string {
  return sanitizeCore(input, 2000);
}
