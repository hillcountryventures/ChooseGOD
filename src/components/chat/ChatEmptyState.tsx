/**
 * ChatEmptyState - Empty state with suggestions for ChatHub
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { getModeName } from './ChatModeSelector';
import { ChatMode } from '../../types';

interface ChatEmptyStateProps {
  currentMode: ChatMode;
  isPrayerMode: boolean;
  contextVerse?: { book: string; chapter: number; verse: number } | null;
  onSend: (message: string) => void;
}

export function ChatEmptyState({ currentMode, isPrayerMode, contextVerse, onSend }: ChatEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={isPrayerMode ? 'hand-left-outline' : 'book-outline'}
        size={64}
        color={isPrayerMode ? theme.colors.prayer : theme.colors.textMuted}
      />
      <Text style={styles.emptyStateTitle}>
        {getModeName(currentMode)}
      </Text>
      <Text style={styles.emptyStateText}>
        {isPrayerMode
          ? "Share what's on your heart and let's pray together"
          : contextVerse
            ? `Ask about ${contextVerse.book} ${contextVerse.chapter}:${contextVerse.verse}`
            : 'Ask about Scripture, theology, or spiritual guidance'}
      </Text>
      <View style={styles.suggestionList}>
        {isPrayerMode ? (
          <>
            <TouchableOpacity style={styles.suggestionChip} onPress={() => onSend('Guide me through ACTS prayer')}>
              <Text style={styles.suggestionChipIcon}>🙏</Text>
              <Text style={styles.suggestionChipText}>ACTS Prayer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionChip} onPress={() => onSend('Help me pray for peace and guidance')}>
              <Text style={styles.suggestionChipIcon}>🕊️</Text>
              <Text style={styles.suggestionChipText}>Peace & guidance</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.suggestionChip} onPress={() => onSend('Help me pray through my current struggles')}>
              <Text style={styles.suggestionChipIcon}>🙏</Text>
              <Text style={styles.suggestionChipText}>Pray through struggles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionChip} onPress={() => onSend("Explain the historical context of today's verse")}>
              <Text style={styles.suggestionChipIcon}>📖</Text>
              <Text style={styles.suggestionChipText}>Historical context</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionChip} onPress={() => onSend('How can I apply Scripture to my work life?')}>
              <Text style={styles.suggestionChipIcon}>🌱</Text>
              <Text style={styles.suggestionChipText}>Apply to work</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyStateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    maxWidth: 320,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  suggestionChipIcon: {
    fontSize: 14,
  },
  suggestionChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});
