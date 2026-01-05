import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { SpiritualMoment, MomentType } from '../types';

type TabType = 'timeline' | 'insights' | 'themes';

const MOMENT_ICONS: Record<MomentType | string, { icon: string; color: string }> = {
  journal: { icon: 'book', color: theme.colors.primary },
  prayer: { icon: 'heart', color: '#EF4444' },
  devotional: { icon: 'sunny', color: theme.colors.accent },
  gratitude: { icon: 'sparkles', color: '#F59E0B' },
  confession: { icon: 'water', color: '#3B82F6' },
  memory_practice: { icon: 'bulb', color: theme.colors.accent },
  obedience_step: { icon: 'checkmark-circle', color: '#22C55E' },
  lectio: { icon: 'leaf', color: '#22C55E' },
  examen: { icon: 'moon', color: '#8B5CF6' },
  answered_prayer: { icon: 'trophy', color: '#22C55E' },
};

function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TimelineCard({ moment }: { moment: SpiritualMoment }) {
  const config = MOMENT_ICONS[moment.momentType] || MOMENT_ICONS.journal;
  const formattedDate = new Date(moment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.timelineItem}>
      {/* Timeline connector */}
      <View style={styles.timelineConnector}>
        <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
        <View style={styles.timelineLine} />
      </View>

      {/* Content */}
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <View style={styles.timelineMeta}>
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={config.color}
            />
            <Text style={styles.timelineType}>
              {formatMomentType(moment.momentType)}
            </Text>
          </View>
          <Text style={styles.timelineDate}>{formattedDate}</Text>
        </View>

        <Text style={styles.timelineText} numberOfLines={3}>
          {moment.content}
        </Text>

        {moment.themes && moment.themes.length > 0 && (
          <View style={styles.themesContainer}>
            {moment.themes.slice(0, 3).map((t, i) => (
              <View key={i} style={styles.themeBadge}>
                <Text style={styles.themeBadgeText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {moment.linkedVerses && moment.linkedVerses.length > 0 && (
          <Text style={styles.verseRef}>
            {moment.linkedVerses
              .map((v) => `${v.book} ${v.chapter}:${v.verse}`)
              .join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
}

function formatMomentType(type: MomentType): string {
  const labels: Record<MomentType, string> = {
    journal: 'Journal',
    prayer: 'Prayer',
    devotional: 'Devotional',
    gratitude: 'Gratitude',
    confession: 'Confession',
    memory_practice: 'Memory Practice',
    obedience_step: 'Obedience Step',
    lectio: 'Lectio Divina',
    examen: 'Examen',
  };
  return labels[type] || type;
}

function EmptyTimeline() {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>Your Journey Begins</Text>
      <Text style={styles.emptyText}>
        As you engage with devotionals, prayers, and journaling, your spiritual
        journey will be recorded here.
      </Text>
    </View>
  );
}

function GrowthInsightsView() {
  // Placeholder - would fetch from growth_insights table
  return (
    <View style={styles.insightsContainer}>
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
          <Text style={styles.insightTitle}>Your Growth</Text>
        </View>
        <Text style={styles.insightText}>
          As you continue your spiritual journey, insights about your growth will
          appear here. The AI will identify themes, patterns, and areas of
          transformation in your walk with God.
        </Text>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Journal Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Prayers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Verses Memorized</Text>
        </View>
      </View>
    </View>
  );
}

function ThemesView() {
  // Placeholder - would aggregate themes from spiritual_moments
  const mockThemes = [
    { theme: 'trust', count: 0, trend: 'neutral' },
    { theme: 'anxiety', count: 0, trend: 'neutral' },
    { theme: 'gratitude', count: 0, trend: 'neutral' },
    { theme: 'provision', count: 0, trend: 'neutral' },
    { theme: 'relationships', count: 0, trend: 'neutral' },
  ];

  return (
    <View style={styles.themesViewContainer}>
      <Text style={styles.themesDescription}>
        Themes from your spiritual journey will be tracked here. As you share more
        with the companion, patterns will emerge showing your growth areas and
        recurring topics.
      </Text>

      {mockThemes.map((item, index) => (
        <View key={index} style={styles.themeRow}>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>{item.theme}</Text>
            <Text style={styles.themeCount}>{item.count} mentions</Text>
          </View>
          <View style={styles.themeBar}>
            <View
              style={[styles.themeBarFill, { width: `${Math.min(item.count * 10, 100)}%` }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function JourneyScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const recentMoments = useStore((state) => state.recentMoments);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Journey</Text>
        <Text style={styles.subtitle}>Track your spiritual growth</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TabButton
          active={activeTab === 'timeline'}
          label="Timeline"
          onPress={() => setActiveTab('timeline')}
        />
        <TabButton
          active={activeTab === 'insights'}
          label="Growth"
          onPress={() => setActiveTab('insights')}
        />
        <TabButton
          active={activeTab === 'themes'}
          label="Themes"
          onPress={() => setActiveTab('themes')}
        />
      </View>

      {/* Content */}
      {activeTab === 'timeline' && (
        recentMoments.length > 0 ? (
          <FlatList
            data={recentMoments}
            renderItem={({ item }) => <TimelineCard moment={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.timelineList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <EmptyTimeline />
          </ScrollView>
        )
      )}

      {activeTab === 'insights' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <GrowthInsightsView />
        </ScrollView>
      )}

      {activeTab === 'themes' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemesView />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.text,
  },
  scrollContent: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
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
    width: 10,
    height: 10,
    borderRadius: 5,
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
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
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
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  themeBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  themeBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  verseRef: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
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
  insightsContainer: {
    gap: theme.spacing.md,
  },
  insightCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  insightTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  insightText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
  },
  statRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  themesViewContainer: {
    gap: theme.spacing.md,
  },
  themesDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.sm,
  },
  themeRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  themeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  themeName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  themeCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  themeBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  themeBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});
