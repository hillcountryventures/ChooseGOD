/**
 * RichBibleText - Scripture-forward text rendering
 *
 * Automatically detects Bible references in text and makes them:
 * - Visually distinct (bold, branded color)
 * - Tappable (opens verse quick view)
 *
 * Supports formats:
 * - John 3:16
 * - 1 Corinthians 13:4-7
 * - Genesis 1:1
 * - Psalm 23:1-6
 * - 2 Timothy 3:16
 */

import React, { useMemo } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../../lib/theme';

// Comprehensive Bible reference regex
// Matches: "John 3:16", "1 Corinthians 13:4-7", "Psalm 23", "Genesis 1:1-3"
const BIBLE_REF_REGEX = /\b((?:[1-3]\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|(?:[1-2]\s+)?Samuel|(?:[1-2]\s+)?Kings|(?:[1-2]\s+)?Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s+of\s+Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|(?:[1-2]\s+)?Corinthians|Galatians|Ephesians|Philippians|Colossians|(?:[1-2]\s+)?Thessalonians|(?:[1-2]\s+)?Timothy|Titus|Philemon|Hebrews|James|(?:[1-2]\s+)?Peter|(?:[1-3]\s+)?John|Jude|Revelation))\s+(\d+)(?::(\d+)(?:-(\d+))?)?/gi;

// Simplified version for common cases
const SIMPLE_REF_REGEX = /\b([1-3]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?\b/g;

interface ParsedReference {
  fullMatch: string;
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  startIndex: number;
  endIndex: number;
}

interface RichBibleTextProps {
  content: string;
  onVersePress?: (reference: ParsedReference) => void;
  baseStyle?: TextStyle;
  verseStyle?: TextStyle;
}

// Parse all Bible references from text
function parseReferences(text: string): ParsedReference[] {
  const references: ParsedReference[] = [];
  let match: RegExpExecArray | null;

  // Reset regex
  BIBLE_REF_REGEX.lastIndex = 0;

  while ((match = BIBLE_REF_REGEX.exec(text)) !== null) {
    references.push({
      fullMatch: match[0],
      book: match[1].trim(),
      chapter: parseInt(match[2], 10),
      verseStart: match[3] ? parseInt(match[3], 10) : undefined,
      verseEnd: match[4] ? parseInt(match[4], 10) : undefined,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return references;
}

export function RichBibleText({
  content,
  onVersePress,
  baseStyle,
  verseStyle,
}: RichBibleTextProps) {
  // Parse references and build text segments
  const segments = useMemo(() => {
    const refs = parseReferences(content);

    if (refs.length === 0) {
      return [{ type: 'text' as const, content }];
    }

    const result: Array<
      | { type: 'text'; content: string }
      | { type: 'verse'; content: string; reference: ParsedReference }
    > = [];

    let lastIndex = 0;

    refs.forEach((ref) => {
      // Add text before this reference
      if (ref.startIndex > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, ref.startIndex),
        });
      }

      // Add the reference
      result.push({
        type: 'verse',
        content: ref.fullMatch,
        reference: ref,
      });

      lastIndex = ref.endIndex;
    });

    // Add remaining text after last reference
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return result;
  }, [content]);

  return (
    <Text style={[styles.baseText, baseStyle]}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Text key={index}>{segment.content}</Text>;
        }

        // Verse reference - make tappable
        return (
          <Text
            key={index}
            style={[styles.verseLink, verseStyle]}
            onPress={() => onVersePress?.(segment.reference)}
            suppressHighlighting={false}
          >
            {segment.content}
          </Text>
        );
      })}
    </Text>
  );
}

// Export utility function for use elsewhere
export function extractReferences(text: string): ParsedReference[] {
  return parseReferences(text);
}

// Format a reference for display
export function formatReference(ref: ParsedReference): string {
  let result = `${ref.book} ${ref.chapter}`;
  if (ref.verseStart !== undefined) {
    result += `:${ref.verseStart}`;
    if (ref.verseEnd !== undefined && ref.verseEnd !== ref.verseStart) {
      result += `-${ref.verseEnd}`;
    }
  }
  return result;
}

const styles = StyleSheet.create({
  baseText: {
    fontSize: theme.fontSize.md,
    lineHeight: theme.fontSize.md * 1.6,
    color: theme.colors.text,
  },
  verseLink: {
    color: theme.colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: theme.colors.primaryAlpha[30],
  },
});
