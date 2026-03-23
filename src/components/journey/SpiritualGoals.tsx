/**
 * SpiritualGoals - Personalized weekly challenges
 *
 * AI-suggested goals based on user's journey patterns.
 * Completing goals earns milestone progress.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { theme } from '../../lib/theme';
import { SpiritualMoment } from '../../types';
import { useStreakStore } from '../../store/streakStore';

interface SpiritualGoalsProps {
  moments: SpiritualMoment[];
  onGoalPress?: (goalId: string) => void;
}

interface Goal {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  progress: number;
  target: number;
  color: string;
  action?: string;
}

export function SpiritualGoals({ moments, onGoalPress }: SpiritualGoalsProps) {
  const currentStreak = useStreakStore((s) => s.currentStreak);
  
  // Calculate goals based on this week's activity
  const goals = useMemo((): Goal[] => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekMoments = moments.filter((m) => new Date(m.createdAt) >= startOfWeek);
    
    const prayers = weekMoments.filter((m) => m.momentType === 'prayer').length;
    const journals = weekMoments.filter((m) => m.momentType === 'journal').length;
    const devotionals = weekMoments.filter((m) => m.momentType === 'devotional').length;
    
    const generatedGoals: Goal[] = [];
    
    // Streak goal
    if (currentStreak < 7) {
      generatedGoals.push({
        id: 'streak-7',
        icon: 'flame',
        title: 'Build Your Streak',
        description: 'Reach a 7-day streak this week',
        progress: currentStreak,
        target: 7,
        color: theme.colors.warning,
        action: 'Check in daily',
      });
    } else if (currentStreak < 30) {
      generatedGoals.push({
        id: 'streak-30',
        icon: 'flame',
        title: 'Monthly Warrior',
        description: 'Maintain a 30-day streak',
        progress: currentStreak,
        target: 30,
        color: theme.colors.warning,
      });
    }
    
    // Prayer goal
    generatedGoals.push({
      id: 'prayer-week',
      icon: 'hand-left',
      title: 'Prayer Warrior',
      description: 'Add 5 prayers this week',
      progress: prayers,
      target: 5,
      color: theme.colors.prayer,
      action: 'Add prayer',
    });
    
    // Journal goal
    generatedGoals.push({
      id: 'journal-week',
      icon: 'book',
      title: 'Faithful Journaler',
      description: 'Write 3 journal entries',
      progress: journals,
      target: 3,
      color: theme.colors.journal || theme.colors.accent,
      action: 'Write entry',
    });
    
    // Devotional goal
    if (devotionals < 7) {
      generatedGoals.push({
        id: 'devotional-daily',
        icon: 'sunny',
        title: 'Daily Devotion',
        description: 'Complete devotional every day',
        progress: devotionals,
        target: 7,
        color: theme.colors.primary,
        action: 'Start devotional',
      });
    }
    
    return generatedGoals;
  }, [moments, currentStreak]);

  const handleGoalPress = (goal: Goal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onGoalPress?.(goal.id);
  };

  const renderGoal = (goal: Goal) => {
    const isComplete = goal.progress >= goal.target;
    const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);
    
    return (
      <TouchableOpacity 
        key={goal.id}
        style={[styles.goalCard, isComplete && styles.goalComplete]}
        onPress={() => handleGoalPress(goal)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${goal.color}20` }]}>
          <Ionicons 
            name={isComplete ? 'checkmark-circle' : goal.icon} 
            size={24} 
            color={isComplete ? theme.colors.success : goal.color} 
          />
        </View>
        
        <View style={styles.goalContent}>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, isComplete && styles.goalTitleComplete]}>
              {goal.title}
            </Text>
            <Text style={styles.goalProgress}>
              {goal.progress}/{goal.target}
            </Text>
          </View>
          
          <Text style={styles.goalDescription}>{goal.description}</Text>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressPercent}%`,
                  backgroundColor: isComplete ? theme.colors.success : goal.color,
                }
              ]} 
            />
          </View>
        </View>
        
        {!isComplete && goal.action && (
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Goals</Text>
        <View style={styles.badge}>
          <Ionicons name="flag" size={14} color={theme.colors.primary} />
          <Text style={styles.badgeText}>
            {goals.filter((g) => g.progress >= g.target).length}/{goals.length} complete
          </Text>
        </View>
      </View>
      
      <View style={styles.goalsList}>
        {goals.map(renderGoal)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryAlpha[10],
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  goalsList: {
    gap: theme.spacing.sm,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  goalComplete: {
    borderColor: theme.colors.successAlpha?.[30] || 'rgba(16,185,129,0.3)',
    backgroundColor: theme.colors.successAlpha?.[5] || 'rgba(16,185,129,0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  goalContent: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  goalTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  goalTitleComplete: {
    color: theme.colors.success,
  },
  goalProgress: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  goalDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
