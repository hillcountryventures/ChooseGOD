/**
 * TraditionPicker \u2014 list of tradition options per Decision #13.
 *
 * Used in onboarding (as part of Pick Your Path or a supplementary screen)
 * and in Settings. Respects the user's choice and persists to
 * user_preferences.tradition via the supplied onSelect callback.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import {
  TRADITION_OPTIONS,
  type Tradition,
} from '../constants/traditions';

interface Props {
  selected?: Tradition;
  onSelect: (t: Tradition) => void;
  compact?: boolean;
}

export const TraditionPicker: React.FC<Props> = ({
  selected,
  onSelect,
  compact,
}) => {
  return (
    <View style={styles.wrap}>
      {TRADITION_OPTIONS.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              compact && styles.optionCompact,
            ]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${opt.label}. ${opt.description}`}
          >
            <View style={styles.optionBody}>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              {!compact && (
                <Text style={styles.optionDescription}>{opt.description}</Text>
              )}
            </View>
            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface ?? 'rgba(255,255,255,0.03)',
  },
  optionCompact: { padding: 12 },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(201,169,98,0.08)',
  },
  optionBody: { flex: 1 },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});

export default TraditionPicker;
