/**
 * HomeScreen - Daily Launchpad
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen answers: "What does God have for me today?"
 *
 * Grok/X-Inspired UX:
 * - Minimal: 4 primary elements max
 * - Bold: Large typography hierarchy
 * - Quick: Tappable verse, floating ask bar
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";
import { useStore } from "../store/useStore";
import { BottomTabParamList, RootStackParamList } from "../types";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { navigateToBibleVerse } from "../lib/navigationHelpers";
import { useUserProfile, getFirstName } from "../hooks/useUserProfile";
import { useAuthStore } from "../store/authStore";
import WayfarerProgressCard from "../components/WayfarerProgressCard";
import ReminderSetupModal from "../components/ReminderSetupModal";
import GraceSummaryModal, {
  GraceSummaryData,
} from "../components/GraceSummaryModal";
import {
  useReadingPlanStore,
  useActiveProgress,
  useTodaysReading,
  useWayfarerState,
} from "../store/readingPlanStore";
import {
  requestPermissions,
  scheduleWayfarerReminder,
} from "../lib/notifications";
import { supabase } from "../lib/supabase";
import { DailyFocusCarousel } from "../components/DailyFocusCarousel";
import { StreakMilestoneModal } from "../components/StreakMilestoneModal";
import { useStreakMilestone } from "../hooks/useStreakMilestone";
import { useTrackScreen } from "../hooks/useAnalytics";
import { useGreeting } from "../hooks/useGreeting";
import { logger } from "../utils/logger";
import { useTrialStore } from "../store/trialStore";
import { useIsPremium } from "../store/subscriptionStore";
import { TrialEndPaywall } from "../components/TrialEndPaywall";
import { StreakFreezeModal } from "../components/StreakFreezeModal";
import { useStreakStore } from "../store/streakStore";

// Extracted home section components
import {
  HeroVerseCard,
  ProverbsOfTheDay,
  StreakBar,
  AskTheBibleButton,
  ContextualCard,
  ActiveStepsSection,
  ContinueReadingBanner,
} from "../components/home";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

// ============================================================================
// Main HomeScreen
// ============================================================================
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);
  const { profile } = useUserProfile();

  // Analytics
  useTrackScreen("home");

  // Use centralized greeting hook
  const greeting = useGreeting();

  // Reminder modal state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Grace Path modal state
  const [showGraceSummaryModal, setShowGraceSummaryModal] = useState(false);
  const [graceSummaryLoading, setGraceSummaryLoading] = useState(false);
  const [graceSummaryError, setGraceSummaryError] = useState<string | null>(
    null,
  );
  const [graceSummaryData, setGraceSummaryData] =
    useState<GraceSummaryData | null>(null);

  // Reading plan state
  const activeProgress = useActiveProgress();
  const todaysReading = useTodaysReading();
  const wayfarerState = useWayfarerState();
  const {
    applyGracePath,
    applyPatientPath,
    enrollInPlan,
    fetchAvailablePlans,
  } = useReadingPlanStore();

  // Get personalized first name (from profile or email)
  const firstName = getFirstName(
    profile?.displayName ?? null,
    user?.email ?? null,
  );

  // Streak milestone celebration
  const recentMoments = useStore((state) => state.recentMoments);
  const currentStreak = Math.min(recentMoments.length, 365);
  const { showMilestone, pendingMilestone, dismissMilestone } =
    useStreakMilestone(currentStreak);

  // Trial end paywall - show after 3-day free trial expires
  const isPremium = useIsPremium();
  const shouldShowTrialEndPaywall = useTrialStore((s) => s.shouldShowTrialEndPaywall);
  const [showTrialPaywall, setShowTrialPaywall] = useState(false);

  // Check on mount if trial has ended
  React.useEffect(() => {
    if (!isPremium && shouldShowTrialEndPaywall()) {
      // Small delay to let home screen render first
      const timer = setTimeout(() => {
        setShowTrialPaywall(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, shouldShowTrialEndPaywall]);

  // Streak freeze - show when streak is at risk
  const checkStreakStatus = useStreakStore((s) => s.checkStreakStatus);
  const recordActivity = useStreakStore((s) => s.recordActivity);
  const streakCurrentValue = useStreakStore((s) => s.currentStreak);
  const [showStreakFreezeModal, setShowStreakFreezeModal] = useState(false);
  const [streakFreezeChecked, setStreakFreezeChecked] = useState(false);

  // Check streak status on mount
  React.useEffect(() => {
    if (streakFreezeChecked) return;
    
    const status = checkStreakStatus();
    if (status === 'at_risk' && streakCurrentValue > 0) {
      // Show freeze modal after a delay
      const timer = setTimeout(() => {
        setShowStreakFreezeModal(true);
        setStreakFreezeChecked(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (status === 'active') {
      setStreakFreezeChecked(true);
    }
  }, [checkStreakStatus, streakCurrentValue, streakFreezeChecked]);

  const handleStreakLost = () => {
    // Reset streak in store will happen naturally
    setShowStreakFreezeModal(false);
  };

  // Wayfarer handlers
  const handleStartReading = () => {
    if (todaysReading) {
      const firstRef = todaysReading.versesJson[0];
      if (firstRef) {
        navigateToBibleVerse(navigation, firstRef.book, firstRef.startChapter);
      }
    }
  };

  const handleGracePath = async () => {
    if (!activeProgress || !user?.id) return;

    setShowGraceSummaryModal(true);
    setGraceSummaryLoading(true);
    setGraceSummaryError(null);
    setGraceSummaryData(null);

    try {
      const missedSections = wayfarerState.missedReadingTitles.map(
        (title, index) => {
          const dayNumber =
            activeProgress.currentDay - wayfarerState.daysMissed + index;
          return {
            dayNumber,
            displayTitle: title,
            versesJson: parseDisplayTitleToVerseRefs(title),
          };
        },
      );

      const { data, error } = await supabase.functions.invoke(
        "grace-path-summary",
        {
          body: {
            userId: user.id,
            progressId: activeProgress.progressId,
            missedSections,
            preferredTranslation: "KJV",
          },
        },
      );

      if (error) throw error;

      if (data?.success && data?.summary) {
        setGraceSummaryData({
          summary: data.summary,
          daysCovered: data.daysCovered || missedSections.length,
          chaptersCovered: data.chaptersCovered || [],
        });
        await applyGracePath(activeProgress.progressId, data.summary);
      } else {
        throw new Error(data?.error || "Failed to generate summary");
      }
    } catch (error) {
      logger.error("Grace Path error:", error);
      setGraceSummaryError(
        error instanceof Error
          ? error.message
          : "Failed to generate summary. Please try again.",
      );
    } finally {
      setGraceSummaryLoading(false);
    }
  };

  const parseDisplayTitleToVerseRefs = (
    title: string,
  ): Array<{ book: string; startChapter: number; endChapter: number }> => {
    const match = title.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)(?:-(\d+))?$/);
    if (match) {
      const book = match[1].trim();
      const startChapter = parseInt(match[2], 10);
      const endChapter = match[3] ? parseInt(match[3], 10) : startChapter;
      return [{ book, startChapter, endChapter }];
    }
    return [];
  };

  const handlePatientPath = async () => {
    if (activeProgress) {
      await applyPatientPath(activeProgress.progressId);
    }
  };

  const handleGraceSummaryContinue = () => {
    setShowGraceSummaryModal(false);
    if (todaysReading) {
      const firstRef = todaysReading.versesJson[0];
      if (firstRef) {
        navigateToBibleVerse(navigation, firstRef.book, firstRef.startChapter);
      }
    }
  };

  const handleGraceSummaryClose = () => {
    setShowGraceSummaryModal(false);
  };

  const handleEnrollPress = () => {
    setShowReminderModal(true);
  };

  const handleEnrollWithReminder = async (selectedTime: Date) => {
    if (!user?.id) return;

    setIsEnrolling(true);
    try {
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        await scheduleWayfarerReminder({
          hours: selectedTime.getHours(),
          minutes: selectedTime.getMinutes(),
        });
      }

      await fetchAvailablePlans();
      const plans = useReadingPlanStore.getState().availablePlans;
      const canonicalPlan = plans.find((p) => p.slug === "canonical-365");

      if (canonicalPlan) {
        await enrollInPlan(user.id, canonicalPlan.id);
      }

      setShowReminderModal(false);
    } catch (error) {
      logger.error("Error enrolling with reminder:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleEnrollSkipReminder = async () => {
    if (!user?.id) return;

    setIsEnrolling(true);
    try {
      await fetchAvailablePlans();
      const plans = useReadingPlanStore.getState().availablePlans;
      const canonicalPlan = plans.find((p) => p.slug === "canonical-365");

      if (canonicalPlan) {
        await enrollInPlan(user.id, canonicalPlan.id);
      }

      setShowReminderModal(false);
    } catch (error) {
      logger.error("Error enrolling:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting} accessibilityRole="header">
              {greeting}
              {firstName ? `, ${firstName}` : ""}
            </Text>
            <Text style={styles.subtitle}>
              What&apos;s on your heart today?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Continue Reading Banner */}
        <ContinueReadingBanner />

        {/* Daily Focus Carousel */}
        <DailyFocusCarousel>
          <HeroVerseCard />
          <WayfarerProgressCard
            onStartReading={handleStartReading}
            onGracePath={handleGracePath}
            onPatientPath={handlePatientPath}
            onEnrollPress={handleEnrollPress}
          />
          <ProverbsOfTheDay />
        </DailyFocusCarousel>

        {/* Minimal Streak */}
        <StreakBar />

        {/* Active Obedience Steps */}
        <ActiveStepsSection />

        {/* Contextual Action Card */}
        <ContextualCard />

        {/* Ask the Bible Button */}
        <AskTheBibleButton />

        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Reminder Setup Modal for Wayfarer enrollment */}
      <ReminderSetupModal
        visible={showReminderModal}
        onConfirm={handleEnrollWithReminder}
        onSkip={handleEnrollSkipReminder}
        isLoading={isEnrolling}
      />

      {/* Grace Path Summary Modal */}
      <GraceSummaryModal
        visible={showGraceSummaryModal}
        isLoading={graceSummaryLoading}
        error={graceSummaryError}
        summaryData={graceSummaryData}
        onContinueReading={handleGraceSummaryContinue}
        onClose={handleGraceSummaryClose}
      />

      {/* Streak Milestone Celebration */}
      <StreakMilestoneModal
        visible={showMilestone}
        milestone={pendingMilestone}
        onClose={dismissMilestone}
      />

      {/* Trial End Paywall - shows after 3-day free trial */}
      <TrialEndPaywall
        visible={showTrialPaywall}
        onClose={() => setShowTrialPaywall(false)}
        onSuccess={() => setShowTrialPaywall(false)}
      />

      {/* Streak Freeze Modal - shows when streak is at risk */}
      <StreakFreezeModal
        visible={showStreakFreezeModal}
        currentStreak={streakCurrentValue}
        onClose={() => setShowStreakFreezeModal(false)}
        onStreakLost={handleStreakLost}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles (header + layout only; section styles moved to components)
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
