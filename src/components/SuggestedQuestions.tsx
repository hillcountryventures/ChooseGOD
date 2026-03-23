import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

interface SuggestedQuestionsProps {
  onQuestionPress: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  {
    icon: 'heart-outline' as const,
    question: 'What does the Bible say about love?',
  },
  {
    icon: 'shield-outline' as const,
    question: 'How can I find peace in difficult times?',
  },
  {
    icon: 'hand-left-outline' as const,
    question: 'What does Scripture teach about forgiveness?',
  },
  {
    icon: 'trending-up-outline' as const,
    question: 'What are verses about faith and trust?',
  },
  {
    icon: 'people-outline' as const,
    question: 'What does the Bible say about relationships?',
  },
  {
    icon: 'bulb-outline' as const,
    question: 'How can I grow spiritually?',
  },
];

export function SuggestedQuestions({ onQuestionPress }: SuggestedQuestionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ask about Scripture</Text>
      <Text style={styles.subtitle}>
        Explore God&apos;s Word with questions like these:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SUGGESTED_QUESTIONS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.questionCard}
            onPress={() => onQuestionPress(item.question)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={theme.colors.primary}
              style={styles.questionIcon}
            />
            <Text style={styles.questionText} numberOfLines={2}>
              {item.question}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  questionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: 160,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  questionIcon: {
    marginBottom: theme.spacing.sm,
  },
  questionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: theme.fontSize.sm * 1.4,
  },
});
