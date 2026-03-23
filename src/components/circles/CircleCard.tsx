/**
 * CircleCard - Prayer Circle Preview Card
 * Displays circle info with member avatars and active request count
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { CircleWithMembers } from '../../store/prayerCircleStore';
import { CircleMemberAvatar } from './CircleMemberAvatar';

interface CircleCardProps {
  circle: CircleWithMembers;
  onPress: () => void;
}

// Circle icons based on typical group types
const CIRCLE_EMOJIS = ['👨‍👩‍👧‍👦', '⛪', '💛', '🙏', '✝️', '📖', '🕊️'];

export function CircleCard({ circle, onPress }: CircleCardProps) {
  // Use a consistent emoji based on circle name hash
  const emojiIndex = circle.name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % CIRCLE_EMOJIS.length;
  const emoji = CIRCLE_EMOJIS[emojiIndex];

  // Get gradient color based on index
  const gradientColors = [
    { from: theme.colors.accent, to: theme.colors.accentLight },
    { from: theme.colors.primary, to: theme.colors.primaryLight },
    { from: '#8B9A7D', to: '#B8C4AD' }, // sage
    { from: '#8B7355', to: '#A69080' }, // earth
  ];
  const colorIndex = circle.name.length % gradientColors.length;
  const colors = gradientColors[colorIndex];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${colors.from}20` }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {circle.name}
          </Text>
          {circle.isCreator && (
            <View style={styles.creatorBadge}>
              <Ionicons name="star" size={10} color={theme.colors.accent} />
            </View>
          )}
        </View>

        <Text style={styles.memberCount}>
          {circle.memberCount} member{circle.memberCount !== 1 ? 's' : ''}
        </Text>

        <View style={styles.footer}>
          {/* Member avatars preview */}
          <View style={styles.avatarsRow}>
            {circle.members.slice(0, 3).map((member, index) => (
              <View key={member.userId} style={[styles.avatarWrapper, { marginLeft: index > 0 ? -8 : 0 }]}>
                <CircleMemberAvatar
                  member={member}
                  size={24}
                />
              </View>
            ))}
            {(circle.memberCount ?? 0) > 3 && (
              <View style={[styles.avatarWrapper, styles.moreAvatar, { marginLeft: -8 }]}>
                <Text style={styles.moreText}>+{(circle.memberCount ?? 0) - 3}</Text>
              </View>
            )}
          </View>

          {/* Active requests */}
          {circle.activeRequestCount > 0 && (
            <Text style={styles.requestCount}>
              • {circle.activeRequestCount} active request{circle.activeRequestCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flexShrink: 1,
  },
  creatorBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.accentAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.card,
    borderRadius: 12,
  },
  moreAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
  requestCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
