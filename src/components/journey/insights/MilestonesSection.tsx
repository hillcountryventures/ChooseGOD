import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../lib/theme";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  scripture: string;
  scriptureRef: string;
  achievedAt?: Date;
}

interface NextMilestone {
  title: string;
  icon: string;
  current: number;
  target: number;
  progress: number;
  description: string;
}

interface MilestonesSectionProps {
  isPremium: boolean;
  showPaywall: () => void;
  totalAchieved: number;
  nextMilestone: NextMilestone | null;
  recentAchievements: Milestone[];
}

export function MilestonesSection({
  isPremium,
  showPaywall,
  totalAchieved,
  nextMilestone,
  recentAchievements,
}: MilestonesSectionProps) {
  return (
    <View style={styles.milestonesSection}>
      <View style={styles.milestonesSectionHeader}>
        <Ionicons name="trophy" size={20} color={theme.colors.accent} />
        <Text style={styles.sectionTitle}>Milestones & Altars</Text>
        {!isPremium && (
          <TouchableOpacity onPress={showPaywall} style={styles.proBadge}>
            <Ionicons
              name="lock-closed"
              size={10}
              color={theme.colors.accent}
            />
            <Text style={styles.proBadgeText}>Pro</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.milestonesSubtitle}>
        Biblical altars commemorate encounters with God • {totalAchieved}{" "}
        achieved
      </Text>

      {nextMilestone && (
        <View style={styles.nextMilestoneCard}>
          <View style={styles.nextMilestoneHeader}>
            <Ionicons
              name={nextMilestone.icon as any}
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.nextMilestoneInfo}>
              <Text style={styles.nextMilestoneTitle}>
                {nextMilestone.title}
              </Text>
              <Text style={styles.nextMilestoneProgress}>
                {nextMilestone.current} / {nextMilestone.target}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${nextMilestone.progress}%` },
              ]}
            />
          </View>
          <Text style={styles.nextMilestoneDescription}>
            {nextMilestone.description}
          </Text>
        </View>
      )}

      {recentAchievements.length > 0 ? (
        <View>
          <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          {recentAchievements.slice(0, isPremium ? 5 : 3).map((milestone) => (
            <View key={milestone.id} style={styles.milestoneCard}>
              <View style={styles.milestoneCardHeader}>
                <Ionicons
                  name={milestone.icon as any}
                  size={20}
                  color={theme.colors.accent}
                />
                <Text style={styles.milestoneCardTitle}>{milestone.title}</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.success}
                />
              </View>
              <Text style={styles.milestoneCardDescription}>
                {milestone.description}
              </Text>
              <View style={styles.milestoneScripture}>
                <Text style={styles.milestoneScriptureText}>
                  &ldquo;{milestone.scripture}&rdquo;
                </Text>
                <Text style={styles.milestoneScriptureRef}>
                  — {milestone.scriptureRef}
                </Text>
              </View>
              {milestone.achievedAt && (
                <Text style={styles.milestoneDate}>
                  Achieved{" "}
                  {milestone.achievedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              )}
              {isPremium && (
                <TouchableOpacity style={styles.shareAltarButton}>
                  <Ionicons
                    name="share-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.shareAltarButtonText}>
                    Share Altar Card
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noMilestonesText}>
          Keep engaging with God&apos;s Word and your first milestone will
          appear here soon!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  milestonesSection: { marginTop: theme.spacing.md },
  milestonesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  nextMilestoneInfo: { flex: 1 },
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
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
  },
  progressBarFill: {
    height: "100%",
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
    flexDirection: "row",
    alignItems: "center",
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
    fontStyle: "italic",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
    padding: theme.spacing.lg,
    fontStyle: "italic",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.accentAlpha[15],
    borderRadius: theme.borderRadius.full,
    marginLeft: "auto",
  },
  proBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.semibold,
  },
});
