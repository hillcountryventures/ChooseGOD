/**
 * InlineVerseText Component
 * Renders text with automatically detected verse references as tappable links
 * Also supports basic markdown formatting (bold and italic)
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
  type: 'text' | 'verse' | 'bold' | 'italic' | 'bolditalic';
  content: string;
  reference?: DetectedReference;
}

/**
 * Parse basic markdown (bold and italic) into segments
 */
function parseMarkdown(text: string): Array<{ type: 'text' | 'bold' | 'italic' | 'bolditalic'; content: string }> {
  const segments: Array<{ type: 'text' | 'bold' | 'italic' | 'bolditalic'; content: string }> = [];

  // Regex patterns for markdown
  // Match ***text*** or ___text___ (bold+italic)
  // Match **text** or __text__ (bold)
  // Match *text* or _text_ (italic) - but not inside words
  const pattern = /(\*\*\*(.+?)\*\*\*|___(.+?)___|(?<!\w)\*\*(.+?)\*\*(?!\w)|(?<!\w)__(.+?)__(?!\w)|(?<!\w)\*(.+?)\*(?!\w)|(?<!\w)_(.+?)_(?!\w))/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    // Determine the type based on which group matched
    const fullMatch = match[0];
    let content = '';
    let type: 'bold' | 'italic' | 'bolditalic' = 'text' as any;

    if (match[2] || match[3]) {
      // ***text*** or ___text___
      content = match[2] || match[3];
      type = 'bolditalic';
    } else if (match[4] || match[5]) {
      // **text** or __text__
      content = match[4] || match[5];
      type = 'bold';
    } else if (match[6] || match[7]) {
      // *text* or _text_
      content = match[6] || match[7];
      type = 'italic';
    }

    if (content) {
      segments.push({ type, content });
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
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

/**
 * Render a text segment with markdown formatting
 */
function renderMarkdownSegment(
  content: string,
  index: number,
  baseStyle?: TextStyle
): React.ReactNode {
  const mdSegments = parseMarkdown(content);

  if (mdSegments.length === 1 && mdSegments[0].type === 'text') {
    return <Text key={index}>{content}</Text>;
  }

  return (
    <Text key={index}>
      {mdSegments.map((seg, i) => {
        switch (seg.type) {
          case 'bold':
            return <Text key={i} style={styles.bold}>{seg.content}</Text>;
          case 'italic':
            return <Text key={i} style={styles.italic}>{seg.content}</Text>;
          case 'bolditalic':
            return <Text key={i} style={styles.boldItalic}>{seg.content}</Text>;
          default:
            return <Text key={i}>{seg.content}</Text>;
        }
      })}
    </Text>
  );
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

  // If no verse references found, render text with markdown
  if (references.length === 0) {
    const mdSegments = parseMarkdown(text);
    return (
      <Text style={style} numberOfLines={numberOfLines} selectable={selectable}>
        {mdSegments.map((seg, i) => {
          switch (seg.type) {
            case 'bold':
              return <Text key={i} style={styles.bold}>{seg.content}</Text>;
            case 'italic':
              return <Text key={i} style={styles.italic}>{seg.content}</Text>;
            case 'bolditalic':
              return <Text key={i} style={styles.boldItalic}>{seg.content}</Text>;
            default:
              return <Text key={i}>{seg.content}</Text>;
          }
        })}
      </Text>
    );
  }

  // Render text with tappable verse references and markdown
  return (
    <Text style={style} numberOfLines={numberOfLines} selectable={selectable}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          // Render text segment with markdown parsing
          return renderMarkdownSegment(segment.content, index, style);
        }

        // Verse reference - make it tappable (bold by default for visibility)
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
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  boldItalic: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
});

export default InlineVerseText;
