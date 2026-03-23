/**
 * ObedienceStepCard - Display active faith commitments
 *
 * Philosophy: "Be doers of the word, and not hearers only" - James 1:22
 * This component surfaces actionable steps that emerged from Scripture.
 */

import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../lib/theme";
import { ObedienceStep } from "../types";

// Time helper
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function getDueStatus(
  dueDate?: Date,
): { text: string; urgent: boolean } | null {
  if (!dueDate) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Overdue", urgent: true };
  if (diffDays === 0) return { text: "Due today", urgent: true };
  if (diffDays === 1) return { text: "Due tomorrow", urgent: true };
  if (diffDays < 7) return { text: `${diffDays} days left`, urgent: false };
  return { text: `${Math.ceil(diffDays / 7)} weeks left`, urgent: false };
}

interface ObedienceStepCardProps {
  step: ObedienceStep;
  onComplete: (step: ObedienceStep) => void;
  onPress?: (step: ObedienceStep) => void;
  compact?: boolean;
}

export function ObedienceStepCard({
  step,
  onComplete,
  onPress,
  compact = false,
}: ObedienceStepCardProps) {
  const scaleAnim = React.useMemo(() => new Animated.Value(1), []);

  const handleComplete = useCallback(async () => {
    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onComplete(step);
  }, [step, onComplete, scaleAnim]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(step);
  }, [step, onPress]);

  const dueStatus = getDueStatus(step.dueDate);
  const relativeTime = getRelativeTime(step.createdAt);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.compactCheckbox}>
          <TouchableOpacity
            style={styles.checkboxButton}
            onPress={handleComplete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.checkboxInner} />
          </TouchableOpacity>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactCommitment} numberOfLines={1}>
            {step.commitment}
          </Text>
          {dueStatus && (
            <Text
              style={[
                styles.compactMeta,
                dueStatus.urgent && styles.urgentText,
              ]}
            >
              {dueStatus.text}
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleComplete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.checkbox}>
              <View style={styles.checkboxDot} />
            </View>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.textContent}>
            <Text style={styles.commitment}>{step.commitment}</Text>

            {/* Meta row */}
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.metaText}>{relativeTime}</Text>
              </View>

              {dueStatus && (
                <View
                  style={[
                    styles.metaBadge,
                    dueStatus.urgent && styles.urgentBadge,
                  ]}
                >
                  <Ionicons
                    name={
                      dueStatus.urgent ? "alert-circle" : "calendar-outline"
                    }
                    size={12}
                    color={
                      dueStatus.urgent
                        ? theme.colors.error
                        : theme.colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.metaText,
                      dueStatus.urgent && styles.urgentText,
                    ]}
                  >
                    {dueStatus.text}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action footer */}
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.addNoteButton} onPress={handlePress}>
            <Ionicons
              name="pencil-outline"
              size={14}
              color={theme.colors.textMuted}
            />
            <Text style={styles.addNoteText}>Add reflection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={theme.colors.success}
            />
            <Text style={styles.completeText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Completed step variant
interface CompletedStepCardProps {
  step: ObedienceStep;
  onPress?: (step: ObedienceStep) => void;
  showCelebration?: boolean;
}

export function CompletedStepCard({
  step,
  onPress,
  showCelebration = false,
}: CompletedStepCardProps) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(step);
  }, [step, onPress]);

  const completedAt = step.completedAt
    ? getRelativeTime(step.completedAt)
    : "Recently";

  return (
    <TouchableOpacity
      style={[styles.completedCard, showCelebration && styles.celebrationCard]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {showCelebration && (
        <View style={styles.celebrationBadge}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationEmoji}>✨</Text>
        </View>
      )}

      <View style={styles.completedContent}>
        <View style={styles.completedCheckmark}>
          <Ionicons name="checkmark" size={18} color="#fff" />
        </View>

        <View style={styles.completedText}>
          <View style={styles.completedTitleRow}>
            <Text style={styles.completedCommitment}>{step.commitment}</Text>
            <Text style={styles.completedBadge}>✓ Done</Text>
          </View>

          {step.reflection ? (
            <Text style={styles.reflectionText} numberOfLines={2}>
              &ldquo;{step.reflection}&rdquo;
            </Text>
          ) : (
            <Text style={styles.completedMeta}>Completed {completedAt}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Main Card
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  cardContent: {
    flexDirection: "row",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  checkboxContainer: {
    paddingTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success + "40",
  },
  textContent: {
    flex: 1,
  },
  commitment: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.4,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  urgentBadge: {
    backgroundColor: theme.colors.errorAlpha[15],
  },
  urgentText: {
    color: theme.colors.error,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addNoteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.successAlpha[15],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  completeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.success,
  },

  // Compact Card
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  compactCheckbox: {
    width: 24,
    height: 24,
  },
  checkboxButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success + "40",
  },
  compactContent: {
    flex: 1,
  },
  compactCommitment: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  compactMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  // Completed Card
  completedCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    opacity: 0.85,
  },
  celebrationCard: {
    backgroundColor: theme.colors.successAlpha[15],
    borderColor: theme.colors.success + "30",
    opacity: 1,
  },
  celebrationBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: "row",
    gap: 2,
  },
  celebrationEmoji: {
    fontSize: 14,
  },
  completedContent: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  completedCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    flex: 1,
  },
  completedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  completedCommitment: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
    textDecorationLine: "line-through",
    flex: 1,
  },
  completedBadge: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.success,
  },
  completedMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  reflectionText: {
    fontSize: theme.fontSize.sm,
    fontStyle: "italic",
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
    lineHeight: theme.fontSize.sm * 1.4,
  },
});

export default ObedienceStepCard;
