/**
 * PrayersScreen - Track Prayers Written & Answered
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen answers: "How is God responding to my prayers?"
 *
 * Two Balanced Views:
 * - Timeline: Unified chronological list of all prayers (active + answered)
 * - Calendar: Monthly view with prayer activity and stats
 *
 * Sub-components extracted to ./prayers/ folder.
 */

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";
import { useStore } from "../store/useStore";
import { PrayerRequest, RootStackParamList } from "../types";
import { PrayerEntryModal } from "../components/PrayerEntryModal";
import { AnsweredPrayerModal } from "../components/AnsweredPrayerModal";
import { CelebrationOverlay } from "../components/CelebrationOverlay";
import { useTrackScreen } from "../hooks/useAnalytics";

import { TimelineView } from "./prayers/TimelineView";
import { CalendarView } from "./prayers/CalendarView";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = "timeline" | "calendar";

// ============================================================================
// Tab Button
// ============================================================================
function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text
        style={[styles.tabButtonText, active && styles.tabButtonTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Main PrayersScreen
// ============================================================================
export default function PrayersScreen() {
  useTrackScreen("prayers");
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>("timeline");
  const [showPrayerEntry, setShowPrayerEntry] = useState(false);
  const [showAnsweredModal, setShowAnsweredModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(
    null,
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const activePrayers = useStore((state) => state.activePrayers);
  const updatePrayer = useStore((state) => state.updatePrayer);

  // Calculate answered count for header badge
  const answeredCount = useMemo(
    () => activePrayers.filter((p) => p.status === "answered").length,
    [activePrayers],
  );

  const handleMarkAnswered = (id: string) => {
    const prayer = activePrayers.find((p) => p.id === id);
    if (prayer) {
      setSelectedPrayer(prayer);
      setShowAnsweredModal(true);
    }
  };

  const handleConfirmAnswered = (reflection: string) => {
    if (selectedPrayer) {
      updatePrayer(selectedPrayer.id, {
        status: "answered",
        answeredAt: new Date(),
        answeredReflection: reflection || undefined,
      });
    }
    setShowAnsweredModal(false);
    setSelectedPrayer(null);
    // Show celebration overlay
    setShowCelebration(true);
  };

  const handleAddPrayer = () => {
    setShowPrayerEntry(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Prayers</Text>
          <Text style={styles.subtitle}>Your conversation with God</Text>
        </View>
        <View style={styles.headerRight}>
          {answeredCount > 0 && (
            <View style={styles.answeredBadge}>
              <Ionicons name="trophy" size={14} color={theme.colors.success} />
              <Text style={styles.answeredBadgeText}>{answeredCount}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.circlesButton}
            onPress={() => navigation.navigate("PrayerCircles")}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPrayer}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TabButton
          active={activeTab === "timeline"}
          label="Timeline"
          onPress={() => setActiveTab("timeline")}
        />
        <TabButton
          active={activeTab === "calendar"}
          label="Calendar"
          onPress={() => setActiveTab("calendar")}
        />
      </View>

      {/* Content */}
      {activeTab === "timeline" && (
        <TimelineView
          prayers={activePrayers}
          onMarkAnswered={handleMarkAnswered}
          onAddPrayer={handleAddPrayer}
        />
      )}
      {activeTab === "calendar" && <CalendarView prayers={activePrayers} />}

      {/* Prayer Entry Modal */}
      <PrayerEntryModal
        visible={showPrayerEntry}
        onClose={() => setShowPrayerEntry(false)}
      />

      {/* Answered Prayer Modal */}
      <AnsweredPrayerModal
        visible={showAnsweredModal}
        prayer={selectedPrayer}
        onClose={() => {
          setShowAnsweredModal(false);
          setSelectedPrayer(null);
        }}
        onConfirm={handleConfirmAnswered}
      />

      {/* Celebration Overlay */}
      <CelebrationOverlay
        visible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
        title="Prayer Answered!"
        subtitle="God is faithful!"
        showScripture={true}
        icon="trophy"
        iconColor={theme.colors.success}
        autoDismissMs={6000}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  answeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.successAlpha[20],
    borderRadius: theme.borderRadius.full,
  },
  answeredBadgeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  circlesButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: "center",
    alignItems: "center",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.text,
  },
});
