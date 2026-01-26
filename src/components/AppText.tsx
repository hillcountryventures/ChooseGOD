/**
 * AppText - Reusable Text Component with Proper Wrapping
 *
 * Fixes text truncation issues app-wide by ensuring proper text wrapping
 * and preventing ellipsis on content that should display fully.
 *
 * Usage:
 * - Use for any content text that should wrap naturally
 * - For verse text, devotional content, reflection questions, etc.
 * - Automatically prevents truncation with numberOfLines={0}
 */

import React, { forwardRef } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface AppTextProps extends TextProps {
  /** Allow limiting lines if needed (default: 0 = unlimited) */
  maxLines?: number;
  /** Enable/disable wrapping (default: true) */
  wrap?: boolean;
}

/**
 * Enhanced Text component that prevents truncation by default
 */
export const AppText = forwardRef<Text, AppTextProps>(
  ({ style, maxLines = 0, wrap = true, numberOfLines, ...props }, ref) => {
    return (
      <Text
        {...props}
        ref={ref}
        style={[styles.baseText, wrap && styles.wrappedText, style]}
        numberOfLines={numberOfLines ?? maxLines}
        ellipsizeMode={maxLines > 0 ? 'tail' : undefined}
      />
    );
  }
);

AppText.displayName = 'AppText';

const styles = StyleSheet.create({
  baseText: {
    // Base text styles - can be overridden
  },
  wrappedText: {
    flexWrap: 'wrap',
    // Ensure text wraps naturally without truncation
  },
  paragraphText: {
    lineHeight: 24, // 1.5x default for readability
    flexWrap: 'wrap',
  },
});

/**
 * Paragraph component for long-form content
 * Pre-configured with optimal line height and spacing
 */
export const AppParagraph = forwardRef<Text, AppTextProps>(
  ({ style, ...props }, ref) => {
    return (
      <AppText
        {...props}
        ref={ref}
        style={[styles.paragraphText, style]}
      />
    );
  }
);

AppParagraph.displayName = 'AppParagraph';
