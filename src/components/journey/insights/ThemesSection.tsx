import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../lib/theme";

interface ThemesSectionProps {
  themeData: Array<{ theme: string; count: number }>;
  maxThemeCount: number;
}

export function ThemesSection({
  themeData,
  maxThemeCount,
}: ThemesSectionProps) {
  if (themeData.length === 0) return null;

  return (
    <View style={styles.themesSection}>
      <Text style={styles.sectionTitle}>Top Themes</Text>
      {themeData.map((item, index) => (
        <View key={index} style={styles.themeRow}>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>{item.theme}</Text>
            <Text style={styles.themeCount}>{item.count}</Text>
          </View>
          <View style={styles.themeBar}>
            <View
              style={[
                styles.themeBarFill,
                { width: `${(item.count / maxThemeCount) * 100}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  themesSection: { marginBottom: theme.spacing.lg },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  themeRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  themeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  themeName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textTransform: "capitalize",
  },
  themeCount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  themeBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  themeBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
});
