/**
 * ChatModeSelector - Spiritual practice mode selection panel
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { ChatMode } from '../../types';
import { CHAT_MODE_LABELS, CHAT_MODE_DESCRIPTIONS } from '../../constants/chatModes';
import { FREE_CHAT_MODES, PREMIUM_CHAT_MODES } from '../../constants/subscription';

function getModeIcon(mode: ChatMode): keyof typeof Ionicons.glyphMap {
  const icons: Record<ChatMode, keyof typeof Ionicons.glyphMap> = {
    auto: 'chatbubbles-outline',
    devotional: 'sunny-outline',
    prayer: 'hand-left-outline',
    lectio: 'book-outline',
    examen: 'moon-outline',
    memory: 'school-outline',
    confession: 'heart-outline',
    gratitude: 'gift-outline',
    celebration: 'sparkles-outline',
    journal: 'create-outline',
  };
  return icons[mode] || 'chatbubbles-outline';
}

export function getModeName(mode: ChatMode): string {
  return CHAT_MODE_LABELS[mode] || 'Ask Anything';
}

interface ChatModeSelectorProps {
  currentMode: ChatMode;
  isPremium: boolean;
  onModeSelect: (mode: ChatMode) => void;
  onClose: () => void;
}

export function ChatModeSelector({ currentMode, isPremium, onModeSelect, onClose }: ChatModeSelectorProps) {
  return (
    <View style={styles.modeSelectorPanel}>
      <View style={styles.modeSelectorHeader}>
        <Text style={styles.modeSelectorTitle}>Spiritual Practices</Text>
        <TouchableOpacity
          style={styles.modeSelectorCloseButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.modeSelectorGrid}>
        {FREE_CHAT_MODES.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.modeSelectorItem, currentMode === mode && styles.modeSelectorItemActive]}
            onPress={() => onModeSelect(mode)}
            accessible={true}
            accessibilityLabel={`${getModeName(mode)} mode: ${CHAT_MODE_DESCRIPTIONS[mode]}`}
            accessibilityRole="button"
          >
            <View style={styles.modeSelectorItemHeader}>
              <Ionicons
                name={getModeIcon(mode)}
                size={24}
                color={currentMode === mode ? theme.colors.primary : theme.colors.textSecondary}
              />
              {currentMode === mode && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} style={styles.modeSelectorCheckmark} />
              )}
            </View>
            <Text style={[styles.modeSelectorItemText, currentMode === mode && styles.modeSelectorItemTextActive]}>
              {getModeName(mode)}
            </Text>
            <Text style={styles.modeSelectorItemDescription}>
              {CHAT_MODE_DESCRIPTIONS[mode]}
            </Text>
          </TouchableOpacity>
        ))}
        {PREMIUM_CHAT_MODES.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeSelectorItem,
              currentMode === mode && styles.modeSelectorItemActive,
              !isPremium && styles.modeSelectorItemLocked,
            ]}
            onPress={() => onModeSelect(mode)}
            accessible={true}
            accessibilityLabel={`${getModeName(mode)} mode (Premium): ${CHAT_MODE_DESCRIPTIONS[mode]}`}
            accessibilityRole="button"
          >
            <View style={styles.modeSelectorItemHeader}>
              <View style={styles.modeSelectorItemIconRow}>
                <Ionicons
                  name={getModeIcon(mode)}
                  size={24}
                  color={currentMode === mode ? theme.colors.accent : theme.colors.textSecondary}
                />
                {!isPremium && (
                  <Ionicons name="lock-closed" size={12} color={theme.colors.accent} style={styles.modeSelectorLockIcon} />
                )}
              </View>
              {currentMode === mode && isPremium && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} style={styles.modeSelectorCheckmark} />
              )}
            </View>
            <View style={styles.modeSelectorItemTitleRow}>
              <Text style={[
                styles.modeSelectorItemText,
                currentMode === mode && styles.modeSelectorItemTextActive,
                !isPremium && styles.modeSelectorItemTextLocked,
              ]}>
                {getModeName(mode)}
              </Text>
              {!isPremium && <Text style={styles.modeSelectorProBadge}>PRO</Text>}
            </View>
            <Text style={[
              styles.modeSelectorItemDescription,
              !isPremium && styles.modeSelectorItemDescriptionLocked,
            ]}>
              {CHAT_MODE_DESCRIPTIONS[mode]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modeSelectorPanel: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modeSelectorTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modeSelectorCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  modeSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  modeSelectorItem: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    width: '48%',
    minHeight: 100,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeSelectorItemActive: {
    backgroundColor: theme.colors.primaryAlpha[15],
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  modeSelectorItemLocked: {
    opacity: 0.85,
  },
  modeSelectorItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modeSelectorItemIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  modeSelectorLockIcon: {
    position: 'absolute',
    top: -6,
    right: -10,
  },
  modeSelectorCheckmark: {
    marginLeft: 'auto',
  },
  modeSelectorItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 4,
  },
  modeSelectorItemText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modeSelectorItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  modeSelectorItemTextLocked: {
    color: theme.colors.textSecondary,
  },
  modeSelectorItemDescription: {
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
    color: theme.colors.textMuted,
    textAlign: 'left',
  },
  modeSelectorItemDescriptionLocked: {
    color: theme.colors.textMuted,
    opacity: 0.7,
  },
  modeSelectorProBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.accent,
    backgroundColor: theme.colors.accentAlpha[20],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
});
