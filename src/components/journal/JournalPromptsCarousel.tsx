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

// Static prompts for different contexts - each starts with a clear category label
export const MORNING_PROMPTS: JournalPrompt[] = [
  { id: 'm1', type: 'morning', text: 'Morning Gratitude: List 3 blessings you woke up with today', icon: 'sunny' },
  { id: 'm2', type: 'morning', text: 'Daily Intention: What do you want to focus on today?', icon: 'compass' },
  { id: 'm3', type: 'morning', text: 'Prayer Request: Ask God for guidance in a specific area', icon: 'hand-left' },
  { id: 'm4', type: 'morning', text: 'Scripture Meditation: Reflect on your morning verse reading', icon: 'book' },
];

export const EVENING_PROMPTS: JournalPrompt[] = [
  { id: 'e1', type: 'evening', text: 'Daily Review: How did you see God\'s hand in your day?', icon: 'eye' },
  { id: 'e2', type: 'evening', text: 'Evening Gratitude: What are you most thankful for today?', icon: 'heart' },
  { id: 'e3', type: 'evening', text: 'Confession: Is there anything to release to God tonight?', icon: 'moon' },
  { id: 'e4', type: 'evening', text: 'Tomorrow\'s Prayer: What do you need strength for tomorrow?', icon: 'hand-left' },
];

export const VERSE_PROMPTS: JournalPrompt[] = [
  { id: 'v1', type: 'verse_based', text: 'Personal Meaning: What does this verse say to YOU specifically?', icon: 'book' },
  { id: 'v2', type: 'verse_based', text: 'Life Application: How can you live this out today?', icon: 'bulb' },
  { id: 'v3', type: 'verse_based', text: 'Questions & Curiosity: What do you want to understand better?', icon: 'help-circle' },
];

export const DEFAULT_PROMPTS: JournalPrompt[] = [
  { id: 'd1', type: 'contextual', text: 'Free Write: Pour out whatever is on your heart right now', icon: 'create' },
  { id: 'd2', type: 'contextual', text: 'Written Prayer: Talk to God as you would a close friend', icon: 'hand-left' },
  { id: 'd3', type: 'contextual', text: 'Scripture Response: Write about a verse that moved you', icon: 'book' },
  { id: 'd4', type: 'contextual', text: 'Gratitude List: Name specific things you\'re thankful for', icon: 'heart' },
  { id: 'd5', type: 'contextual', text: 'Life Update: Share your highs and lows with God', icon: 'trending-up' },
];

// Helper to get prompts based on time of day
export function getTimeBasedPrompts(): JournalPrompt[] {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return MORNING_PROMPTS;
  } else if (hour >= 18 || hour < 5) {
    return EVENING_PROMPTS;
  }

  return DEFAULT_PROMPTS;
}

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
    backgroundColor: theme.colors.primary + '15',
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
