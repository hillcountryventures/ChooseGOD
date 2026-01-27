/**
 * Bible Screen Constants
 * 
 * Shared constants for highlight colors, AI actions, and utilities.
 */

import { HighlightColor } from '../../types';

// Highlight color options
export const HIGHLIGHT_COLORS: { color: HighlightColor; hex: string }[] = [
  { color: 'yellow', hex: '#FEF08A' },
  { color: 'green', hex: '#BBF7D0' },
  { color: 'blue', hex: '#BFDBFE' },
  { color: 'pink', hex: '#FBCFE8' },
  { color: 'purple', hex: '#DDD6FE' },
  { color: 'orange', hex: '#FED7AA' },
];

// AI Quick Action options for verse context
export const AI_QUICK_ACTIONS = [
  {
    id: 'explain',
    icon: 'book-outline' as const,
    label: 'Explain this verse',
    getPrompt: (ref: string, _text: string) =>
      `Explain ${ref} in simple terms. What is the main message?`,
  },
  {
    id: 'context',
    icon: 'time-outline' as const,
    label: 'Historical context',
    getPrompt: (ref: string, _text: string) =>
      `What is the historical and cultural context of ${ref}? Who wrote it, when, and to whom?`,
  },
  {
    id: 'apply',
    icon: 'bulb-outline' as const,
    label: 'How to apply it',
    getPrompt: (ref: string, text: string) =>
      `How can I apply ${ref} - "${text}" to my life today? Give practical examples.`,
  },
  {
    id: 'cross-ref',
    icon: 'git-branch-outline' as const,
    label: 'Cross-references',
    getPrompt: (ref: string, _text: string) =>
      `What other Bible verses relate to ${ref}? Show me connections across Scripture.`,
  },
];

export type AIQuickAction = typeof AI_QUICK_ACTIONS[number];

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Get highlight background color with opacity
export const getHighlightBg = (color?: HighlightColor): string => {
  if (!color) return 'transparent';
  const colorMap: Record<HighlightColor, string> = {
    yellow: 'rgba(254, 240, 138, 0.35)',
    green: 'rgba(187, 247, 208, 0.35)',
    blue: 'rgba(191, 219, 254, 0.35)',
    pink: 'rgba(251, 207, 232, 0.35)',
    purple: 'rgba(221, 214, 254, 0.35)',
    orange: 'rgba(254, 215, 170, 0.35)',
  };
  return colorMap[color];
};

// Generate verse key for annotations
export const getVerseKey = (book: string, chapter: number, verse: number): string =>
  `${book}-${chapter}-${verse}`;
