/**
 * CardSkeleton - Animated loading placeholder for home screen cards
 * Shows soft, pulsing outlines that give users a sense of where content will appear.
 * Reduces perceived wait time and creates a sense of progressive revelation.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, DimensionValue } from 'react-native';
import { theme } from '../lib/theme';

interface CardSkeletonProps {
  /** Height of the card (default: 200) */
  height?: number;
  /** Show as a compact row instead of a full card */
  variant?: 'hero' | 'row' | 'streak';
}

export function CardSkeleton({ height = 200, variant = 'hero' }: CardSkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Shimmer animation (left to right)
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulse animation (soft breathing)
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();
    pulse.start();

    return () => {
      shimmer.stop();
      pulse.stop();
    };
  }, [shimmerAnim, pulseAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  if (variant === 'row') {
    return (
      <Animated.View style={[styles.rowContainer, { opacity: pulseAnim }]}>
        <View style={styles.rowIcon} />
        <View style={styles.rowContent}>
          <View style={[styles.rowLine, { width: '60%' }]} />
          <View style={[styles.rowLine, styles.rowLineSmall, { width: '40%' }]} />
        </View>
        <View style={styles.rowBadge} />
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </Animated.View>
    );
  }

  if (variant === 'streak') {
    return (
      <Animated.View style={[styles.streakContainer, { opacity: pulseAnim }]}>
        <View style={styles.streakHeader}>
          <View style={[styles.rowLine, { width: '40%' }]} />
        </View>
        <View style={styles.streakDays}>
          {Array.from({ length: 7 }).map((_, index) => (
            <View key={index} style={styles.streakDay} />
          ))}
        </View>
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </Animated.View>
    );
  }

  // Hero variant (default)
  return (
    <Animated.View style={[styles.heroContainer, { height, opacity: pulseAnim }]}>
      {/* Header skeleton */}
      <View style={styles.heroHeader}>
        <View style={styles.heroIconBadge} />
        <View style={[styles.heroLine, { width: '35%' }]} />
      </View>

      {/* Content skeleton - mimics verse text */}
      <View style={styles.heroContent}>
        <View style={[styles.heroLine, styles.heroLineLarge, { width: '95%' }]} />
        <View style={[styles.heroLine, styles.heroLineLarge, { width: '85%' }]} />
        <View style={[styles.heroLine, styles.heroLineLarge, { width: '70%' }]} />
      </View>

      {/* Reference skeleton */}
      <View style={[styles.heroLine, { width: '30%', marginTop: theme.spacing.md }]} />

      {/* Action buttons skeleton */}
      <View style={styles.heroActions}>
        <View style={styles.heroActionBtn} />
        <View style={styles.heroActionBtn} />
        <View style={styles.heroActionBtn} />
      </View>

      {/* Shimmer overlay */}
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Hero variant styles
  heroContainer: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  heroIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundTertiary,
  },
  heroLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.backgroundTertiary,
  },
  heroLineLarge: {
    height: 16,
    marginBottom: theme.spacing.sm,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  heroActionBtn: {
    width: 70,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundTertiary,
  },

  // Row variant styles
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundTertiary,
  },
  rowContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  rowLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.backgroundTertiary,
  },
  rowLineSmall: {
    height: 10,
  },
  rowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundTertiary,
    marginRight: theme.spacing.sm,
  },

  // Streak variant styles
  streakContainer: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  streakHeader: {
    marginBottom: theme.spacing.md,
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundTertiary,
  },

  // Shimmer effect (shared)
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    width: 150,
  },
});

export default CardSkeleton;
