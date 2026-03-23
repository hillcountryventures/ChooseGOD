/**
 * StreakVisualization - Visual streak tracker
 *
 * Shows current streak with fire animation, longest streak,
 * and streak freeze status for premium users.
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { theme } from '../../lib/theme';
import { useStreakStore, MILESTONE_REWARDS } from '../../store/streakStore';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';

interface StreakVisualizationProps {
  onFreezePress?: () => void;
}

export function StreakVisualization({ onFreezePress }: StreakVisualizationProps) {
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);
  const checkStreakStatus = useStreakStore((s) => s.checkStreakStatus);
  const getFreezesRemaining = useStreakStore((s) => s.getFreezesRemaining);
  const { isPremium } = usePremiumStatus();
  
  const status = checkStreakStatus();
  const freezesRemaining = getFreezesRemaining(isPremium);
  
  // Animation for flame
  const flameScale = useMemo(() => new Animated.Value(1), []);
  const flameOpacity = useMemo(() => new Animated.Value(1), []);
  
  useEffect(() => {
    // Pulsing flame animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flameOpacity, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flameScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flameOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  
  // Get next milestone
  const nextMilestone = useMemo(() => {
    return MILESTONE_REWARDS.find((m) => m.days > currentStreak);
  }, [currentStreak]);
  
  const progressToNext = nextMilestone 
    ? (currentStreak / nextMilestone.days) * 100 
    : 100;

  const handleFreezePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFreezePress?.();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.warningAlpha?.[15] || 'rgba(245,158,11,0.15)', 'transparent']}
        style={styles.gradient}
      >
        {/* Main streak display */}
        <View style={styles.mainRow}>
          <Animated.View 
            style={[
              styles.flameContainer,
              { 
                transform: [{ scale: flameScale }],
                opacity: flameOpacity,
              }
            ]}
          >
            <Ionicons 
              name="flame" 
              size={48} 
              color={status === 'frozen' ? theme.colors.info : theme.colors.warning} 
            />
          </Animated.View>
          
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>
              {currentStreak === 1 ? 'Day Streak' : 'Day Streak'}
            </Text>
          </View>
          
          {/* Longest streak */}
          <View style={styles.longestContainer}>
            <Ionicons name="trophy" size={16} color={theme.colors.gold} />
            <Text style={styles.longestText}>{longestStreak}</Text>
          </View>
        </View>
        
        {/* Status badge */}
        {status === 'at_risk' && (
          <View style={styles.statusBadge}>
            <Ionicons name="warning" size={14} color={theme.colors.warning} />
            <Text style={styles.statusText}>Complete today's activity to keep your streak!</Text>
          </View>
        )}
        
        {status === 'frozen' && (
          <View style={[styles.statusBadge, styles.statusFrozen]}>
            <Ionicons name="snow" size={14} color={theme.colors.info} />
            <Text style={[styles.statusText, { color: theme.colors.info }]}>Streak frozen</Text>
          </View>
        )}
        
        {/* Progress to next milestone */}
        {nextMilestone && (
          <View style={styles.milestoneSection}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneLabel}>
                {nextMilestone.days - currentStreak} days to {nextMilestone.days}-day milestone
              </Text>
              <Text style={styles.milestoneReward}>{nextMilestone.description}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressToNext}%` }]} />
            </View>
          </View>
        )}
        
        {/* Freeze button (premium only) */}
        {isPremium && freezesRemaining > 0 && status === 'at_risk' && (
          <TouchableOpacity style={styles.freezeButton} onPress={handleFreezePress}>
            <Ionicons name="snow" size={16} color={theme.colors.info} />
            <Text style={styles.freezeText}>
              Use Freeze ({freezesRemaining} left)
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  gradient: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.warningAlpha?.[20] || 'rgba(245,158,11,0.2)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  flameContainer: {
    marginRight: theme.spacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 44,
  },
  streakLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  longestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.goldAlpha?.[15] || 'rgba(245,158,11,0.15)',
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  longestText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.warningAlpha?.[10] || 'rgba(245,158,11,0.1)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  statusFrozen: {
    backgroundColor: theme.colors.infoAlpha?.[10] || 'rgba(59,130,246,0.1)',
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  milestoneSection: {
    marginBottom: theme.spacing.sm,
  },
  milestoneHeader: {
    marginBottom: theme.spacing.xs,
  },
  milestoneLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.text,
  },
  milestoneReward: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.warning,
    borderRadius: 3,
  },
  freezeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.infoAlpha?.[15] || 'rgba(59,130,246,0.15)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  freezeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.info,
  },
});
