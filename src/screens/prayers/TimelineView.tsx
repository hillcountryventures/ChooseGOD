import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import { PrayerRequest } from "../../types";
import { PrayerTimelineCard } from "./PrayerTimelineCard";

interface TimelineViewProps {
  prayers: PrayerRequest[];
  onMarkAnswered: (id: string) => void;
  onAddPrayer: () => void;
}

export function TimelineView({
  prayers,
  onMarkAnswered,
  onAddPrayer,
}: TimelineViewProps) {
  const sortedPrayers = useMemo(() => {
    const answered = prayers
      .filter((p) => p.status === "answered")
      .sort((a, b) => {
        const dateA = a.answeredAt ? new Date(a.answeredAt).getTime() : 0;
        const dateB = b.answeredAt ? new Date(b.answeredAt).getTime() : 0;
        return dateB - dateA;
      });
    const active = prayers
      .filter((p) => p.status === "active")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return [...answered, ...active];
  }, [prayers]);

  if (prayers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="heart-outline"
          size={64}
          color={theme.colors.textMuted}
        />
        <Text style={styles.emptyTitle}>Begin Your Prayer Journey</Text>
        <Text style={styles.emptyText}>
          Start a conversation with the companion to add prayer requests. He
          will help you articulate your needs before the Lord.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={onAddPrayer}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Start praying, add your first prayer"
        >
          <Ionicons name="add" size={20} color={theme.colors.text} />
          <Text style={styles.emptyButtonText}>Start Praying</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlashList
      data={sortedPrayers}
      renderItem={({ item }) => (
        <PrayerTimelineCard prayer={item} onMarkAnswered={onMarkAnswered} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.timelineList}
      showsVerticalScrollIndicator={false}
      drawDistance={300}
    />
  );
}

const styles = StyleSheet.create({
  timelineList: { padding: theme.spacing.md },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
    marginTop: theme.spacing.sm,
    lineHeight: theme.fontSize.md * 1.5,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
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
});
