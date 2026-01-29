/**
 * ChatContextBanner - Shows context-aware prompt banner
 * (daily verse banner or generic context prompt)
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface DailyVerse {
  verse: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
}

interface ChatContextBannerProps {
  screenType: string;
  dailyVerse: DailyVerse | null;
  isPrayerMode: boolean;
  contextPrompt: string;
  onDailyVerseTap: () => void;
  onContextPromptTap: () => void;
}

export function ChatContextBanner({
  screenType,
  dailyVerse,
  isPrayerMode,
  contextPrompt,
  onDailyVerseTap,
  onContextPromptTap,
}: ChatContextBannerProps) {
  if (screenType === 'home' && dailyVerse) {
    return (
      <TouchableOpacity
        style={styles.dailyVerseBanner}
        onPress={onDailyVerseTap}
        activeOpacity={0.7}
      >
        <View style={styles.dailyVerseHeader}>
          <Ionicons name="sunny" size={16} color={theme.colors.accent} />
          <Text style={styles.dailyVerseLabel}>{"Today\u2019s Verse"}</Text>
        </View>
        <Text style={styles.dailyVerseText} numberOfLines={2}>
          {`\u201C${dailyVerse.verse.text}\u201D`}
        </Text>
        <Text style={styles.dailyVerseRef}>
          {`\u2014 ${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.contextBanner} onPress={onContextPromptTap} activeOpacity={0.7}>
      <Ionicons
        name={screenType === 'bible' ? 'book' : isPrayerMode ? 'hand-left' : 'sparkles'}
        size={16}
        color={isPrayerMode ? theme.colors.prayer : theme.colors.primary}
      />
      <Text style={styles.contextText} numberOfLines={1}>
        {isPrayerMode ? "Share what\u2019s on your heart..." : contextPrompt}
      </Text>
      <Ionicons name="arrow-forward" size={14} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  dailyVerseBanner: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.accentAlpha[10],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[20],
  },
  dailyVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  dailyVerseLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyVerseText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.xs,
  },
  dailyVerseRef: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  contextText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
