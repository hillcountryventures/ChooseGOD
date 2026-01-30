import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useReadingProgressStore } from '../../store/readingProgressStore';
import { navigateToBibleVerse } from '../../lib/navigationHelpers';
import { BottomTabParamList, RootStackParamList } from '../../types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

/**
 * ContinueReadingBanner — subtle banner at top of HomeScreen
 * Shows last read book + chapter with a "Continue Reading" CTA.
 * Only renders when there is reading history.
 */
export function ContinueReadingBanner() {
  const navigation = useNavigation<NavigationProp>();
  const { lastReadBook, lastReadChapter, lastReadAt } = useReadingProgressStore();

  if (!lastReadBook || !lastReadChapter || !lastReadAt) return null;

  // Format relative time
  const elapsed = Date.now() - lastReadAt;
  const minutes = Math.floor(elapsed / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  let timeAgo: string;
  if (minutes < 1) timeAgo = 'Just now';
  else if (minutes < 60) timeAgo = `${minutes}m ago`;
  else if (hours < 24) timeAgo = `${hours}h ago`;
  else if (days === 1) timeAgo = 'Yesterday';
  else timeAgo = `${days}d ago`;

  const handlePress = () => {
    navigateToBibleVerse(navigation, lastReadBook, lastReadChapter);
  };

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Continue reading ${lastReadBook} chapter ${lastReadChapter}, last read ${timeAgo}`}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="bookmark" size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {lastReadBook} {lastReadChapter}
        </Text>
        <Text style={styles.subtitle}>{timeAgo}</Text>
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Continue</Text>
        <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryAlpha?.[10] ?? theme.colors.primary + '1A',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primaryAlpha?.[20] ?? theme.colors.primary + '33',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryAlpha?.[15] ?? theme.colors.primary + '26',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  ctaText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.primary,
  },
});
