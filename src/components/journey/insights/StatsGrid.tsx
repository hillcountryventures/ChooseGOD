import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { theme } from "../../../lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface StatsGridProps {
  devotionals: number;
  prayers: number;
  journals: number;
  memoryPractices: number;
}

export function StatsGrid({
  devotionals,
  prayers,
  journals,
  memoryPractices,
}: StatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{devotionals}</Text>
        <Text style={styles.statLabel}>Devotionals</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{prayers}</Text>
        <Text style={styles.statLabel}>Prayers</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{journals}</Text>
        <Text style={styles.statLabel}>Journals</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{memoryPractices}</Text>
        <Text style={styles.statLabel}>Verses</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
