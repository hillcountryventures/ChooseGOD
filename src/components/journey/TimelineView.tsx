/**
 * TimelineView - Chronological spiritual moments with tappable verses
 * 
 * Displays the user's spiritual journey as a timeline with moment cards.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { SpiritualMoment, RootStackParamList } from '../../types';
import { navigateToBibleVerse } from '../../lib/navigationHelpers';
import { MOMENT_ICONS } from './constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Timeline Card
// ============================================================================
function TimelineCard({ moment }: { moment: SpiritualMoment }) {
  const navigation = useNavigation<NavigationProp>();
  const config = MOMENT_ICONS[moment.momentType] || MOMENT_ICONS.journal;

  const formattedDate = new Date(moment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  // Handle tapping on a linked verse
  const handleVersePress = (verse: { book: string; chapter: number; verse: number }) => {
    navigateToBibleVerse(navigation, verse.book, verse.chapter, verse.verse);
  };

  return (
    <View style={styles.timelineItem}>
      {/* Connector line */}
      <View style={styles.timelineConnector}>
        <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
        <View style={styles.timelineLine} />
      </View>

      {/* Content Card */}
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <View style={styles.timelineMeta}>
            <Ionicons name={config.icon as any} size={14} color={config.color} />
            <Text style={[styles.timelineType, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.timelineDate}>{formattedDate}</Text>
        </View>

        <Text style={styles.timelineText} numberOfLines={3}>
          {moment.content}
        </Text>

        {/* Themes */}
        {moment.themes && moment.themes.length > 0 && (
          <View style={styles.themesRow}>
            {moment.themes.slice(0, 3).map((t, i) => (
              <View key={i} style={styles.themeBadge}>
                <Text style={styles.themeBadgeText}>#{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Linked Verses - TAPPABLE */}
        {moment.linkedVerses && moment.linkedVerses.length > 0 && (
          <View style={styles.linkedVersesRow}>
            {moment.linkedVerses.slice(0, 2).map((v, i) => (
              <TouchableOpacity
                key={i}
                style={styles.linkedVerseChip}
                onPress={() => handleVersePress(v)}
                activeOpacity={0.7}
              >
                <Ionicons name="book-outline" size={12} color={theme.colors.primary} />
                <Text style={styles.linkedVerseText}>
                  {v.book} {v.chapter}:{v.verse}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Timeline View
// ============================================================================
export function TimelineView({ moments }: { moments: SpiritualMoment[] }) {
  if (moments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color={theme.colors.textMuted} />
        <Text style={styles.emptyTitle}>Your Journey Begins</Text>
        <Text style={styles.emptyText}>
          Each prayer, journal entry, and devotional you complete will appear here,
          forming a beautiful record of your walk with God.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={moments}
      renderItem={({ item }) => <TimelineCard moment={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.timelineList}
    />
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  // Timeline
  timelineList: {
    padding: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  timelineConnector: {
    alignItems: 'center',
    width: 24,
    marginRight: theme.spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timelineType: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  timelineDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  timelineText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.5,
    flexWrap: 'wrap',
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  themeBadge: {
    backgroundColor: theme.colors.primaryAlpha[20],
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  themeBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  linkedVersesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  linkedVerseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryAlpha[40],
  },
  linkedVerseText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: theme.fontSize.md * 1.5,
  },
});
