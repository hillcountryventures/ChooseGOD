/**
 * AppText — Themed text component with variant system
 *
 * Variants: h1, h2, h3, body, bodySmall, caption, label
 * Each auto-applies fontSize, fontWeight, color, lineHeight from theme.
 *
 * Usage:
 *   <AppText variant="h1">Title</AppText>
 *   <AppText variant="caption" style={{ color: 'red' }}>Override</AppText>
 */

import React, { forwardRef, useContext } from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';

interface AppTextProps extends TextProps {
  /** Typographic variant (default: 'body') */
  variant?: TextVariant;
  /** Allow limiting lines if needed (default: 0 = unlimited) */
  maxLines?: number;
  /** Enable/disable wrapping (default: true) */
  wrap?: boolean;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18, letterSpacing: 0.5 },
};

/**
 * Enhanced Text component with theme-aware variants
 */
export const AppText = forwardRef<Text, AppTextProps>(
  ({ style, variant = 'body', maxLines = 0, wrap = true, numberOfLines, ...props }, ref) => {
    const { theme } = useContext(ThemeContext);
    const vStyle = variantStyles[variant];
    const colorStyle: TextStyle = { color: theme.colors.text };

    return (
      <Text
        {...props}
        ref={ref}
        style={[colorStyle, vStyle, styles.baseText, wrap && styles.wrappedText, style]}
        numberOfLines={numberOfLines ?? maxLines}
        ellipsizeMode={maxLines > 0 ? 'tail' : undefined}
      />
    );
  }
);

AppText.displayName = 'AppText';

const styles = StyleSheet.create({
  baseText: {},
  wrappedText: {
    flexWrap: 'wrap',
  },
  paragraphText: {
    lineHeight: 24,
    flexWrap: 'wrap',
  },
});

/**
 * Paragraph component for long-form content
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
