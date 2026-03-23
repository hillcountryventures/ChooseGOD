import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';
import { VerseSource, BibleVerse } from '../types';

interface VerseCardProps {
  verse: VerseSource | BibleVerse;
  compact?: boolean;
  showTranslation?: boolean;
}

export function VerseCard({ verse, compact = false, showTranslation = true }: VerseCardProps) {
  const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
  const translation = 'translation' in verse ? verse.translation : 'KJV';

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactReference}>{reference}</Text>
          {showTranslation && <Text style={styles.compactTranslation}>{translation}</Text>}
        </View>
        <Text style={styles.compactText} numberOfLines={3}>
          {verse.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reference}>{reference}</Text>
        {showTranslation && <Text style={styles.translation}>{translation}</Text>}
      </View>
      <Text style={styles.verseText}>{verse.text}</Text>
      {'similarity' in verse && verse.similarity !== undefined && (
        <View style={styles.similarityBadge}>
          <Text style={styles.similarityText}>
            {Math.round(verse.similarity * 100)}% match
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  reference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
  translation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.backgroundTertiary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  verseText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.6,
    fontStyle: 'italic',
  },
  similarityBadge: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  similarityText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  // Compact styles
  compactContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.xs / 2,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.accent,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  compactReference: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.accent,
  },
  compactTranslation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  compactText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.sm * 1.4,
    fontStyle: 'italic',
  },
});
