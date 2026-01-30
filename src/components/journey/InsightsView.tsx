/**
 * InsightsView - Spiritual growth insights and analytics
 *
 * Displays AI insights, heatmap calendar, stats, milestones, themes, and verses.
 * Sub-components extracted to ./insights/ folder.
 */

import React, { useState, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../../lib/theme";
import { SpiritualMoment, VerseSource } from "../../types";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import {
  useGrowthInsights,
  GrowthInsight,
} from "../../hooks/useGrowthInsights";
import { useMilestones } from "../../hooks/useMilestones";

import { AIInsightCard } from "./insights/AIInsightCard";
import { HeatmapCalendar } from "./insights/HeatmapCalendar";
import { StatsGrid } from "./insights/StatsGrid";
import { SpiritualLandscape } from "./insights/SpiritualLandscape";
import { MilestonesSection } from "./insights/MilestonesSection";
import { ThemesSection } from "./insights/ThemesSection";
import { AnchorVersesSection } from "./insights/AnchorVersesSection";

interface InsightsViewProps {
  moments: SpiritualMoment[];
}

export function InsightsView({ moments }: InsightsViewProps) {
  const { isPremium, showPaywall } = usePremiumStatus();
  const {
    generateInsight,
    isGenerating,
    error: insightError,
  } = useGrowthInsights();
  const [cachedInsight, setCachedInsight] = useState<GrowthInsight | null>(
    null,
  );
  const { recentAchievements, totalAchieved, nextMilestone } =
    useMilestones(moments);

  // Calculate stats from moments
  const stats = useMemo(() => {
    const devotionals = moments.filter(
      (m) => m.momentType === "devotional",
    ).length;
    const prayers = moments.filter((m) => m.momentType === "prayer").length;
    const journals = moments.filter((m) => m.momentType === "journal").length;
    const memoryPractices = moments.filter(
      (m) => m.momentType === "memory_practice",
    ).length;

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
      monthName: now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
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

  const maxThemeCount =
    themeData.length > 0 ? Math.max(...themeData.map((t) => t.count)) : 1;

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

  return (
    <ScrollView
      contentContainerStyle={styles.insightsContainer}
      showsVerticalScrollIndicator={false}
    >
      <AIInsightCard
        isPremium={isPremium}
        showPaywall={showPaywall}
        cachedInsight={cachedInsight}
        moments={moments}
        isGenerating={isGenerating}
        insightError={insightError}
        onGenerateInsight={handleGenerateInsight}
      />

      <HeatmapCalendar
        days={heatmapData.days}
        intensityMap={heatmapData.intensityMap}
        monthName={heatmapData.monthName}
        today={today}
      />

      <StatsGrid
        devotionals={stats.devotionals}
        prayers={stats.prayers}
        journals={stats.journals}
        memoryPractices={stats.memoryPractices}
      />

      {moments.length >= 5 && (
        <SpiritualLandscape
          isPremium={isPremium}
          showPaywall={showPaywall}
          stats={stats}
        />
      )}

      <MilestonesSection
        isPremium={isPremium}
        showPaywall={showPaywall}
        totalAchieved={totalAchieved}
        nextMilestone={nextMilestone}
        recentAchievements={recentAchievements}
      />

      {themeData.length > 0 && (
        <ThemesSection themeData={themeData} maxThemeCount={maxThemeCount} />
      )}

      {topVerses.length > 0 && <AnchorVersesSection topVerses={topVerses} />}

      {/* Empty state */}
      {themeData.length === 0 &&
        topVerses.length === 0 &&
        moments.length === 0 && (
          <View style={styles.emptyGrowth}>
            <Ionicons
              name="trending-up"
              size={48}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyGrowthText}>
              As you share more with the companion and engage with God&apos;s
              Word, patterns will emerge showing your growth areas and recurring
              themes.
            </Text>
          </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  insightsContainer: {
    padding: theme.spacing.md,
  },
  emptyGrowth: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyGrowthText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: theme.fontSize.md * 1.5,
    paddingHorizontal: theme.spacing.lg,
  },
});
