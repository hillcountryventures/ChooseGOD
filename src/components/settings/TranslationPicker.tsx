/**
 * TranslationPicker - Bible translation selector
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import { Translation, AVAILABLE_TRANSLATIONS } from "../../types";

interface TranslationPickerProps {
  value: Translation;
  onChange: (t: Translation) => void;
}

export function TranslationPicker({ value, onChange }: TranslationPickerProps) {
  return (
    <View style={styles.pickerContainer}>
      {AVAILABLE_TRANSLATIONS.map((t, index) => (
        <TouchableOpacity
          key={t.id}
          style={[
            styles.pickerOption,
            value === t.id && styles.pickerOptionSelected,
            index === AVAILABLE_TRANSLATIONS.length - 1 &&
              styles.pickerOptionLast,
          ]}
          onPress={() => onChange(t.id)}
        >
          <View style={styles.pickerOptionContent}>
            <View style={styles.pickerOptionHeader}>
              <Text
                style={[
                  styles.pickerOptionText,
                  value === t.id && styles.pickerOptionTextSelected,
                ]}
              >
                {t.id}
              </Text>
              <Text style={styles.pickerOptionLanguage}>{t.language}</Text>
            </View>
            <Text style={styles.pickerOptionDescription}>{t.description}</Text>
          </View>
          {value === t.id && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.primary}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  pickerOptionLast: {
    marginBottom: 0,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary + "20",
  },
  pickerOptionContent: {
    flex: 1,
  },
  pickerOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  pickerOptionLanguage: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  pickerOptionTextSelected: {
    color: theme.colors.primary,
  },
  pickerOptionDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
