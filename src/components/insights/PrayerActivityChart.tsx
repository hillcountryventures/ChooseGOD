/**
 * PrayerActivityChart
 *
 * Animated bar chart showing prayer activity over the last 7 days.
 * Uses React Native Animated API for smooth bar growth animations.
 */

import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import type { DailyActivity } from "../../hooks/useJourneyInsights";

interface PrayerActivityChartProps {
  data: DailyActivity[];
  averageMinutes?: number;
  weeklyChange?: number;
}

export function PrayerActivityChart({
  data,
  averageMinutes: averageMinutesProp,
  weeklyChange: weeklyChangeProp,
}: PrayerActivityChartProps) {
  // Compute real averages from data when props aren't provided
  const totalMinutes = data.reduce((sum, d) => sum + d.prayerMinutes, 0);
  const activeDays = data.filter((d) => d.prayerMinutes > 0).length;
  const averageMinutes =
    averageMinutesProp ??
    (activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0);
  const weeklyChange = weeklyChangeProp ?? 0; // Real value should come from caller
  // Find max value for scaling
  const maxMinutes = Math.max(...data.map((d) => d.prayerMinutes), 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Activity</Text>
        <Text style={styles.subtitle}>Last 7 days</Text>
      </View>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        {data.map((day, index) => (
          <AnimatedBar
            key={day.date}
            day={day}
            maxMinutes={maxMinutes}
            index={index}
          />
        ))}
      </View>

      {/* Footer stats */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.avgIcon}>🙏</Text>
          <Text style={styles.avgText}>Avg: {averageMinutes} min/day</Text>
        </View>
        <View style={styles.footerRight}>
          <Ionicons name="trending-up" size={14} color={theme.colors.success} />
          <Text style={styles.changeText}>+{weeklyChange}% vs last week</Text>
        </View>
      </View>
    </View>
  );
}

interface AnimatedBarProps {
  day: DailyActivity;
  maxMinutes: number;
  index: number;
}

function AnimatedBar({ day, maxMinutes, index }: AnimatedBarProps) {
  const heightAnim = useMemo(() => new Animated.Value(0), []);
  const opacityAnim = useMemo(() => new Animated.Value(0), []);

  const percentage = day.prayerMinutes / maxMinutes;
  const isToday = index === 6;
  const hasPrayer = day.prayerMinutes > 0;

  useEffect(() => {
    // Stagger animation based on index
    const delay = index * 80;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(heightAnim, {
          toValue: percentage,
          tension: 50,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [percentage, index]);

  // Determine bar opacity based on activity
  const barOpacity = hasPrayer
    ? 0.3 + percentage * 0.7 // 30% to 100% opacity based on amount
    : 0.1;

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.barColumn, { opacity: opacityAnim }]}>
      <View style={styles.barWrapper}>
        <Animated.View
          style={[
            styles.bar,
            {
              height: animatedHeight,
              opacity: barOpacity,
              backgroundColor: isToday
                ? theme.colors.accent
                : theme.colors.accent,
            },
          ]}
        />
      </View>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
        {day.dayLabel}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[10],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: theme.spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    width: "70%",
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  dayLabelToday: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.accentAlpha[15],
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  avgIcon: {
    fontSize: 16,
  },
  avgText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
  },
});

export default PrayerActivityChart;
