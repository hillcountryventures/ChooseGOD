import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../lib/theme";
import { VerseSource } from "../../../types";
import { navigateToBibleVerse } from "../../../lib/navigationHelpers";

interface AnchorVersesSectionProps {
  topVerses: Array<{ verse: VerseSource; count: number }>;
}

export function AnchorVersesSection({ topVerses }: AnchorVersesSectionProps) {
  const navigation = useNavigation();

  if (topVerses.length === 0) return null;

  return (
    <View style={styles.versesSection}>
      <Text style={styles.sectionTitle}>Anchor Scriptures</Text>
      <Text style={styles.versesSubtitle}>
        Verses that keep appearing in your journey
      </Text>
      {topVerses.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.anchorVerseCard}
          onPress={() =>
            navigateToBibleVerse(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              navigation as any,
              item.verse.book,
              item.verse.chapter,
              item.verse.verse,
            )
          }
          activeOpacity={0.7}
        >
          <View style={styles.anchorVerseHeader}>
            <Ionicons name="book" size={16} color={theme.colors.primary} />
            <Text style={styles.anchorVerseRef}>
              {item.verse.book} {item.verse.chapter}:{item.verse.verse}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.anchorVerseText}>{item.verse.text}</Text>
          <Text style={styles.anchorVerseCount}>
            Referenced {item.count} time{item.count !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  versesSection: { marginBottom: theme.spacing.lg },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  versesSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  anchorVerseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  anchorVerseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  anchorVerseRef: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  anchorVerseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    lineHeight: theme.fontSize.sm * 1.4,
    marginBottom: theme.spacing.xs,
    flexWrap: "wrap",
  },
  anchorVerseCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
