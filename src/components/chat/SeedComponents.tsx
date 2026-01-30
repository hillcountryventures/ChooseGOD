/**
 * Seed-related UI components for ChatHub
 *
 * SeedIcon, SeedTracker, NoSeedsCard, FinalSeedBanner
 */

import React, { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";

// Seed Icon with animation
export function SeedIcon({
  filled,
  animating,
}: {
  filled: boolean;
  animating: boolean;
}) {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const opacityAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    if (animating) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animating]);

  return (
    <Animated.View
      style={[
        styles.seedIcon,
        {
          transform: [{ scale: animating ? scaleAnim : 1 }],
          opacity: animating ? opacityAnim : 1,
        },
      ]}
    >
      <Text style={styles.seedEmoji}>{filled ? "🌱" : "·"}</Text>
    </Animated.View>
  );
}

// Daily Seeds Tracker
export function SeedTracker({
  seedsRemaining,
  totalSeeds,
  isPremium,
  onUpgradePress,
}: {
  seedsRemaining: number;
  totalSeeds: number;
  isPremium: boolean;
  onUpgradePress: () => void;
}) {
  if (isPremium) {
    return (
      <View style={styles.seedTrackerPremium}>
        <Ionicons name="infinite" size={16} color={theme.colors.accent} />
        <Text style={styles.seedTrackerPremiumText}>Unlimited</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.seedTracker} onPress={onUpgradePress}>
      <View style={styles.seedIcons}>
        {Array.from({ length: totalSeeds }).map((_, i) => (
          <SeedIcon key={i} filled={i < seedsRemaining} animating={false} />
        ))}
      </View>
      <Text style={styles.seedTrackerText}>
        {seedsRemaining} seed{seedsRemaining !== 1 ? "s" : ""} left
      </Text>
    </TouchableOpacity>
  );
}

// Growth verses for spiritual encouragement
const GROWTH_VERSES = [
  {
    text: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ.",
    ref: "2 Peter 3:18",
  },
  {
    text: "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.",
    ref: "John 15:5",
  },
  {
    text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    ref: "Galatians 6:9",
  },
  {
    text: "The grass withers and the flowers fall, but the word of our God endures forever.",
    ref: "Isaiah 40:8",
  },
  {
    text: "Your word is a lamp for my feet, a light on my path.",
    ref: "Psalm 119:105",
  },
];

// No Seeds Card
export function NoSeedsCard({
  onUpgradePress,
}: {
  onUpgradePress: () => void;
}) {
  const verse = useMemo(
    () => GROWTH_VERSES[Math.floor(Math.random() * GROWTH_VERSES.length)],
    [],
  );

  return (
    <View style={styles.noSeedsCard}>
      <View style={styles.noSeedsContent}>
        <Text style={styles.noSeedsEmoji}>🌱</Text>
        <Text style={styles.noSeedsTitle}>
          You&apos;ve planted all your seeds for today
        </Text>
        <Text style={styles.noSeedsSubtitle}>
          Want to grow deeper? Unlock unlimited Bible study.
        </Text>
        <TouchableOpacity style={styles.noSeedsButton} onPress={onUpgradePress}>
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.noSeedsButtonText}>
            Unlock Unlimited ($3.99/mo)
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.growthVerseContainer}>
        <Text style={styles.growthVerseText}>&ldquo;{verse.text}&rdquo;</Text>
        <Text style={styles.growthVerseRef}>— {verse.ref}</Text>
      </View>
    </View>
  );
}

// Final Seed Warning Banner
export function FinalSeedBanner() {
  return (
    <View style={styles.finalSeedBanner}>
      <Ionicons name="leaf" size={16} color={theme.colors.accent} />
      <Text style={styles.finalSeedText}>
        This is your final daily seed. Make it a deep one.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seedIcon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  seedEmoji: {
    fontSize: 12,
  },
  seedTracker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  seedTrackerPremium: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.accentAlpha[20],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  seedTrackerPremiumText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.accent,
  },
  seedIcons: {
    flexDirection: "row",
    gap: 2,
  },
  seedTrackerText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  finalSeedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accentAlpha[15],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accentAlpha[30],
  },
  finalSeedText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: "500",
    fontStyle: "italic",
  },
  noSeedsCard: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  noSeedsContent: {
    alignItems: "center",
  },
  noSeedsEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  noSeedsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  noSeedsSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  noSeedsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  noSeedsButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: "#fff",
  },
  growthVerseContainer: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: "center",
  },
  growthVerseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: theme.spacing.sm,
  },
  growthVerseRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    marginTop: 6,
    fontWeight: "600",
  },
});
