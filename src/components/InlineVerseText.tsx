/**
 * InlineVerseText Component
 * Renders text with automatically detected verse references as tappable links
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Any mention of Scripture becomes a doorway back to God's Word
 */

import React, { useMemo } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../lib/theme';
import { detectReferences, DetectedReference } from '../lib/verseParser';
import { navigateToBibleVerse } from '../lib/navigationHelpers';

interface InlineVerseTextProps {
  /**
   * The text that may contain verse references
   */
  text: string;

  /**
   * Style for regular (non-verse) text
   */
  style?: TextStyle;

  /**
   * Style for verse reference links
   */
  verseStyle?: TextStyle;

  /**
   * Number of lines to display (truncation)
   */
  numberOfLines?: number;

  /**
   * Whether verse refs should be selectable/copyable
   */
  selectable?: boolean;

  /**
   * Callback when any verse is pressed (in addition to navigation)
   */
  onVersePress?: (reference: string, parsed: DetectedReference['parsed']) => void;
}

interface TextSegment {
  type: 'text' | 'verse';
  content: string;
  reference?: DetectedReference;
}

/**
 * Splits text into segments of regular text and verse references
 */
function segmentText(text: string, references: DetectedReference[]): TextSegment[] {
  if (references.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  // Sort references by start position
  const sortedRefs = [...references].sort((a, b) => a.start - b.start);

  for (const ref of sortedRefs) {
    // Add text before this reference
    if (ref.start > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, ref.start),
      });
    }

    // Add the verse reference
    segments.push({
      type: 'verse',
      content: ref.reference,
      reference: ref,
    });

    lastIndex = ref.end;
  }

  // Add remaining text after last reference
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

export function InlineVerseText({
  text,
  style,
  verseStyle,
  numberOfLines,
  selectable = false,
  onVersePress,
}: InlineVerseTextProps) {
  const navigation = useNavigation();

  // Detect verse references in the text
  const references = useMemo(() => detectReferences(text), [text]);

  // Segment the text
  const segments = useMemo(
    () => segmentText(text, references),
    [text, references]
  );

  // Handler for verse press
  const handleVersePress = (ref: DetectedReference) => {
    // Navigate to the verse
    navigateToBibleVerse(
      navigation,
      ref.parsed.book,
      ref.parsed.chapter,
      ref.parsed.verse
    );

    // Call custom handler if provided
    if (onVersePress) {
      onVersePress(ref.reference, ref.parsed);
    }
  };

  // If no verse references found, render simple text
  if (references.length === 0) {
    return (
      <Text style={style} numberOfLines={numberOfLines} selectable={selectable}>
        {text}
      </Text>
    );
  }

  // Render text with tappable verse references
  return (
    <Text style={style} numberOfLines={numberOfLines} selectable={selectable}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Text key={index}>{segment.content}</Text>;
        }

        // Verse reference - make it tappable
        return (
          <Text
            key={index}
            style={[styles.verseLink, verseStyle]}
            onPress={() => handleVersePress(segment.reference!)}
            accessibilityRole="link"
            accessibilityLabel={`Go to ${segment.content}`}
          >
            {segment.content}
          </Text>
        );
      })}
    </Text>
  );
}

/**
 * Simplified version that just highlights verses without making them tappable
 * Use this for read-only contexts
 */
export function HighlightedVerseText({
  text,
  style,
  verseStyle,
  numberOfLines,
}: Omit<InlineVerseTextProps, 'onVersePress' | 'selectable'>) {
  const references = useMemo(() => detectReferences(text), [text]);
  const segments = useMemo(
    () => segmentText(text, references),
    [text, references]
  );

  if (references.length === 0) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Text key={index}>{segment.content}</Text>;
        }

        return (
          <Text key={index} style={[styles.verseHighlight, verseStyle]}>
            {segment.content}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  verseLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  verseHighlight: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default InlineVerseText;
