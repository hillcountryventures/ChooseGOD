/**
 * ChatHeader - Header bar for ChatBottomSheet
 * Extracted from ChatBottomSheet for maintainability.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { CHAT_MODE_LABELS, isPrayerMode as checkIsPrayerMode } from '../../constants/chatModes';
import type { ChatMode } from '../../types';

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

export { getModeIcon };

interface ChatHeaderProps {
  currentMode: ChatMode;
  isPremium: boolean;
  seedsRemaining: number;
  totalSeeds: number;
  hasMessages: boolean;
  showModeSelector: boolean;
  onShareConversation: () => void;
  onModeSelectorToggle: () => void;
  onPrayerModeToggle: () => void;
  onClearMessages: () => void;
  onClose: () => void;
  onShowPaywall: () => void;
}

export function ChatHeader({
  currentMode,
  isPremium,
  seedsRemaining,
  totalSeeds,
  hasMessages,
  showModeSelector,
  onShareConversation,
  onModeSelectorToggle,
  onPrayerModeToggle,
  onClearMessages,
  onClose,
  onShowPaywall,
}: ChatHeaderProps) {
  const isPrayerMode = checkIsPrayerMode(currentMode);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons
          name={isPrayerMode ? 'hand-left' : 'chatbubbles'}
          size={20}
          color={isPrayerMode ? theme.colors.prayer : theme.colors.primary}
        />
        <Text style={[styles.headerTitle, isPrayerMode && styles.headerTitlePrayer]}>
          {getModeName(currentMode)}
        </Text>
        {isPremium ? (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={10} color={theme.colors.accent} />
            <Text style={styles.premiumBadgeText}>Pro</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.freeQueriesBadge} onPress={onShowPaywall}>
            <Text style={styles.freeQueriesText}>
              {seedsRemaining}/{totalSeeds} 🌱
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.headerRight}>
        {hasMessages && (
          <TouchableOpacity style={styles.headerButton} onPress={onShareConversation}>
            <Ionicons name="share-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.headerButton, showModeSelector && styles.headerButtonActive]}
          onPress={onModeSelectorToggle}
        >
          <Ionicons
            name="compass-outline"
            size={18}
            color={showModeSelector ? theme.colors.accent : theme.colors.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, isPrayerMode && styles.headerButtonActive]}
          onPress={onPrayerModeToggle}
        >
          <Ionicons
            name={isPrayerMode ? 'hand-left' : 'hand-left-outline'}
            size={18}
            color={isPrayerMode ? theme.colors.prayer : theme.colors.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onClearMessages}>
          <Ionicons name="refresh" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.7}
          accessibilityLabel="Close chat"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerTitlePrayer: {
    color: theme.colors.prayer,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentAlpha[20],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 3,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  freeQueriesBadge: {
    backgroundColor: theme.colors.primaryAlpha[15],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  freeQueriesText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  headerButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginLeft: theme.spacing.xs,
  },
});
