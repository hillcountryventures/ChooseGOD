import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useDailyVerse } from '../hooks/useDailyVerse';

interface DailyVerseCardProps {
  onPress?: () => void;
}

export function DailyVerseCard({ onPress }: DailyVerseCardProps) {
  const { dailyVerse, fetchDailyVerse, isLoading } = useDailyVerse();

  useEffect(() => {
    fetchDailyVerse();
  }, [fetchDailyVerse]);

  if (isLoading && !dailyVerse) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Loading today&apos;s verse...</Text>
        </View>
      </View>
    );
  }

  if (!dailyVerse) {
    return null;
  }

  const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="sunny" size={18} color={theme.colors.accent} />
          <Text style={styles.title}>Verse of the Day</Text>
        </View>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <Text style={styles.verseText}>{dailyVerse.verse.text}</Text>

      <View style={styles.footer}>
        <Text style={styles.reference}>{reference}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  verseText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: theme.fontSize.lg * 1.6,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
});
