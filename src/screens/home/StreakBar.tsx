import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import { useStore } from "../../store/useStore";
import { STREAK_LIMITS } from "../../constants/limits";
import { WEEK_DAYS } from "../../constants/strings";
import { useGreeting } from "../../hooks/useGreeting";
import { trackStreakDay } from "../../services/analytics";

export function StreakBar() {
  const recentMoments = useStore((state) => state.recentMoments);
  const greeting = useGreeting();

  const streak = Math.min(recentMoments.length, STREAK_LIMITS.weekDays);
  const today = new Date().getDay();

  useEffect(() => {
    if (streak > 0) {
      trackStreakDay(streak);
    }
  }, [streak]);

  return (
    <View style={styles.streakBar}>
      <View style={styles.streakHeader}>
        <View style={styles.streakTitleRow}>
          <Ionicons name="flame" size={18} color={theme.colors.accent} />
          <Text style={styles.streakTitle}>
            {streak > 0 ? `${streak} day streak` : greeting}
          </Text>
        </View>
      </View>
      <View style={styles.streakDays}>
        {WEEK_DAYS.map((day: string, index: number) => {
          const isCompleted = index <= today && streak > today - index;
          const isToday = index === today;
          return (
            <View
              key={index}
              style={[
                styles.streakDay,
                isCompleted && styles.streakDayCompleted,
                isToday && styles.streakDayToday,
              ]}
            >
              <Text
                style={[
                  styles.streakDayText,
                  isCompleted && styles.streakDayTextCompleted,
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  streakBar: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakHeader: { marginBottom: theme.spacing.sm },
  streakTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  streakTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  streakDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakDayCompleted: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  streakDayToday: { borderWidth: 2, borderColor: theme.colors.primary },
  streakDayText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
  },
  streakDayTextCompleted: { color: theme.colors.text },
});
