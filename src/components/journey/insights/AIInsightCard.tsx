import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../lib/theme";
import { SpiritualMoment } from "../../../types";
import { GrowthInsight } from "../../../hooks/useGrowthInsights";

interface AIInsightCardProps {
  isPremium: boolean;
  showPaywall: () => void;
  cachedInsight: GrowthInsight | null;
  moments: SpiritualMoment[];
  isGenerating: boolean;
  insightError: string | null;
  onGenerateInsight: () => void;
}

export function AIInsightCard({
  isPremium,
  showPaywall,
  cachedInsight,
  moments,
  isGenerating,
  insightError,
  onGenerateInsight,
}: AIInsightCardProps) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons name="bulb" size={24} color={theme.colors.accent} />
        <Text style={styles.insightTitle}>AI Growth Insights</Text>
        {!isPremium && (
          <TouchableOpacity onPress={showPaywall} style={styles.proBadge}>
            <Ionicons
              name="lock-closed"
              size={12}
              color={theme.colors.accent}
            />
            <Text style={styles.proBadgeText}>Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      {cachedInsight ? (
        <View>
          <Text style={styles.insightText}>{cachedInsight.summary}</Text>
          {cachedInsight.scriptureConnection && (
            <View style={styles.insightScripture}>
              <Ionicons name="book" size={14} color={theme.colors.primary} />
              <Text style={styles.insightScriptureText}>
                {cachedInsight.scriptureConnection}
              </Text>
            </View>
          )}
          {cachedInsight.growthPrediction && (
            <View style={styles.insightPrediction}>
              <Ionicons
                name="trending-up"
                size={14}
                color={theme.colors.success}
              />
              <Text style={styles.insightPredictionText}>
                {cachedInsight.growthPrediction}
              </Text>
            </View>
          )}
          {cachedInsight.encouragement && (
            <Text style={styles.insightEncouragement}>
              {cachedInsight.encouragement}
            </Text>
          )}
          <TouchableOpacity
            style={styles.refreshInsightButton}
            onPress={onGenerateInsight}
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
                : "Upgrade to Pro to unlock AI-powered insights that connect your habits to scripture and predict your spiritual growth trajectory."}
            </Text>
          ) : (
            <Text style={styles.insightText}>
              As you continue your spiritual journey, AI-powered insights will
              appear here, connecting your habits to scripture and showing
              growth patterns.
            </Text>
          )}
          {insightError && (
            <Text style={styles.insightError}>{insightError}</Text>
          )}
          {isPremium && moments.length > 0 && (
            <TouchableOpacity
              style={styles.generateInsightButton}
              onPress={onGenerateInsight}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator size="small" color={theme.colors.text} />
                  <Text style={styles.generateInsightButtonText}>
                    Generating...
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.generateInsightButtonText}>
                    Generate Weekly Insight
                  </Text>
                  <Ionicons
                    name="sparkles"
                    size={16}
                    color={theme.colors.text}
                  />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    flexWrap: "wrap",
  },
  insightScripture: {
    flexDirection: "row",
    alignItems: "center",
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
    fontStyle: "italic",
    flexWrap: "wrap",
  },
  insightPrediction: {
    flexDirection: "row",
    alignItems: "center",
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
    flexWrap: "wrap",
  },
  insightEncouragement: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontStyle: "italic",
    lineHeight: theme.fontSize.sm * 1.5,
    flexWrap: "wrap",
  },
  insightError: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
  generateInsightButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
