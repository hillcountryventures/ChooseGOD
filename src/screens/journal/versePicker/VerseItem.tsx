import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../lib/theme";
import { VerseSource } from "../../../types";

interface VerseItemProps {
  verse: VerseSource;
  isSelected: boolean;
  onToggle: (verse: VerseSource) => void;
  showReference?: boolean;
}

export function VerseItem({
  verse,
  isSelected,
  onToggle,
  showReference = true,
}: VerseItemProps) {
  return (
    <TouchableOpacity
      style={[styles.verseItem, isSelected && styles.verseItemSelected]}
      onPress={() => onToggle(verse)}
    >
      <View style={styles.verseItemContent}>
        <View style={styles.verseRefRow}>
          {showReference ? (
            <Text style={styles.verseReference}>
              {verse.book} {verse.chapter}:{verse.verse}
            </Text>
          ) : (
            <Text style={styles.verseNumber}>{verse.verse}</Text>
          )}
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.primary}
            />
          )}
        </View>
        <Text
          style={styles.verseText}
          numberOfLines={showReference ? 3 : undefined}
        >
          {showReference ? `\u201C${verse.text}\u201D` : verse.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  verseItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  verseItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "10",
  },
  verseItemContent: { gap: theme.spacing.xs },
  verseRefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verseReference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  verseNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    minWidth: 24,
  },
  verseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.sm * 1.5,
  },
});
