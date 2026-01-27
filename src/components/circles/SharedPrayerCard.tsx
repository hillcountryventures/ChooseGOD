/**
 * SharedPrayerCard - Prayer Request in Circle Context
 * Shows prayer request with author info and "praying" interactions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { CirclePrayerRequest } from '../../store/prayerCircleStore';

interface SharedPrayerCardProps {
  prayer: CirclePrayerRequest;
  onPray: () => void;
  onViewVerse?: () => void;
  isOwnPrayer?: boolean;
}

export function SharedPrayerCard({
  prayer,
  onPray,
  onViewVerse,
  isOwnPrayer = false,
}: SharedPrayerCardProps) {
  const isAnswered = prayer.status === 'answered';
  const timeAgo = getTimeAgo(prayer.createdAt);

  // Get initials from author name
  const initials = prayer.authorName
    ? prayer.authorName.charAt(0).toUpperCase()
    : '?';

  return (
    <View
      style={[
        styles.container,
        isAnswered && styles.containerAnswered,
      ]}
    >
      {/* Answered badge */}
      {isAnswered && (
        <View style={styles.answeredBadge}>
          <Text style={styles.answeredIcon}>✨</Text>
          <Text style={styles.answeredText}>ANSWERED PRAYER</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>
                {isOwnPrayer ? 'You' : prayer.authorName}
              </Text>
            </View>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>

        {/* Urgent badge if applicable */}
        {!isAnswered && prayer.status === 'active' && isUrgent(prayer.createdAt) && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>Urgent</Text>
          </View>
        )}
      </View>

      {/* Prayer content */}
      <Text style={styles.prayerText}>{prayer.request}</Text>

      {/* Scripture anchor if present */}
      {prayer.scriptureAnchor && (
        <TouchableOpacity
          style={styles.scriptureContainer}
          onPress={onViewVerse}
          activeOpacity={0.7}
        >
          <Ionicons name="book-outline" size={14} color={theme.colors.accent} />
          <Text style={styles.scriptureReference}>
            {prayer.scriptureAnchor.book} {prayer.scriptureAnchor.chapter}:{prayer.scriptureAnchor.verse}
          </Text>
        </TouchableOpacity>
      )}

      {/* Answered reflection */}
      {isAnswered && prayer.answeredReflection && (
        <View style={styles.reflectionContainer}>
          <Text style={styles.reflectionText}>{prayer.answeredReflection}</Text>
        </View>
      )}

      {/* Footer with pray button */}
      <View style={styles.footer}>
        <View style={styles.prayingInfo}>
          <Text style={styles.prayingEmoji}>🙏</Text>
          <Text style={styles.prayingCount}>
            {prayer.prayingCount} praying
          </Text>
        </View>

        {!isAnswered && (
          <TouchableOpacity
            style={[
              styles.prayButton,
              prayer.userIsPraying && styles.prayButtonActive,
            ]}
            onPress={onPray}
            activeOpacity={0.7}
            disabled={prayer.userIsPraying}
          >
            {prayer.userIsPraying ? (
              <>
                <Ionicons name="checkmark" size={16} color="#8B9A7D" />
                <Text style={styles.prayButtonTextActive}>Praying</Text>
              </>
            ) : (
              <>
                <Text style={styles.prayButtonText}>Pray</Text>
                <Ionicons name="heart" size={14} color={theme.colors.accent} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Helper functions
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isUrgent(date: Date): boolean {
  // Consider prayers less than 24 hours old as potentially urgent
  const diffMs = new Date().getTime() - date.getTime();
  return diffMs < 86400000;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  containerAnswered: {
    backgroundColor: 'rgba(139, 154, 125, 0.1)', // sage tint
    borderColor: 'rgba(139, 154, 125, 0.3)',
    borderWidth: 1,
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  answeredIcon: {
    fontSize: 14,
  },
  answeredText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#8B9A7D',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  authorName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  timeAgo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  urgentBadge: {
    backgroundColor: theme.colors.accentAlpha[15],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  urgentText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.accent,
  },
  prayerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.sm * 1.5,
    marginBottom: theme.spacing.sm,
  },
  scriptureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.accentAlpha[10],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  scriptureReference: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
  },
  reflectionContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#8B9A7D',
  },
  reflectionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  prayingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  prayingEmoji: {
    fontSize: 16,
  },
  prayingCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accentAlpha[15],
  },
  prayButtonActive: {
    backgroundColor: 'rgba(139, 154, 125, 0.15)',
  },
  prayButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.accent,
  },
  prayButtonTextActive: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: '#8B9A7D',
  },
});
