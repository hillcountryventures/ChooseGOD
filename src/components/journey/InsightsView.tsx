/**
 * InsightsView - Spiritual growth insights and analytics
 * 
 * Displays AI insights, heatmap calendar, stats, milestones, themes, and verses.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ProgressChart } from 'react-native-chart-kit';
import { theme } from '../../lib/theme';
import { SpiritualMoment, VerseSource } from '../../types';
import { navigateToBibleVerse } from '../../lib/navigationHelpers';
import { WEEK_DAYS } from '../../constants/strings';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useGrowthInsights, GrowthInsight } from '../../hooks/useGrowthInsights';
import { useMilestones } from '../../hooks/useMilestones';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface InsightsViewProps {
  moments: SpiritualMoment[];
}

export function InsightsView({ moments }: InsightsViewProps) {
  const navigation = useNavigation();
  const { isPremium, showPaywall } = usePremiumStatus();
  const { generateInsight, isGenerating, error: insightError } = useGrowthInsights();
  const [cachedInsight, setCachedInsight] = useState<GrowthInsight | null>(null);
  const { recentAchievements, totalAchieved, nextMilestone } = useMilestones(moments);

  // Calculate stats from moments
  const stats = useMemo(() => {
    const devotionals = moments.filter((m) => m.momentType === 'devotional').length;
    const prayers = moments.filter((m) => m.momentType === 'prayer').length;
    const journals = moments.filter((m) => m.momentType === 'journal').length;
    const memoryPractices = moments.filter((m) => m.momentType === 'memory_practice').length;

    return { devotionals, prayers, journals, memoryPractices };
  }, [moments]);

  // Generate heatmap data for current month (intensity-based)
  const heatmapData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Count moments per day to calculate intensity
    const dailyCounts: Record<number, number> = {};
    moments
      .filter((m) => {
        const d = new Date(m.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .forEach((m) => {
        const day = new Date(m.createdAt).getDate();
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

    // Calculate intensity levels (0-4)
    const maxCount = Math.max(...Object.values(dailyCounts), 1);
    const intensityMap: Record<number, number> = {};
    Object.entries(dailyCounts).forEach(([day, count]) => {
      // Map counts to intensity levels
      const intensity = Math.min(Math.ceil((count / maxCount) * 4), 4);
      intensityMap[Number(day)] = intensity;
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
      intensityMap,
      monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [moments]);

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
      .map(([themeName, count]) => ({ theme: themeName, count }));
  }, [moments]);

  const maxThemeCount = themeData.length > 0 ? Math.max(...themeData.map((t) => t.count)) : 1;

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

  const today = new Date().getDate();

  // Handle generating AI insights
  const handleGenerateInsight = useCallback(async () => {
    if (!isPremium) {
      showPaywall();
      return;
    }

    const insight = await generateInsight(moments);
    if (insight) {
      setCachedInsight(insight);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isPremium, showPaywall, generateInsight, moments]);

  // Get intensity color based on level (0-4)
  const getIntensityColor = (intensity: number) => {
    const colors = [
      theme.colors.border, // 0 - no activity
      theme.colors.primaryAlpha[10], // 1 - low
      theme.colors.primaryAlpha[20], // 2 - medium-low
      theme.colors.primaryAlpha[30], // 3 - medium-high
      theme.colors.primary, // 4 - high
    ];
    return colors[intensity] || colors[0];
  };

  return (
    <ScrollView contentContainerStyle={styles.insightsContainer} showsVerticalScrollIndicator={false}>
      {/* AI Growth Summary - Pro Feature */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb" size={24} color={theme.colors.accent} />
          <Text style={styles.insightTitle}>AI Growth Insights</Text>
          {!isPremium && (
            <TouchableOpacity onPress={showPaywall} style={styles.proBadge}>
              <Ionicons name="lock-closed" size={12} color={theme.colors.accent} />
              <Text style={styles.proBadgeText}>Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Display cached insight if available */}
        {cachedInsight ? (
          <View>
            <Text style={styles.insightText}>{cachedInsight.summary}</Text>

            {cachedInsight.scriptureConnection && (
              <View style={styles.insightScripture}>
                <Ionicons name="book" size={14} color={theme.colors.primary} />
                <Text style={styles.insightScriptureText}>{cachedInsight.scriptureConnection}</Text>
              </View>
            )}

            {cachedInsight.growthPrediction && (
              <View style={styles.insightPrediction}>
                <Ionicons name="trending-up" size={14} color={theme.colors.success} />
                <Text style={styles.insightPredictionText}>{cachedInsight.growthPrediction}</Text>
              </View>
            )}

            {cachedInsight.encouragement && (
              <Text style={styles.insightEncouragement}>{cachedInsight.encouragement}</Text>
            )}

            <TouchableOpacity
              style={styles.refreshInsightButton}
              onPress={handleGenerateInsight}
              disabled={isGenerating}
            >
              <Ionicons name="refresh" size={16} color={theme.colors.primary} />
              <Text style={styles.refreshInsightButtonText}>Refresh Insight</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {moments.length > 0 ? (
              <Text style={styles.insightText}>
                {isPremium
                  ? "Tap below to generate AI-powered insights based on your spiritual journey. I'll analyze your patterns, connect them to scripture, and predict your growth trajectory."
                  : "Upgrade to Pro to unlock AI-powered insights that connect your habits to scripture and predict your spiritual growth trajectory."
                }
              </Text>
            ) : (
              <Text style={styles.insightText}>
                As you continue your spiritual journey, AI-powered insights will appear here, connecting your habits to scripture and showing growth patterns.
              </Text>
            )}

            {insightError && (
              <Text style={styles.insightError}>{insightError}</Text>
            )}

            {isPremium && moments.length > 0 && (
              <TouchableOpacity
                style={styles.generateInsightButton}
                onPress={handleGenerateInsight}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <ActivityIndicator size="small" color={theme.colors.text} />
                    <Text style={styles.generateInsightButtonText}>Generating...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.generateInsightButtonText}>Generate Weekly Insight</Text>
                    <Ionicons name="sparkles" size={16} color={theme.colors.text} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Monthly Heatmap Calendar */}
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>{heatmapData.monthName}</Text>
        <View style={styles.calendarHeader}>
          {WEEK_DAYS.map((day, i) => (
            <Text key={i} style={styles.calendarDayHeader}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {heatmapData.days.map((day, i) => (
            <View key={i} style={styles.calendarCell}>
              {day !== null && (
                <View
                  style={[
                    styles.calendarDay,
                    { backgroundColor: getIntensityColor(heatmapData.intensityMap[day] || 0) },
                    day === today && styles.calendarDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      heatmapData.intensityMap[day] > 0 && styles.calendarDayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Heatmap Legend */}
        <View style={styles.heatmapLegend}>
          <Text style={styles.heatmapLegendText}>Less</Text>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              style={[
                styles.heatmapLegendBox,
                { backgroundColor: getIntensityColor(level) }
              ]}
            />
          ))}
          <Text style={styles.heatmapLegendText}>More</Text>
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

      {/* Spiritual Landscape - Faith Dimensions */}
      {moments.length >= 5 && (
        <View style={styles.spiritualLandscapeCard}>
          <View style={styles.spiritualLandscapeHeader}>
            <Ionicons name="analytics" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Spiritual Landscape</Text>
            {!isPremium && (
              <TouchableOpacity onPress={showPaywall} style={styles.proBadge}>
                <Ionicons name="lock-closed" size={10} color={theme.colors.accent} />
                <Text style={styles.proBadgeText}>Pro</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.spiritualLandscapeSubtitle}>
            Your growth across four dimensions of faith
          </Text>

          {/* Progress Chart for Faith Dimensions */}
          <ProgressChart
            data={{
              labels: ['Knowledge', 'Intimacy', 'Gratitude', 'Action'],
              data: [
                Math.min(stats.memoryPractices / 20, 1), // Knowledge: verses memorized
                Math.min(stats.prayers / 30, 1), // Intimacy: prayers offered
                Math.min(stats.journals / 20, 1), // Gratitude: journal reflections
                Math.min(stats.devotionals / 25, 1), // Action: devotionals completed
              ],
            }}
            width={SCREEN_WIDTH - theme.spacing.md * 4}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: theme.colors.card,
              backgroundGradientFrom: theme.colors.card,
              backgroundGradientTo: theme.colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
              style: {
                borderRadius: theme.borderRadius.lg,
              },
              propsForLabels: {
                fontSize: theme.fontSize.xs,
              },
            }}
            hideLegend={false}
          />

          {isPremium && (
            <View style={styles.dimensionTips}>
              <Text style={styles.dimensionTipsTitle}>Grow in Each Dimension:</Text>
              <View style={styles.dimensionTip}>
                <Ionicons name="book" size={14} color={theme.colors.primary} />
                <Text style={styles.dimensionTipText}>
                  <Text style={styles.dimensionTipLabel}>Knowledge:</Text> Memorize scripture to deepen understanding
                </Text>
              </View>
              <View style={styles.dimensionTip}>
                <Ionicons name="heart" size={14} color={theme.colors.error} />
                <Text style={styles.dimensionTipText}>
                  <Text style={styles.dimensionTipLabel}>Intimacy:</Text> Regular prayer builds relationship with God
                </Text>
              </View>
              <View style={styles.dimensionTip}>
                <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
                <Text style={styles.dimensionTipText}>
                  <Text style={styles.dimensionTipLabel}>Gratitude:</Text> Journal your thankfulness and reflections
                </Text>
              </View>
              <View style={styles.dimensionTip}>
                <Ionicons name="fitness" size={14} color={theme.colors.success} />
                <Text style={styles.dimensionTipText}>
                  <Text style={styles.dimensionTipLabel}>Action:</Text> Daily devotionals transform knowledge to obedience
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Milestones & Altars */}
      <View style={styles.milestonesSection}>
        <View style={styles.milestonesSectionHeader}>
          <Ionicons name="trophy" size={20} color={theme.colors.accent} />
          <Text style={styles.sectionTitle}>Milestones & Altars</Text>
          {!isPremium && (
            <TouchableOpacity onPress={showPaywall} style={styles.proBadge}>
              <Ionicons name="lock-closed" size={10} color={theme.colors.accent} />
              <Text style={styles.proBadgeText}>Pro</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.milestonesSubtitle}>
          Biblical altars commemorate encounters with God • {totalAchieved} achieved
        </Text>

        {/* Next Milestone Progress */}
        {nextMilestone && (
          <View style={styles.nextMilestoneCard}>
            <View style={styles.nextMilestoneHeader}>
              <Ionicons name={nextMilestone.icon as any} size={24} color={theme.colors.primary} />
              <View style={styles.nextMilestoneInfo}>
                <Text style={styles.nextMilestoneTitle}>{nextMilestone.title}</Text>
                <Text style={styles.nextMilestoneProgress}>
                  {nextMilestone.current} / {nextMilestone.target}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${nextMilestone.progress}%` }]} />
            </View>
            <Text style={styles.nextMilestoneDescription}>{nextMilestone.description}</Text>
          </View>
        )}

        {/* Recent Achievements (Pro users see shareable cards) */}
        {recentAchievements.length > 0 ? (
          <View>
            <Text style={styles.achievementsTitle}>Recent Achievements</Text>
            {recentAchievements.slice(0, isPremium ? 5 : 3).map((milestone) => (
              <View key={milestone.id} style={styles.milestoneCard}>
                <View style={styles.milestoneCardHeader}>
                  <Ionicons name={milestone.icon as any} size={20} color={theme.colors.accent} />
                  <Text style={styles.milestoneCardTitle}>{milestone.title}</Text>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                </View>
                <Text style={styles.milestoneCardDescription}>{milestone.description}</Text>
                <View style={styles.milestoneScripture}>
                  <Text style={styles.milestoneScriptureText}>&ldquo;{milestone.scripture}&rdquo;</Text>
                  <Text style={styles.milestoneScriptureRef}>— {milestone.scriptureRef}</Text>
                </View>
                {milestone.achievedAt && (
                  <Text style={styles.milestoneDate}>
                    Achieved {milestone.achievedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                )}
                {isPremium && (
                  <TouchableOpacity style={styles.shareAltarButton}>
                    <Ionicons name="share-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.shareAltarButtonText}>Share Altar Card</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noMilestonesText}>
            Keep engaging with God&apos;s Word and your first milestone will appear here soon!
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
                    { width: `${(item.count / maxThemeCount) * 100}%` },
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
              onPress={() => navigateToBibleVerse(navigation as any, item.verse.book, item.verse.chapter, item.verse.verse)}
              activeOpacity={0.7}
            >
              <View style={styles.anchorVerseHeader}>
                <Ionicons name="book" size={16} color={theme.colors.primary} />
                <Text style={styles.anchorVerseRef}>
                  {item.verse.book} {item.verse.chapter}:{item.verse.verse}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
              </View>
              <Text style={styles.anchorVerseText}>
                {item.verse.text}
              </Text>
              <Text style={styles.anchorVerseCount}>
                Referenced {item.count} time{item.count !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty state */}
      {themeData.length === 0 && topVerses.length === 0 && moments.length === 0 && (
        <View style={styles.emptyGrowth}>
          <Ionicons name="trending-up" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyGrowthText}>
            As you share more with the companion and engage with God&apos;s Word, patterns will emerge showing your growth areas and recurring themes.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  // Insights Container
  insightsContainer: {
    padding: theme.spacing.md,
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
    flexWrap: 'wrap',
  },
  insightScripture: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryAlpha[10],
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  insightScriptureText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  insightPrediction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.successAlpha[15],
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },
  insightPredictionText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flexWrap: 'wrap',
  },
  insightEncouragement: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.sm * 1.5,
    flexWrap: 'wrap',
  },
  insightError: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
  generateInsightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  },
  generateInsightButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  refreshInsightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  refreshInsightButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },

  // Pro Badge
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.accentAlpha[15],
    borderRadius: theme.borderRadius.full,
    marginLeft: 'auto',
  },
  proBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.semibold,
  },

  // Calendar
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
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: theme.spacing.md,
  },
  heatmapLegendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  heatmapLegendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
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

  // Section Title
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  // Spiritual Landscape
  spiritualLandscapeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  spiritualLandscapeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  spiritualLandscapeSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  dimensionTips: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dimensionTipsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  dimensionTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  dimensionTipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.sm * 1.5,
    flexWrap: 'wrap',
  },
  dimensionTipLabel: {
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },

  // Milestones
  milestonesSection: {
    marginTop: theme.spacing.md,
  },
  milestonesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  milestonesSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  nextMilestoneCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  nextMilestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  nextMilestoneInfo: {
    flex: 1,
  },
  nextMilestoneTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  nextMilestoneProgress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  nextMilestoneDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  achievementsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  milestoneCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  milestoneCardTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  milestoneCardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  milestoneScripture: {
    backgroundColor: theme.colors.accentAlpha[10],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  milestoneScriptureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  milestoneScriptureRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
  },
  milestoneDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  shareAltarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  shareAltarButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  noMilestonesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
    fontStyle: 'italic',
  },

  // Themes
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

  // Verses
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
    flexWrap: 'wrap',
  },
  anchorVerseCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },

  // Empty State
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
