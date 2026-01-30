import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../lib/theme";
import { WEEK_DAYS } from "../../../constants/strings";

interface HeatmapCalendarProps {
  days: (number | null)[];
  intensityMap: Record<number, number>;
  monthName: string;
  today: number;
}

export function getIntensityColor(intensity: number) {
  const colors = [
    theme.colors.border,
    theme.colors.primaryAlpha[10],
    theme.colors.primaryAlpha[20],
    theme.colors.primaryAlpha[30],
    theme.colors.primary,
  ];
  return colors[intensity] || colors[0];
}

export function HeatmapCalendar({
  days,
  intensityMap,
  monthName,
  today,
}: HeatmapCalendarProps) {
  return (
    <View style={styles.calendarCard}>
      <Text style={styles.calendarTitle}>{monthName}</Text>
      <View style={styles.calendarHeader}>
        {WEEK_DAYS.map((day, i) => (
          <Text key={i} style={styles.calendarDayHeader}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day, i) => (
          <View key={i} style={styles.calendarCell}>
            {day !== null && (
              <View
                style={[
                  styles.calendarDay,
                  {
                    backgroundColor: getIntensityColor(intensityMap[day] || 0),
                  },
                  day === today && styles.calendarDayToday,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    intensityMap[day] > 0 && styles.calendarDayTextActive,
                  ]}
                >
                  {day}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.heatmapLegendText}>Less</Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.heatmapLegendBox,
              { backgroundColor: getIntensityColor(level) },
            ]}
          />
        ))}
        <Text style={styles.heatmapLegendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  calendarDayToday: { borderWidth: 2, borderColor: theme.colors.accent },
  calendarDayText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  calendarDayTextActive: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.bold,
  },
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
});
