import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import { PrayerRequest, RootStackParamList } from "../../types";
import { navigateToBibleVerse } from "../../lib/navigationHelpers";
import { usePrayerPremiumStore } from "../../store/prayerPremiumStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PrayerTimelineCard({
  prayer,
  onMarkAnswered,
  onSetReminder,
  onViewTestimony,
}: {
  prayer: PrayerRequest;
  onMarkAnswered: (id: string) => void;
  onSetReminder?: (prayer: PrayerRequest) => void;
  onViewTestimony?: (prayer: PrayerRequest) => void;
}) {
  const navigation = useNavigation<NavigationProp>();
  const isAnswered = prayer.status === "answered";
  const hasReminder = usePrayerPremiumStore((s) => s.hasReminder)(prayer.id);

  const formattedDate = new Date(prayer.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const answeredDate = prayer.answeredAt
    ? new Date(prayer.answeredAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const daysSince = Math.floor(
    (Date.now() - new Date(prayer.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  const handleVersePress = () => {
    if (prayer.scriptureAnchor) {
      navigateToBibleVerse(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigation as any,
        prayer.scriptureAnchor.book,
        prayer.scriptureAnchor.chapter,
        prayer.scriptureAnchor.verse,
      );
    }
  };

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineConnector}>
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor: isAnswered
                ? theme.colors.success
                : theme.colors.prayer,
            },
          ]}
        />
        <View style={styles.timelineLine} />
      </View>

      <View
        style={[
          styles.timelineContent,
          isAnswered && styles.timelineContentAnswered,
        ]}
      >
        <View style={styles.timelineHeader}>
          <View
            style={[
              styles.statusBadge,
              isAnswered
                ? styles.statusBadgeAnswered
                : styles.statusBadgeActive,
            ]}
          >
            <Ionicons
              name={isAnswered ? "trophy" : "heart"}
              size={12}
              color={isAnswered ? theme.colors.success : theme.colors.prayer}
            />
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: isAnswered
                    ? theme.colors.success
                    : theme.colors.prayer,
                },
              ]}
            >
              {isAnswered ? "ANSWERED" : "ACTIVE"}
            </Text>
          </View>
          <Text style={styles.timelineDate}>
            {isAnswered
              ? answeredDate
              : `${daysSince} day${daysSince !== 1 ? "s" : ""}`}
          </Text>
        </View>

        <Text style={styles.prayerText}>{prayer.request}</Text>

        {isAnswered && prayer.answeredReflection && (
          <View style={styles.reflectionContainer}>
            <View style={styles.reflectionHeader}>
              <Ionicons
                name="sparkles"
                size={14}
                color={theme.colors.success}
              />
              <Text style={styles.reflectionLabel}>How God answered:</Text>
            </View>
            <Text style={styles.reflectionText}>
              {prayer.answeredReflection}
            </Text>
          </View>
        )}

        {prayer.scriptureAnchor && (
          <TouchableOpacity
            style={styles.scriptureChip}
            onPress={handleVersePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="book-outline"
              size={12}
              color={theme.colors.primary}
            />
            <Text style={styles.scriptureText}>
              {prayer.scriptureAnchor.book} {prayer.scriptureAnchor.chapter}:
              {prayer.scriptureAnchor.verse}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={10}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}

        <View style={styles.timelineFooter}>
          <View style={styles.dateInfo}>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={theme.colors.textMuted}
              />
              <Text style={styles.prayingSince}>Started: {formattedDate}</Text>
            </View>
            {isAnswered && answeredDate && (
              <View style={styles.dateRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={theme.colors.success}
                />
                <Text
                  style={[styles.prayingSince, { color: theme.colors.success }]}
                >
                  Answered: {answeredDate}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            {!isAnswered ? (
              <>
                {/* Reminder button */}
                {onSetReminder && (
                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      hasReminder && styles.iconButtonActive,
                    ]}
                    onPress={() => onSetReminder(prayer)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={hasReminder ? "notifications" : "notifications-outline"}
                      size={16}
                      color={hasReminder ? theme.colors.primary : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
                
                {/* Mark answered button */}
                <TouchableOpacity
                  style={styles.answeredButton}
                  onPress={() => onMarkAnswered(prayer.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.text}
                  />
                  <Text style={styles.answeredButtonText}>God Answered!</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* View testimony button for answered prayers */
              onViewTestimony && (
                <TouchableOpacity
                  style={styles.testimonyButton}
                  onPress={() => onViewTestimony(prayer)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="share-outline"
                    size={16}
                    color={theme.colors.success}
                  />
                  <Text style={styles.testimonyButtonText}>Share Testimony</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineItem: { flexDirection: "row", marginBottom: theme.spacing.md },
  timelineConnector: {
    alignItems: "center",
    width: 24,
    marginRight: theme.spacing.sm,
  },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
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
  timelineContentAnswered: { borderColor: theme.colors.successAlpha[20] },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeActive: { backgroundColor: "rgba(236, 72, 153, 0.15)" },
  statusBadgeAnswered: { backgroundColor: theme.colors.successAlpha[20] },
  statusBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  timelineDate: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
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
    flexDirection: "row",
    alignItems: "center",
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
    fontStyle: "italic",
    lineHeight: theme.fontSize.sm * 1.4,
  },
  scriptureChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateInfo: { flex: 1, gap: theme.spacing.xs },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  prayingSince: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  answeredButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  answeredButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconButtonActive: {
    backgroundColor: theme.colors.primaryAlpha[15],
    borderColor: theme.colors.primary,
  },
  testimonyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.successAlpha[15],
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.success + "30",
  },
  testimonyButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.success,
  },
});
