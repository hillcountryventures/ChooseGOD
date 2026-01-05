/**
 * TappableVerse Component
 * A verse reference that users can tap to navigate to the Bible reader
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This component makes it effortless to jump to any Scripture reference
 */

import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { parseReference, formatReference, ParsedVerse } from '../lib/verseParser';
import { navigateToBibleVerse } from '../lib/navigationHelpers';

interface TappableVerseProps {
  /**
   * The verse reference string (e.g., "John 3:16", "Romans 8:28-30")
   */
  reference: string;

  /**
   * Optional custom display text (defaults to the reference)
   */
  displayText?: string;

  /**
   * Show an arrow icon after the reference
   */
  showArrow?: boolean;

  /**
   * Visual style variant
   */
  variant?: 'default' | 'compact' | 'card' | 'inline';

  /**
   * Custom text style
   */
  textStyle?: TextStyle;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Callback when the verse is pressed (in addition to navigation)
   */
  onPress?: (parsed: ParsedVerse) => void;

  /**
   * If true, only calls onPress without navigating
   */
  preventNavigation?: boolean;
}

export function TappableVerse({
  reference,
  displayText,
  showArrow = false,
  variant = 'default',
  textStyle,
  style,
  onPress,
  preventNavigation = false,
}: TappableVerseProps) {
  const navigation = useNavigation();

  const parsed = parseReference(reference);

  // If we can't parse the reference, render as plain text
  if (!parsed) {
    return (
      <Text style={[styles.plainText, textStyle]}>
        {displayText || reference}
      </Text>
    );
  }

  const handlePress = () => {
    // Call custom handler if provided
    if (onPress) {
      onPress(parsed);
    }

    // Navigate unless prevented
    if (!preventNavigation) {
      navigateToBibleVerse(navigation, parsed.book, parsed.chapter, parsed.verse);
    }
  };

  const displayRef = displayText || formatReference(parsed);

  // Variant styles
  const variantStyles = {
    default: {
      container: styles.defaultContainer,
      text: styles.defaultText,
    },
    compact: {
      container: styles.compactContainer,
      text: styles.compactText,
    },
    card: {
      container: styles.cardContainer,
      text: styles.cardText,
    },
    inline: {
      container: styles.inlineContainer,
      text: styles.inlineText,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[currentVariant.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="link"
      accessibilityLabel={`Go to ${displayRef}`}
      accessibilityHint="Opens this verse in the Bible reader"
    >
      <Text style={[currentVariant.text, textStyle]}>
        {displayRef}
      </Text>
      {showArrow && (
        <Ionicons
          name="arrow-forward"
          size={variant === 'compact' ? 12 : 14}
          color={theme.colors.primary}
          style={styles.arrow}
        />
      )}
    </TouchableOpacity>
  );
}

/**
 * Simpler version that just renders the text with tap handling
 * Use this when you want to inline a verse ref in a paragraph
 */
export function TappableVerseText({
  reference,
  style,
}: {
  reference: string;
  style?: TextStyle;
}) {
  const navigation = useNavigation();
  const parsed = parseReference(reference);

  if (!parsed) {
    return <Text style={style}>{reference}</Text>;
  }

  const handlePress = () => {
    navigateToBibleVerse(navigation, parsed.book, parsed.chapter, parsed.verse);
  };

  return (
    <Text
      style={[styles.inlineText, style]}
      onPress={handlePress}
      accessibilityRole="link"
    >
      {formatReference(parsed)}
    </Text>
  );
}

const styles = StyleSheet.create({
  // Plain text fallback
  plainText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },

  // Default variant - pill style
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },

  // Compact variant - minimal style
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },

  // Card variant - for verse cards in chat
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },

  // Inline variant - for use within text
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },

  // Arrow icon
  arrow: {
    marginLeft: theme.spacing.xs,
  },
});

export default TappableVerse;
