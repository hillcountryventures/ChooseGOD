import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import { PrayerRequest } from "../../types";
import { WEEK_DAYS } from "../../constants/strings";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CalendarViewProps {
  prayers: PrayerRequest[];
}

export function CalendarView({ prayers }: CalendarViewProps) {
  const stats = useMemo(() => {
    const total = prayers.length;
    const answered = prayers.filter((p) => p.status === "answered").length;
    const active = prayers.filter((p) => p.status === "active").length;
    const answerRate = total > 0 ? Math.round((answered / total) * 100) : 0;

    const answeredPrayers = prayers.filter(
      (p) => p.status === "answered" && p.answeredAt,
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

  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const prayerDays = new Set<number>();
    const answeredDays = new Set<number>();

    prayers.forEach((p) => {
      const created = new Date(p.createdAt);
      if (created.getMonth() === month && created.getFullYear() === year)
        prayerDays.add(created.getDate());
      if (p.answeredAt) {
        const answered = new Date(p.answeredAt);
        if (answered.getMonth() === month && answered.getFullYear() === year)
          answeredDays.add(answered.getDate());
      }
    });

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return {
      days,
      prayerDays,
      answeredDays,
      monthName: now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [prayers]);

  const today = new Date().getDate();

  return (
    <ScrollView
      contentContainerStyle={styles.calendarContainer}
      showsVerticalScrollIndicator={false}
    >
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
                    calendarData.answeredDays.has(day) &&
                      styles.calendarDayAnswered,
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
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: theme.colors.prayer },
              ]}
            />
            <Text style={styles.legendText}>Prayer written</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: theme.colors.success },
              ]}
            />
            <Text style={styles.legendText}>Prayer answered</Text>
          </View>
        </View>
      </View>

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

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb" size={24} color={theme.colors.accent} />
          <Text style={styles.insightTitle}>Prayer Insights</Text>
        </View>
        {stats.total > 0 ? (
          <Text style={styles.insightText}>
            {stats.answered > 0
              ? `God has answered ${stats.answered} of your prayers! `
              : ""}
            {stats.avgDays > 0
              ? `On average, prayers are answered in ${stats.avgDays} days. `
              : ""}
            {stats.active > 0
              ? `You have ${stats.active} prayer${stats.active !== 1 ? "s" : ""} still before the Lord.`
              : ""}
            {stats.total === stats.answered && stats.total > 0
              ? " Every prayer has been answered - what a testimony of God's faithfulness!"
              : ""}
          </Text>
        ) : (
          <Text style={styles.insightText}>
            As you begin recording your prayers, insights about God&apos;s
            faithfulness will appear here. Start your prayer journey today!
          </Text>
        )}
      </View>

      <View style={styles.encouragementCard}>
        <Text style={styles.encouragementTitle}>Keep Praying!</Text>
        <Text style={styles.encouragementText}>
          &quot;The prayer of a righteous person is powerful and
          effective.&quot; — James 5:16
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  calendarContainer: { padding: theme.spacing.md },
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
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  calendarHeader: { flexDirection: "row", marginBottom: theme.spacing.sm },
  calendarDayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  calendarDay: {
    width: "90%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  calendarDayPrayer: { backgroundColor: theme.colors.prayer },
  calendarDayAnswered: { backgroundColor: theme.colors.success },
  calendarDayToday: { borderWidth: 2, borderColor: theme.colors.accent },
  calendarDayText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  calendarDayTextActive: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.bold,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
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
  insightCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
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
    fontStyle: "italic",
    lineHeight: theme.fontSize.md * 1.5,
  },
});
