/**
 * JournalPromptsCarousel - AI-powered writing prompts
 *
 * A horizontal scrollable list of contextual prompts to help
 * users start their journal entries.
 *
 * Features:
 * - Horizontal scroll
 * - Tappable prompt chips
 * - Dismissible
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { JournalPrompt } from '../../types';

// Re-export prompts from centralized data location for backwards compatibility
export {
  MORNING_PROMPTS,
  EVENING_PROMPTS,
  VERSE_PROMPTS,
  DEFAULT_PROMPTS,
  getTimeBasedPrompts,
} from '../../data/prompts/journal';

interface JournalPromptsCarouselProps {
  prompts: JournalPrompt[];
  onPromptPress: (prompt: JournalPrompt) => void;
  onDismiss?: () => void;
  title?: string;
}

export default function JournalPromptsCarousel({
  prompts,
  onPromptPress,
  onDismiss,
  title = 'Start with...',
}: JournalPromptsCarouselProps) {
  if (prompts.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt) => {
          // Split "Category: Description" format
          const [category, ...descParts] = prompt.text.split(':');
          const description = descParts.join(':').trim();

          return (
            <TouchableOpacity
              key={prompt.id}
              style={styles.promptChip}
              onPress={() => onPromptPress(prompt)}
              activeOpacity={0.7}
            >
              <View style={styles.promptIconContainer}>
                <Ionicons
                  name={(prompt.icon || 'sparkles') as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.promptTextContainer}>
                <Text style={styles.promptCategory}>{category}</Text>
                <Text style={styles.promptDescription} numberOfLines={2}>
                  {description || prompt.text}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Prompts are now defined in ../../data/prompts/journal.ts
// They are re-exported above for backwards compatibility

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    minWidth: 180,
    maxWidth: 220,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  promptIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  promptTextContainer: {
    flex: 1,
  },
  promptCategory: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  promptDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.xs * 1.4,
  },
  promptText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flex: 1,
  },
});
