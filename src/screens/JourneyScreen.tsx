/**
 * JourneyScreen - Track Spiritual Growth
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen answers: "How is God working in my life?"
 *
 * Three Balanced Views:
 * - Timeline: Chronological spiritual moments with tappable verse links
 * - Habits: Streak calendar and consistency tracking
 * - Growth: Themes, insights, and patterns over time
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { SpiritualMoment, MomentType, VerseSource, RootStackParamList } from '../types';
import { navigateToBibleVerse } from '../lib/navigationHelpers';
import { WEEK_DAYS } from '../constants/strings';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'timeline' | 'habits' | 'growth';

// Moment type configurations using theme colors
const MOMENT_ICONS: Record<MomentType | string, { icon: string; color: string; label: string }> = {
  journal: { icon: 'book', color: theme.colors.primary, label: 'Journal' },
  prayer: { icon: 'heart', color: theme.colors.error, label: 'Prayer' },
  devotional: { icon: 'sunny', color: theme.colors.accent, label: 'Devotional' },
  gratitude: { icon: 'sparkles', color: theme.colors.warning, label: 'Gratitude' },
  confession: { icon: 'water', color: theme.colors.info, label: 'Confession' },
  memory_practice: { icon: 'bulb', color: theme.colors.accent, label: 'Memory' },
  obedience_step: { icon: 'checkmark-circle', color: theme.colors.success, label: 'Obedience' },
  lectio: { icon: 'leaf', color: theme.colors.success, label: 'Lectio Divina' },
  examen: { icon: 'moon', color: theme.colors.gradient.end, label: 'Examen' },
  answered_prayer: { icon: 'trophy', color: theme.colors.success, label: 'Answered!' },
};

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
// Timeline View - Chronological moments with tappable verses
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
  const handleVersePress = (verse: VerseSource) => {
    navigateToBibleVerse(navigation, verse.book, verse.chapter, verse.verse);
  };

  // Handle tapping on the card to open detail
  const handleCardPress = () => {
    navigation.navigate('JournalDetail', { momentId: moment.id });
  };

  return (
    <View style={styles.timelineItem}>
      {/* Timeline connector */}
      <View style={styles.timelineConnector}>
        <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
        <View style={styles.timelineLine} />
      </View>

      {/* Content card - tappable */}
      <TouchableOpacity
        style={styles.timelineContent}
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        <View style={styles.timelineHeader}>
          <View style={styles.timelineMeta}>
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={config.color}
            />
            <Text style={[styles.timelineType, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.timelineDate}>{formattedDate}</Text>
        </View>

        <Text style={styles.timelineText} numberOfLines={4}>
          {moment.content}
        </Text>

        {/* Theme badges */}
        {moment.themes && moment.themes.length > 0 && (
          <View style={styles.themesRow}>
            {moment.themes.slice(0, 3).map((t, i) => (
              <View key={i} style={styles.themeBadge}>
                <Text style={styles.themeBadgeText}>#{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tappable linked verses */}
        {moment.linkedVerses && moment.linkedVerses.length > 0 && (
          <View style={styles.linkedVersesRow}>
            {moment.linkedVerses.slice(0, 2).map((verse, i) => (
              <TouchableOpacity
                key={i}
                style={styles.linkedVerseChip}
                onPress={() => handleVersePress(verse)}
                activeOpacity={0.7}
              >
                <Ionicons name="book-outline" size={12} color={theme.colors.primary} />
                <Text style={styles.linkedVerseText}>
                  {verse.book} {verse.chapter}:{verse.verse}
                </Text>
                <Ionicons name="arrow-forward" size={10} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function TimelineView({ moments }: { moments: SpiritualMoment[] }) {
  if (moments.length === 0) {
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

  return (
    <FlatList
      data={moments}
      renderItem={({ item }) => <TimelineCard moment={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.timelineList}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ============================================================================
// Habits View - Streak calendar and stats
// ============================================================================
function HabitsView({ moments }: { moments: SpiritualMoment[] }) {
  // Calculate stats from moments
  const stats = useMemo(() => {
    const devotionals = moments.filter((m) => m.momentType === 'devotional').length;
    const prayers = moments.filter((m) => m.momentType === 'prayer').length;
    const journals = moments.filter((m) => m.momentType === 'journal').length;
    const memoryPractices = moments.filter((m) => m.momentType === 'memory_practice').length;

    return { devotionals, prayers, journals, memoryPractices };
  }, [moments]);

  // Generate calendar data for current month
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Get days with activity
    const activeDays = new Set(
      moments
        .filter((m) => {
          const d = new Date(m.createdAt);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .map((m) => new Date(m.createdAt).getDate())
    );

    // Build calendar grid
    const days: (number | null)[] = [];
    // Add empty cells for days before first of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return { days, activeDays, monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [moments]);

  const today = new Date().getDate();

  return (
    <ScrollView contentContainerStyle={styles.habitsContainer} showsVerticalScrollIndicator={false}>
      {/* Monthly Calendar */}
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>{calendarData.monthName}</Text>
        <View style={styles.calendarHeader}>
          {WEEK_DAYS.map((day, i) => (
            <Text key={i} style={styles.calendarDayHeader}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {calendarData.days.map((day, i) => (
            <View key={i} style={styles.calendarCell}>
              {day !== null && (
                <View
                  style={[
                    styles.calendarDay,
                    calendarData.activeDays.has(day) && styles.calendarDayActive,
                    day === today && styles.calendarDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      calendarData.activeDays.has(day) && styles.calendarDayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.devotionals}</Text>
          <Text style={styles.statLabel}>Devotionals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.prayers}</Text>
          <Text style={styles.statLabel}>Prayers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.journals}</Text>
          <Text style={styles.statLabel}>Journals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.memoryPractices}</Text>
          <Text style={styles.statLabel}>Verses</Text>
        </View>
      </View>

      {/* Habit streaks summary */}
      <View style={styles.habitsSummary}>
        <Text style={styles.habitsSummaryTitle}>Keep Growing!</Text>
        <Text style={styles.habitsSummaryText}>
          Consistency builds spiritual strength. Every moment with God matters.
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Growth View - Themes and insights
// ============================================================================
function GrowthView({ moments }: { moments: SpiritualMoment[] }) {
  const navigation = useNavigation();

  // Calculate theme frequencies
  const themeData = useMemo(() => {
    const counts: Record<string, number> = {};
    moments.forEach((m) => {
      m.themes?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));
  }, [moments]);

  const maxCount = themeData.length > 0 ? Math.max(...themeData.map((t) => t.count)) : 1;

  // Find most referenced verses
  const topVerses = useMemo(() => {
    const verses: Record<string, { verse: VerseSource; count: number }> = {};
    moments.forEach((m) => {
      m.linkedVerses?.forEach((v) => {
        const key = `${v.book}-${v.chapter}-${v.verse}`;
        if (!verses[key]) {
          verses[key] = { verse: v, count: 0 };
        }
        verses[key].count++;
      });
    });
    return Object.values(verses)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [moments]);

  return (
    <ScrollView contentContainerStyle={styles.growthContainer} showsVerticalScrollIndicator={false}>
      {/* Growth Insight Card */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb" size={24} color={theme.colors.accent} />
          <Text style={styles.insightTitle}>Your Growth</Text>
        </View>
        {moments.length > 0 ? (
          <Text style={styles.insightText}>
            You&apos;ve recorded {moments.length} spiritual moment{moments.length !== 1 ? 's' : ''}.
            {themeData.length > 0 && ` Themes like "${themeData[0].theme}" appear often in your journey.`}
            {' '}Keep pressing into God&apos;s Word!
          </Text>
        ) : (
          <Text style={styles.insightText}>
            As you continue your spiritual journey, insights about your growth will
            appear here. The app will identify themes, patterns, and areas of
            transformation in your walk with God.
          </Text>
        )}
      </View>

      {/* Top Themes */}
      {themeData.length > 0 && (
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>Top Themes</Text>
          {themeData.map((item, index) => (
            <View key={index} style={styles.themeRow}>
              <View style={styles.themeInfo}>
                <Text style={styles.themeName}>{item.theme}</Text>
                <Text style={styles.themeCount}>{item.count}</Text>
              </View>
              <View style={styles.themeBar}>
                <View
                  style={[
                    styles.themeBarFill,
                    { width: `${(item.count / maxCount) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Frequently Referenced Verses - TAPPABLE */}
      {topVerses.length > 0 && (
        <View style={styles.versesSection}>
          <Text style={styles.sectionTitle}>Anchor Scriptures</Text>
          <Text style={styles.versesSubtitle}>
            Verses that keep appearing in your journey
          </Text>
          {topVerses.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.anchorVerseCard}
              onPress={() => navigateToBibleVerse(navigation, item.verse.book, item.verse.chapter, item.verse.verse)}
              activeOpacity={0.7}
            >
              <View style={styles.anchorVerseHeader}>
                <Ionicons name="book" size={16} color={theme.colors.primary} />
                <Text style={styles.anchorVerseRef}>
                  {item.verse.book} {item.verse.chapter}:{item.verse.verse}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
              </View>
              <Text style={styles.anchorVerseText} numberOfLines={2}>
                {item.verse.text}
              </Text>
              <Text style={styles.anchorVerseCount}>
                Referenced {item.count} time{item.count !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty state for no themes */}
      {themeData.length === 0 && topVerses.length === 0 && (
        <View style={styles.emptyGrowth}>
          <Ionicons name="trending-up" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyGrowthText}>
            As you share more with the companion, patterns will emerge showing your
            growth areas and recurring themes.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ============================================================================
// PDF Export Helper
// ============================================================================
function generateJourneyPDF(moments: SpiritualMoment[]): string {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMomentIcon = (type: MomentType): string => {
    const icons: Record<MomentType, string> = {
      journal: '📖',
      prayer: '🙏',
      devotional: '☀️',
      gratitude: '✨',
      confession: '💧',
      memory_practice: '💡',
      obedience_step: '✅',
      lectio: '🌿',
      examen: '🌙',
      answered_prayer: '🏆',
    };
    return icons[type] || '📝';
  };

  const getMomentLabel = (type: MomentType): string => {
    const config = MOMENT_ICONS[type];
    return config?.label || type;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=Inter:wght@400;500;600&display=swap');

          * { box-sizing: border-box; }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0f;
            color: #e4e4e7;
            padding: 48px;
            margin: 0;
            line-height: 1.6;
          }

          .header {
            text-align: center;
            margin-bottom: 48px;
            padding-bottom: 32px;
            border-bottom: 1px solid #27272a;
          }

          .logo {
            font-size: 14px;
            letter-spacing: 2px;
            color: #6366f1;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          h1 {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 36px;
            font-weight: 600;
            color: #fafafa;
            margin: 16px 0 8px;
          }

          .subtitle {
            color: #71717a;
            font-size: 14px;
          }

          .stats {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-top: 24px;
          }

          .stat {
            text-align: center;
          }

          .stat-number {
            font-size: 28px;
            font-weight: 600;
            color: #6366f1;
          }

          .stat-label {
            font-size: 12px;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .entry {
            background: #18181b;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid #27272a;
            page-break-inside: avoid;
          }

          .entry-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #27272a;
          }

          .entry-icon {
            font-size: 20px;
          }

          .entry-type {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6366f1;
          }

          .entry-date {
            margin-left: auto;
            font-size: 12px;
            color: #71717a;
          }

          .entry-content {
            font-size: 15px;
            line-height: 1.7;
            color: #d4d4d8;
            white-space: pre-wrap;
          }

          .entry-verse {
            margin-top: 16px;
            padding: 12px 16px;
            background: rgba(99, 102, 241, 0.1);
            border-left: 3px solid #6366f1;
            border-radius: 0 8px 8px 0;
          }

          .verse-ref {
            font-size: 12px;
            font-weight: 600;
            color: #6366f1;
            margin-bottom: 4px;
          }

          .verse-text {
            font-family: 'Crimson Pro', Georgia, serif;
            font-style: italic;
            font-size: 14px;
            color: #a1a1aa;
          }

          .themes {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
          }

          .theme-tag {
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }

          .footer {
            margin-top: 48px;
            text-align: center;
            padding-top: 24px;
            border-top: 1px solid #27272a;
            color: #52525b;
            font-size: 12px;
          }

          .footer a {
            color: #6366f1;
            text-decoration: none;
          }

          @media print {
            body { background: #0a0a0f; }
            .entry { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ChooseGOD</div>
          <h1>My Spiritual Journey</h1>
          <p class="subtitle">A record of God's faithfulness in my life</p>

          <div class="stats">
            <div class="stat">
              <div class="stat-number">${moments.length}</div>
              <div class="stat-label">Moments</div>
            </div>
            <div class="stat">
              <div class="stat-number">${moments.filter(m => m.momentType === 'prayer').length}</div>
              <div class="stat-label">Prayers</div>
            </div>
            <div class="stat">
              <div class="stat-number">${moments.filter(m => m.linkedVerses && m.linkedVerses.length > 0).length}</div>
              <div class="stat-label">Scriptures</div>
            </div>
          </div>
        </div>

        ${moments.map(moment => `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-icon">${getMomentIcon(moment.momentType)}</span>
              <span class="entry-type">${getMomentLabel(moment.momentType)}</span>
              <span class="entry-date">${formatDate(moment.createdAt)}</span>
            </div>

            <div class="entry-content">${moment.content}</div>

            ${moment.linkedVerses && moment.linkedVerses.length > 0 ? `
              <div class="entry-verse">
                <div class="verse-ref">${moment.linkedVerses[0].book} ${moment.linkedVerses[0].chapter}:${moment.linkedVerses[0].verse}</div>
                <div class="verse-text">"${moment.linkedVerses[0].text}"</div>
              </div>
            ` : ''}

            ${moment.themes && moment.themes.length > 0 ? `
              <div class="themes">
                ${moment.themes.map(t => `<span class="theme-tag">#${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}

        <div class="footer">
          <p>Generated with ChooseGOD</p>
          <p>"We are not God, only helping others find HIM"</p>
        </div>
      </body>
    </html>
  `;
}

// ============================================================================
// Main JourneyScreen
// ============================================================================
export default function JourneyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isExporting, setIsExporting] = useState(false);
  const recentMoments = useStore((state) => state.recentMoments);

  // Premium status for PDF export
  const { isPremium, showPaywall } = usePremiumStatus();

  // Calculate streak for header
  const streak = Math.min(recentMoments.length, 30);

  const handleNewJournal = () => {
    navigation.navigate('JournalCompose', {});
  };

  // Handle PDF export (Pro only)
  const handleExportPDF = useCallback(async () => {
    if (!isPremium) {
      showPaywall();
      return;
    }

    if (recentMoments.length === 0) {
      Alert.alert('No Moments', 'Start your spiritual journey by adding some moments first.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);

    try {
      const html = generateJourneyPDF(recentMoments);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your spiritual journey',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Export Complete', 'PDF saved successfully.');
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      Alert.alert('Export Failed', 'Unable to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [isPremium, showPaywall, recentMoments]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Journey</Text>
          <Text style={styles.subtitle}>Track your spiritual growth</Text>
        </View>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color={theme.colors.accent} />
              <Text style={styles.streakBadgeText}>{streak}</Text>
            </View>
          )}
          {/* PDF Export Button (Pro feature) */}
          <TouchableOpacity
            style={[styles.exportButton, !isPremium && styles.exportButtonLocked]}
            onPress={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={isPremium ? theme.colors.accent : theme.colors.textMuted}
                />
                {!isPremium && (
                  <Ionicons
                    name="lock-closed"
                    size={10}
                    color={theme.colors.accent}
                    style={styles.exportLockIcon}
                  />
                )}
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.newJournalButton} onPress={handleNewJournal}>
            <Ionicons name="add" size={22} color={theme.colors.primary} />
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
          active={activeTab === 'habits'}
          label="Habits"
          onPress={() => setActiveTab('habits')}
        />
        <TabButton
          active={activeTab === 'growth'}
          label="Growth"
          onPress={() => setActiveTab('growth')}
        />
      </View>

      {/* Content */}
      {activeTab === 'timeline' && <TimelineView moments={recentMoments} />}
      {activeTab === 'habits' && <HabitsView moments={recentMoments} />}
      {activeTab === 'growth' && <GrowthView moments={recentMoments} />}
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.accentAlpha[20],
    borderRadius: theme.borderRadius.full,
  },
  streakBadgeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentAlpha[10],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[20],
    position: 'relative',
  },
  exportButtonLocked: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  exportLockIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  newJournalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
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

  // Habits View
  habitsContainer: {
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
  calendarDayActive: {
    backgroundColor: theme.colors.primary,
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
  habitsSummary: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  habitsSummaryTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  habitsSummaryText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
  },

  // Growth View
  growthContainer: {
    padding: theme.spacing.md,
  },
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
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  themesSection: {
    marginBottom: theme.spacing.lg,
  },
  themeRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
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
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  themeBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  themeBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  versesSection: {
    marginBottom: theme.spacing.lg,
  },
  versesSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  anchorVerseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  anchorVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  anchorVerseRef: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  anchorVerseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.sm * 1.4,
    marginBottom: theme.spacing.xs,
  },
  anchorVerseCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  emptyGrowth: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyGrowthText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: theme.fontSize.md * 1.5,
    paddingHorizontal: theme.spacing.lg,
  },
});
