/**
 * WayfarerProgressCard - Adaptive Bible Reading Plan Card
 *
 * Displays the user's current reading plan progress with "hand-holding"
 * adaptive features when they've missed days.
 *
 * Normal State: Shows today's reading with a "Start Reading" button
 * Intervention State: Warm amber background with Grace/Patient path options
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';
import {
  useReadingPlanStore,
  useActiveProgress,
  useTodaysReading,
  useWayfarerState,
} from '../store/readingPlanStore';
import { useAuthStore } from '../store/authStore';
import { WAYFARER_COLORS } from '../types/readingPlan';

// ============================================================================
// Types
// ============================================================================

interface WayfarerProgressCardProps {
  onStartReading?: () => void;
  onGracePath?: () => void;
  onPatientPath?: () => void;
  onEnrollPress?: () => void;
}

// ============================================================================
// Progress Bar Component - Visual "path" representation
// ============================================================================

function ProgressPath({ progress, totalDays }: { progress: number; totalDays: number }) {
  const percentage = Math.min((progress / totalDays) * 100, 100);

  return (
    <View style={styles.progressPath}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        {/* Milestone markers */}
        <View style={[styles.progressMarker, { left: '25%' }]} />
        <View style={[styles.progressMarker, { left: '50%' }]} />
        <View style={[styles.progressMarker, { left: '75%' }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabelText}>Day {progress}</Text>
        <Text style={styles.progressLabelText}>{totalDays} days</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Intervention Options Component
// ============================================================================

function InterventionOptions({
  daysMissed,
  missedTitles,
  onGracePath,
  onPatientPath,
}: {
  daysMissed: number;
  missedTitles: string[];
  onGracePath: () => void;
  onPatientPath: () => void;
}) {
  return (
    <View style={styles.interventionContainer}>
      <View style={styles.interventionHeader}>
        <Ionicons name="heart" size={20} color={theme.colors.accent} />
        <Text style={styles.interventionTitle}>
          Welcome back! You missed {daysMissed} day{daysMissed > 1 ? 's' : ''}
        </Text>
      </View>

      {missedTitles.length > 0 && (
        <Text style={styles.interventionMissed} numberOfLines={2}>
          Missed: {missedTitles.slice(0, 2).join(', ')}
          {missedTitles.length > 2 ? ` + ${missedTitles.length - 2} more` : ''}
        </Text>
      )}

      <Text style={styles.interventionPrompt}>
        Choose how you&apos;d like to continue your journey:
      </Text>

      <View style={styles.interventionButtons}>
        <TouchableOpacity
          style={[styles.interventionBtn, styles.gracePathBtn]}
          onPress={onGracePath}
          activeOpacity={0.8}
        >
          <View style={styles.interventionBtnIcon}>
            <Ionicons name="sparkles" size={18} color={theme.colors.success} />
          </View>
          <View style={styles.interventionBtnContent}>
            <Text style={[styles.interventionBtnTitle, { color: theme.colors.success }]}>
              Grace Path
            </Text>
            <Text style={styles.interventionBtnSubtitle}>
              Get AI summaries & catch up
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.interventionBtn, styles.patientPathBtn]}
          onPress={onPatientPath}
          activeOpacity={0.8}
        >
          <View style={styles.interventionBtnIcon}>
            <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.interventionBtnContent}>
            <Text style={[styles.interventionBtnTitle, { color: theme.colors.primary }]}>
              Patient Path
            </Text>
            <Text style={styles.interventionBtnSubtitle}>
              Extend schedule, read all
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// Empty State - No Plan Enrolled
// ============================================================================

function EmptyState({ onEnrollPress }: { onEnrollPress?: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="book" size={32} color={theme.colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Start Your Bible Journey</Text>
        <Text style={styles.emptySubtitle}>
          Read through the entire Bible in one year with daily guidance
        </Text>
        {onEnrollPress && (
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={onEnrollPress}
            activeOpacity={0.8}
          >
            <Text style={styles.enrollButtonText}>Begin 365-Day Plan</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Main WayfarerProgressCard Component
// ============================================================================

export default function WayfarerProgressCard({
  onStartReading,
  onGracePath,
  onPatientPath,
  onEnrollPress,
}: WayfarerProgressCardProps) {
  const user = useAuthStore((state) => state.user);
  const {
    fetchUserProgress,
    fetchTodaysReading,
    checkWayfarerStatus,
  } = useReadingPlanStore();

  const activeProgress = useActiveProgress();
  const todaysReading = useTodaysReading();
  const wayfarerState = useWayfarerState();

  // Pulse animation for intervention state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserProgress(user.id);
      fetchTodaysReading(user.id);
    }
  }, [user?.id, fetchUserProgress, fetchTodaysReading]);

  // Animate when entering intervention state
  useEffect(() => {
    if (wayfarerState.status === 'intervention') {
      // Start pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.01,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Animate background to warm amber
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();

      return () => pulse.stop();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      Animated.timing(backgroundAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [wayfarerState.status, pulseAnim, backgroundAnim]);

  // Loading state
  if (wayfarerState.status === 'loading') {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your journey...</Text>
        </View>
      </View>
    );
  }

  // No active plan
  if (!activeProgress) {
    return <EmptyState onEnrollPress={onEnrollPress} />;
  }

  const isIntervention = wayfarerState.status === 'intervention';

  // Interpolate background color
  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.card, WAYFARER_COLORS.intervention],
  });

  const borderColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, WAYFARER_COLORS.interventionBorder],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, isIntervention && styles.iconBadgeIntervention]}>
            <Ionicons
              name={isIntervention ? 'heart' : 'compass'}
              size={16}
              color={isIntervention ? theme.colors.accent : theme.colors.primary}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {isIntervention ? 'Your Journey Awaits' : 'Wayfarer Bible'}
            </Text>
            <Text style={styles.headerSubtitle}>{activeProgress.planName}</Text>
          </View>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color={theme.colors.accent} />
          <Text style={styles.streakText}>{activeProgress.streakCount}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <ProgressPath
        progress={activeProgress.completedDays.length}
        totalDays={activeProgress.totalDays}
      />

      {/* Content based on state */}
      {isIntervention ? (
        <InterventionOptions
          daysMissed={wayfarerState.daysMissed}
          missedTitles={wayfarerState.missedReadingTitles}
          onGracePath={onGracePath || (() => {})}
          onPatientPath={onPatientPath || (() => {})}
        />
      ) : (
        <View style={styles.normalContent}>
          {/* Today's Reading */}
          <View style={styles.todayReading}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>
                DAY {activeProgress.currentDay}
              </Text>
            </View>
            <Text style={styles.todayTitle}>
              {todaysReading?.displayTitle || 'Loading...'}
            </Text>
          </View>

          {/* Start Reading Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={onStartReading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Start Reading</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadgeIntervention: {
    backgroundColor: theme.colors.accentAlpha[20],
  },
  headerTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.accentAlpha[15],
    borderRadius: theme.borderRadius.full,
  },
  streakText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },

  // Progress Path
  progressPath: {
    marginBottom: theme.spacing.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressMarker: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 10,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    transform: [{ translateX: -2 }],
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  progressLabelText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },

  // Normal Content
  normalContent: {},
  todayReading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  todayBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.primaryAlpha[15],
    borderRadius: theme.borderRadius.sm,
  },
  todayBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  todayTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },

  // Start Button
  startButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  startButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },

  // Intervention Container
  interventionContainer: {
    paddingTop: theme.spacing.sm,
  },
  interventionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  interventionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  interventionMissed: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  interventionPrompt: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  interventionButtons: {
    gap: theme.spacing.sm,
  },
  interventionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
  },
  gracePathBtn: {
    backgroundColor: theme.colors.successAlpha[20],
    borderColor: theme.colors.success + '40',
  },
  patientPathBtn: {
    backgroundColor: theme.colors.primaryAlpha[15],
    borderColor: theme.colors.primary + '40',
  },
  interventionBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interventionBtnContent: {
    flex: 1,
  },
  interventionBtnTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  interventionBtnSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  },
  enrollButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
});
