/**
 * PrayersScreen - Track Prayers Written & Answered
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen answers: "How is God responding to my prayers?"
 *
 * Two Balanced Views:
 * - Timeline: Unified chronological list of all prayers (active + answered)
 * - Calendar: Monthly view with prayer activity and stats
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { PrayerRequest, RootStackParamList } from '../types';
import { navigateToBibleVerse } from '../lib/navigationHelpers';
import { WEEK_DAYS } from '../constants/strings';
import { PrayerEntryModal } from '../components/PrayerEntryModal';
import { AnsweredPrayerModal } from '../components/AnsweredPrayerModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'timeline' | 'calendar';

// ============================================================================
// Tab Button
// ============================================================================
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
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Prayer Timeline Card
// ============================================================================
function PrayerTimelineCard({
  prayer,
  onMarkAnswered,
}: {
  prayer: PrayerRequest;
  onMarkAnswered: (id: string) => void;
}) {
  const navigation = useNavigation<NavigationProp>();
  const isAnswered = prayer.status === 'answered';

  const formattedDate = new Date(prayer.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const answeredDate = prayer.answeredAt
    ? new Date(prayer.answeredAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const daysSince = Math.floor(
    (Date.now() - new Date(prayer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleVersePress = () => {
    if (prayer.scriptureAnchor) {
      navigateToBibleVerse(
        navigation as any,
        prayer.scriptureAnchor.book,
        prayer.scriptureAnchor.chapter,
        prayer.scriptureAnchor.verse
      );
    }
  };

  return (
    <View style={styles.timelineItem}>
      {/* Timeline connector */}
      <View style={styles.timelineConnector}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: isAnswered ? theme.colors.success : theme.colors.prayer },
          ]}
        />
        <View style={styles.timelineLine} />
      </View>

      {/* Content card */}
      <View
        style={[
          styles.timelineContent,
          isAnswered && styles.timelineContentAnswered,
        ]}
      >
        {/* Header with status badge */}
        <View style={styles.timelineHeader}>
          <View
            style={[
              styles.statusBadge,
              isAnswered ? styles.statusBadgeAnswered : styles.statusBadgeActive,
            ]}
          >
            <Ionicons
              name={isAnswered ? 'trophy' : 'heart'}
              size={12}
              color={isAnswered ? theme.colors.success : theme.colors.prayer}
            />
            <Text
              style={[
                styles.statusBadgeText,
                { color: isAnswered ? theme.colors.success : theme.colors.prayer },
              ]}
            >
              {isAnswered ? 'ANSWERED' : 'ACTIVE'}
            </Text>
          </View>
          <Text style={styles.timelineDate}>
            {isAnswered ? answeredDate : `${daysSince} day${daysSince !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* Prayer text */}
        <Text style={styles.prayerText}>{prayer.request}</Text>

        {/* Answered reflection */}
        {isAnswered && prayer.answeredReflection && (
          <View style={styles.reflectionContainer}>
            <View style={styles.reflectionHeader}>
              <Ionicons name="sparkles" size={14} color={theme.colors.success} />
              <Text style={styles.reflectionLabel}>How God answered:</Text>
            </View>
            <Text style={styles.reflectionText}>{prayer.answeredReflection}</Text>
          </View>
        )}

        {/* Scripture anchor - tappable */}
        {prayer.scriptureAnchor && (
          <TouchableOpacity
            style={styles.scriptureChip}
            onPress={handleVersePress}
            activeOpacity={0.7}
          >
            <Ionicons name="book-outline" size={12} color={theme.colors.primary} />
            <Text style={styles.scriptureText}>
              {prayer.scriptureAnchor.book} {prayer.scriptureAnchor.chapter}:
              {prayer.scriptureAnchor.verse}
            </Text>
            <Ionicons name="arrow-forward" size={10} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        {/* Footer with dates and action */}
        <View style={styles.timelineFooter}>
          <View style={styles.dateInfo}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color={theme.colors.textMuted} />
              <Text style={styles.prayingSince}>Started: {formattedDate}</Text>
            </View>
            {isAnswered && answeredDate && (
              <View style={styles.dateRow}>
                <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
                <Text style={[styles.prayingSince, { color: theme.colors.success }]}>
                  Answered: {answeredDate}
                </Text>
              </View>
            )}
          </View>
          {!isAnswered && (
            <TouchableOpacity
              style={styles.answeredButton}
              onPress={() => onMarkAnswered(prayer.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.answeredButtonText}>God Answered!</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Timeline View - Unified list of all prayers
// ============================================================================
function TimelineView({
  prayers,
  onMarkAnswered,
  onAddPrayer,
}: {
  prayers: PrayerRequest[];
  onMarkAnswered: (id: string) => void;
  onAddPrayer: () => void;
}) {
  // Sort: answered first (by answeredAt desc), then active (by createdAt desc)
  const sortedPrayers = useMemo(() => {
    const answered = prayers
      .filter((p) => p.status === 'answered')
      .sort((a, b) => {
        const dateA = a.answeredAt ? new Date(a.answeredAt).getTime() : 0;
        const dateB = b.answeredAt ? new Date(b.answeredAt).getTime() : 0;
        return dateB - dateA;
      });
    const active = prayers
      .filter((p) => p.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return [...answered, ...active];
  }, [prayers]);

  if (prayers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color={theme.colors.textMuted} />
        <Text style={styles.emptyTitle}>Begin Your Prayer Journey</Text>
        <Text style={styles.emptyText}>
          Start a conversation with the companion to add prayer requests. He will
          help you articulate your needs before the Lord.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={onAddPrayer}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={theme.colors.text} />
          <Text style={styles.emptyButtonText}>Start Praying</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedPrayers}
      renderItem={({ item }) => (
        <PrayerTimelineCard prayer={item} onMarkAnswered={onMarkAnswered} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.timelineList}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ============================================================================
// Calendar View - Monthly view with stats
// ============================================================================
function CalendarView({ prayers }: { prayers: PrayerRequest[] }) {
  // Calculate stats
  const stats = useMemo(() => {
    const total = prayers.length;
    const answered = prayers.filter((p) => p.status === 'answered').length;
    const active = prayers.filter((p) => p.status === 'active').length;
    const answerRate = total > 0 ? Math.round((answered / total) * 100) : 0;

    // Calculate average days to answer
    const answeredPrayers = prayers.filter(
      (p) => p.status === 'answered' && p.answeredAt
    );
    let avgDays = 0;
    if (answeredPrayers.length > 0) {
      const totalDays = answeredPrayers.reduce((sum, p) => {
        const start = new Date(p.createdAt).getTime();
        const end = new Date(p.answeredAt!).getTime();
        return sum + (end - start) / (1000 * 60 * 60 * 24);
      }, 0);
      avgDays = Math.round(totalDays / answeredPrayers.length);
    }

    return { total, answered, active, answerRate, avgDays };
  }, [prayers]);

  // Generate calendar data for current month
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Get days with prayer activity (created or answered)
    const prayerDays = new Set<number>();
    const answeredDays = new Set<number>();

    prayers.forEach((p) => {
      const created = new Date(p.createdAt);
      if (created.getMonth() === month && created.getFullYear() === year) {
        prayerDays.add(created.getDate());
      }
      if (p.answeredAt) {
        const answered = new Date(p.answeredAt);
        if (answered.getMonth() === month && answered.getFullYear() === year) {
          answeredDays.add(answered.getDate());
        }
      }
    });

    // Build calendar grid
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return {
      days,
      prayerDays,
      answeredDays,
      monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }, [prayers]);

  const today = new Date().getDate();

  return (
    <ScrollView
      contentContainerStyle={styles.calendarContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Monthly Calendar */}
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>{calendarData.monthName}</Text>
        <View style={styles.calendarHeader}>
          {WEEK_DAYS.map((day, i) => (
            <Text key={i} style={styles.calendarDayHeader}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {calendarData.days.map((day, i) => (
            <View key={i} style={styles.calendarCell}>
              {day !== null && (
                <View
                  style={[
                    styles.calendarDay,
                    calendarData.answeredDays.has(day) && styles.calendarDayAnswered,
                    calendarData.prayerDays.has(day) &&
                      !calendarData.answeredDays.has(day) &&
                      styles.calendarDayPrayer,
                    day === today && styles.calendarDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      (calendarData.prayerDays.has(day) ||
                        calendarData.answeredDays.has(day)) &&
                        styles.calendarDayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.prayer }]} />
            <Text style={styles.legendText}>Prayer written</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.legendText}>Prayer answered</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Prayers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {stats.answered}
          </Text>
          <Text style={styles.statLabel}>Answered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: theme.colors.prayer }]}>
            {stats.active}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.answerRate}%</Text>
          <Text style={styles.statLabel}>Answer Rate</Text>
        </View>
      </View>

      {/* Insights Card */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb" size={24} color={theme.colors.accent} />
          <Text style={styles.insightTitle}>Prayer Insights</Text>
        </View>
        {stats.total > 0 ? (
          <Text style={styles.insightText}>
            {stats.answered > 0
              ? `God has answered ${stats.answered} of your prayers! `
              : ''}
            {stats.avgDays > 0
              ? `On average, prayers are answered in ${stats.avgDays} days. `
              : ''}
            {stats.active > 0
              ? `You have ${stats.active} prayer${stats.active !== 1 ? 's' : ''} still before the Lord.`
              : ''}
            {stats.total === stats.answered && stats.total > 0
              ? " Every prayer has been answered - what a testimony of God's faithfulness!"
              : ''}
          </Text>
        ) : (
          <Text style={styles.insightText}>
            As you begin recording your prayers, insights about God&apos;s
            faithfulness will appear here. Start your prayer journey today!
          </Text>
        )}
      </View>

      {/* Encouragement */}
      <View style={styles.encouragementCard}>
        <Text style={styles.encouragementTitle}>Keep Praying!</Text>
        <Text style={styles.encouragementText}>
          &quot;The prayer of a righteous person is powerful and effective.&quot; — James
          5:16
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Main PrayersScreen
// ============================================================================
export default function PrayersScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [showPrayerEntry, setShowPrayerEntry] = useState(false);
  const [showAnsweredModal, setShowAnsweredModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);

  const activePrayers = useStore((state) => state.activePrayers);
  const updatePrayer = useStore((state) => state.updatePrayer);

  // Calculate answered count for header badge
  const answeredCount = useMemo(
    () => activePrayers.filter((p) => p.status === 'answered').length,
    [activePrayers]
  );

  const handleMarkAnswered = (id: string) => {
    const prayer = activePrayers.find((p) => p.id === id);
    if (prayer) {
      setSelectedPrayer(prayer);
      setShowAnsweredModal(true);
    }
  };

  const handleConfirmAnswered = (reflection: string) => {
    if (selectedPrayer) {
      updatePrayer(selectedPrayer.id, {
        status: 'answered',
        answeredAt: new Date(),
        answeredReflection: reflection || undefined,
      });
    }
    setShowAnsweredModal(false);
    setSelectedPrayer(null);
  };

  const handleAddPrayer = () => {
    setShowPrayerEntry(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Prayers</Text>
          <Text style={styles.subtitle}>Your conversation with God</Text>
        </View>
        <View style={styles.headerRight}>
          {answeredCount > 0 && (
            <View style={styles.answeredBadge}>
              <Ionicons name="trophy" size={14} color={theme.colors.success} />
              <Text style={styles.answeredBadgeText}>{answeredCount}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPrayer}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TabButton
          active={activeTab === 'timeline'}
          label="Timeline"
          onPress={() => setActiveTab('timeline')}
        />
        <TabButton
          active={activeTab === 'calendar'}
          label="Calendar"
          onPress={() => setActiveTab('calendar')}
        />
      </View>

      {/* Content */}
      {activeTab === 'timeline' && (
        <TimelineView
          prayers={activePrayers}
          onMarkAnswered={handleMarkAnswered}
          onAddPrayer={handleAddPrayer}
        />
      )}
      {activeTab === 'calendar' && <CalendarView prayers={activePrayers} />}

      {/* Prayer Entry Modal */}
      <PrayerEntryModal
        visible={showPrayerEntry}
        onClose={() => setShowPrayerEntry(false)}
      />

      {/* Answered Prayer Modal */}
      <AnsweredPrayerModal
        visible={showAnsweredModal}
        prayer={selectedPrayer}
        onClose={() => {
          setShowAnsweredModal(false);
          setSelectedPrayer(null);
        }}
        onConfirm={handleConfirmAnswered}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.successAlpha[20],
    borderRadius: theme.borderRadius.full,
  },
  answeredBadgeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
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
  timelineContentAnswered: {
    borderColor: theme.colors.successAlpha[20],
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
  statusBadgeAnswered: {
    backgroundColor: theme.colors.successAlpha[20],
  },
  statusBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  timelineDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  prayerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.5,
  },
  reflectionContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  reflectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  reflectionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.sm * 1.4,
  },
  scriptureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primaryAlpha[15],
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  scriptureText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  timelineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  prayingSince: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  answeredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  answeredButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },

  // Empty state
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
  },
  emptyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },

  // Calendar View
  calendarContainer: {
    padding: theme.spacing.md,
  },
  calendarCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  calendarTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  calendarDay: {
    width: '90%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  calendarDayPrayer: {
    backgroundColor: theme.colors.prayer,
  },
  calendarDayAnswered: {
    backgroundColor: theme.colors.success,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  calendarDayText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  calendarDayTextActive: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.bold,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },

  // Insight Card
  insightCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
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

  // Encouragement Card
  encouragementCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  encouragementTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  encouragementText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.md * 1.5,
  },
});
