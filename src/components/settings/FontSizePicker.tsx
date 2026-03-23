/**
 * FontSizePicker - Font size selector for Scripture reading
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../../lib/theme";

interface FontSizePickerProps {
  value: "small" | "medium" | "large";
  onChange: (size: "small" | "medium" | "large") => void;
}

const SIZES: Array<{
  id: "small" | "medium" | "large";
  label: string;
  sample: number;
}> = [
  { id: "small", label: "Small", sample: 14 },
  { id: "medium", label: "Medium", sample: 16 },
  { id: "large", label: "Large", sample: 20 },
];

export function FontSizePicker({ value, onChange }: FontSizePickerProps) {
  return (
    <View style={styles.segmentContainer}>
      {SIZES.map((size) => (
        <TouchableOpacity
          key={size.id}
          style={[
            styles.segmentOption,
            value === size.id && styles.segmentOptionSelected,
          ]}
          onPress={() => onChange(size.id)}
        >
          <Text
            style={[
              styles.segmentOptionText,
              value === size.id && styles.segmentOptionTextSelected,
              { fontSize: size.sample },
            ]}
          >
            Aa
          </Text>
          <Text
            style={[
              styles.segmentLabel,
              value === size.id && styles.segmentLabelSelected,
            ]}
          >
            {size.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: "row",
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  segmentOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  segmentOptionText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  segmentOptionTextSelected: {
    color: theme.colors.text,
  },
  segmentLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  segmentLabelSelected: {
    color: theme.colors.text,
  },
});
