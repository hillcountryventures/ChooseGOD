/**
 * SpiritualScoreCard
 *
 * Displays the aggregate spiritual health score with a warm, encouraging design.
 * Shows score, trend, and mini stats for prayer days, verses read, and steps taken.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import type { SpiritualHealthScore } from '../../hooks/useJourneyInsights';

interface SpiritualScoreCardProps {
  data: SpiritualHealthScore;
}

export function SpiritualScoreCard({ data }: SpiritualScoreCardProps) {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate score counting up
    Animated.parallel([
      Animated.timing(scoreAnim, {
        toValue: data.score,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [data.score]);

  const animatedScore = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const isPositiveChange = data.change >= 0;

  return (
    <LinearGradient
      colors={[theme.colors.backgroundTertiary, theme.colors.backgroundSecondary, theme.colors.backgroundTertiary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative glow effects */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header with title and trend badge */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>Spiritual Journey Score</Text>
            <View style={styles.scoreRow}>
              <AnimatedScore value={animatedScore} />
              <Text style={styles.scoreMax}> / 100</Text>
            </View>
          </View>

          <View style={[styles.trendBadge, isPositiveChange ? styles.trendPositive : styles.trendNegative]}>
            <Ionicons
              name={isPositiveChange ? 'trending-up' : 'trending-down'}
              size={14}
              color={isPositiveChange ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.trendText, { color: isPositiveChange ? theme.colors.success : theme.colors.error }]}>
              {isPositiveChange ? '+' : ''}{data.change}%
            </Text>
          </View>
        </View>

        {/* Encouraging message */}
        <Text style={styles.message}>{data.message}</Text>

        {/* Mini stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.prayerDays}</Text>
            <Text style={styles.statLabel}>Prayer Days</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>{data.versesRead}</Text>
            <Text style={styles.statLabel}>Verses Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.stepsCompleted}</Text>
            <Text style={styles.statLabel}>Steps Taken</Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

// Animated score display component
function AnimatedScore({ value }: { value: Animated.AnimatedInterpolation<number> }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const listener = value.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });
    return () => value.removeListener(listener);
  }, [value]);

  return <Text style={styles.scoreValue}>{displayValue}</Text>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  glowTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.accentAlpha[10],
    transform: [{ translateX: 30 }, { translateY: -30 }],
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primaryAlpha[10],
    transform: [{ translateX: -30 }, { translateY: 30 }],
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    opacity: 0.8,
    marginBottom: theme.spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    opacity: 0.6,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
  },
  trendPositive: {
    backgroundColor: theme.colors.successAlpha[15],
  },
  trendNegative: {
    backgroundColor: theme.colors.errorAlpha[15],
  },
  trendText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.accentAlpha[20],
    paddingTop: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: theme.colors.accentAlpha[20],
    borderRightColor: theme.colors.accentAlpha[20],
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});

export default SpiritualScoreCard;
