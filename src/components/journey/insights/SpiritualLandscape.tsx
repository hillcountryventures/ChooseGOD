import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressChart } from "react-native-chart-kit";
import { theme } from "../../../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SpiritualLandscapeProps {
  isPremium: boolean;
  showPaywall: () => void;
  stats: {
    devotionals: number;
    prayers: number;
    journals: number;
    memoryPractices: number;
  };
}

export function SpiritualLandscape({
  isPremium,
  showPaywall,
  stats,
}: SpiritualLandscapeProps) {
  return (
    <View style={styles.spiritualLandscapeCard}>
      <View style={styles.spiritualLandscapeHeader}>
        <Ionicons name="analytics" size={20} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>Spiritual Landscape</Text>
        {!isPremium && (
          <TouchableOpacity onPress={showPaywall} style={styles.proBadge}>
            <Ionicons
              name="lock-closed"
              size={10}
              color={theme.colors.accent}
            />
            <Text style={styles.proBadgeText}>Pro</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.spiritualLandscapeSubtitle}>
        Your growth across four dimensions of faith
      </Text>

      <ProgressChart
        data={{
          labels: ["Knowledge", "Intimacy", "Gratitude", "Action"],
          data: [
            Math.min(stats.memoryPractices / 20, 1),
            Math.min(stats.prayers / 30, 1),
            Math.min(stats.journals / 20, 1),
            Math.min(stats.devotionals / 25, 1),
          ],
        }}
        width={SCREEN_WIDTH - theme.spacing.md * 4}
        height={220}
        strokeWidth={16}
        radius={32}
        chartConfig={{
          backgroundColor: theme.colors.card,
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
          style: { borderRadius: theme.borderRadius.lg },
          propsForLabels: { fontSize: theme.fontSize.xs },
        }}
        hideLegend={false}
      />

      {isPremium && (
        <View style={styles.dimensionTips}>
          <Text style={styles.dimensionTipsTitle}>Grow in Each Dimension:</Text>
          {[
            {
              icon: "book" as const,
              color: theme.colors.primary,
              label: "Knowledge:",
              tip: "Memorize scripture to deepen understanding",
            },
            {
              icon: "heart" as const,
              color: theme.colors.error,
              label: "Intimacy:",
              tip: "Regular prayer builds relationship with God",
            },
            {
              icon: "sparkles" as const,
              color: theme.colors.accent,
              label: "Gratitude:",
              tip: "Journal your thankfulness and reflections",
            },
            {
              icon: "fitness" as const,
              color: theme.colors.success,
              label: "Action:",
              tip: "Daily devotionals transform knowledge to obedience",
            },
          ].map((d) => (
            <View key={d.label} style={styles.dimensionTip}>
              <Ionicons name={d.icon} size={14} color={d.color} />
              <Text style={styles.dimensionTipText}>
                <Text style={styles.dimensionTipLabel}>{d.label}</Text> {d.tip}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  spiritualLandscapeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  spiritualLandscapeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  spiritualLandscapeSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  dimensionTips: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dimensionTipsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  dimensionTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  dimensionTipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.sm * 1.5,
    flexWrap: "wrap",
  },
  dimensionTipLabel: {
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.accentAlpha[15],
    borderRadius: theme.borderRadius.full,
    marginLeft: "auto",
  },
  proBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.semibold,
  },
});
