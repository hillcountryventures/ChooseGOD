/**
 * CircleMemberAvatar - Member Avatar Display
 * Shows initials in a colored circle
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../lib/theme';
import { CircleMember } from '../../types/domain/prayer';

interface CircleMemberAvatarProps {
  member: CircleMember;
  size?: number;
  showName?: boolean;
}

// Warm color palette for avatars
const AVATAR_COLORS = [
  '#8B9A7D', // sage
  theme.colors.accent,
  '#8B7355', // earth
  theme.colors.primary,
  '#EC4899', // pink
  '#3B82F6', // blue
  '#22C55E', // green
];

function getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function getColorForUser(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function CircleMemberAvatar({ member, size = 40, showName = false }: CircleMemberAvatarProps) {
  const initials = getInitials(member.displayName || 'User');
  const backgroundColor = getColorForUser(member.userId);
  const fontSize = Math.max(size * 0.4, 10);

  return (
    <View style={showName && styles.container}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: `${backgroundColor}30`,
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            {
              fontSize,
              color: backgroundColor,
            },
          ]}
        >
          {initials}
        </Text>
      </View>
      {showName && (
        <Text style={styles.name} numberOfLines={1}>
          {member.displayName || 'Member'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: theme.fontWeight.semibold,
  },
  name: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    maxWidth: 60,
    textAlign: 'center',
  },
});
