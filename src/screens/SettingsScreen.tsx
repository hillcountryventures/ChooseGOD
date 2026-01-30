/**
 * SettingsScreen - Personalization & Preferences
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Settings help personalize the Scripture experience
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";
import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/authStore";
import {
  useSubscriptionStore,
  useIsPremium,
  useIsRestoring,
} from "../store/subscriptionStore";
import { Translation } from "../types";
import { navigateToBibleReference } from "../lib/navigationHelpers";
import {
  requestPermissions,
  scheduleMorningDevotional,
  scheduleEveningReflection,
  areNotificationsEnabled,
} from "../lib/notifications";
import { updateUserProfile, supabase } from "../lib/supabase";
import { logger } from "../utils/logger";

// Extracted settings components
import {
  SettingRow,
  SectionHeader,
  PhilosophyModal,
  TranslationPicker,
  FontSizePicker,
} from "../components/settings";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const clearMessages = useStore((state) => state.clearMessages);
  const _recentMoments = useStore((state) => state.recentMoments);
  const _activePrayers = useStore((state) => state.activePrayers);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const isDeleting = useAuthStore((state) => state.isDeleting);
  const user = useAuthStore((state) => state.user);

  // Subscription state
  const isPremium = useIsPremium();
  const isRestoring = useIsRestoring();
  const restorePurchases = useSubscriptionStore(
    (state) => state.restorePurchases,
  );
  const showPaywall = useSubscriptionStore((state) => state.showPaywall);

  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [isSchedulingNotification, setIsSchedulingNotification] =
    useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle translation change
  const handleTranslationChange = useCallback(
    async (translation: Translation) => {
      updatePreferences({ preferredTranslation: translation });
      if (user?.id) {
        await updateUserProfile(user.id, {
          preferredTranslation: translation,
        });
      }
    },
    [updatePreferences, user?.id],
  );

  // Handle notification toggle changes
  const handleNotificationToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            "Notifications Disabled",
            "Please enable notifications in your device settings to receive reminders.",
            [{ text: "OK" }],
          );
          return;
        }
      }
      updatePreferences({ notificationsEnabled: enabled });
    },
    [updatePreferences],
  );

  // Handle morning devotional toggle
  const handleMorningDevotionalToggle = useCallback(
    async (enabled: boolean) => {
      setIsSchedulingNotification(true);
      try {
        if (enabled) {
          const notificationsEnabled = await areNotificationsEnabled();
          if (!notificationsEnabled) {
            const granted = await requestPermissions();
            if (!granted) {
              Alert.alert(
                "Enable Notifications",
                "Please enable notifications to receive morning devotional reminders.",
                [{ text: "OK" }],
              );
              setIsSchedulingNotification(false);
              return;
            }
            updatePreferences({ notificationsEnabled: true });
          }
          await scheduleMorningDevotional({ hours: 7, minutes: 0 });
        }
        updatePreferences({ dailyDevotional: enabled });
      } catch (error) {
        logger.error("Error toggling morning devotional:", error);
        Alert.alert("Error", "Failed to update notification settings.");
      } finally {
        setIsSchedulingNotification(false);
      }
    },
    [updatePreferences],
  );

  // Handle evening examen toggle
  const handleEveningExamenToggle = useCallback(
    async (enabled: boolean) => {
      setIsSchedulingNotification(true);
      try {
        if (enabled) {
          const notificationsEnabled = await areNotificationsEnabled();
          if (!notificationsEnabled) {
            const granted = await requestPermissions();
            if (!granted) {
              Alert.alert(
                "Enable Notifications",
                "Please enable notifications to receive evening reflection reminders.",
                [{ text: "OK" }],
              );
              setIsSchedulingNotification(false);
              return;
            }
            updatePreferences({ notificationsEnabled: true });
          }
          await scheduleEveningReflection({ hours: 21, minutes: 0 });
        }
        updatePreferences({ eveningExamen: enabled });
      } catch (error) {
        logger.error("Error toggling evening reflection:", error);
        Alert.alert("Error", "Failed to update notification settings.");
      } finally {
        setIsSchedulingNotification(false);
      }
    },
    [updatePreferences],
  );

  // Handle clear chat with confirmation
  const handleClearChat = () => {
    Alert.alert(
      "Clear Chat History",
      "This will remove all messages from your chat. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearMessages();
            Alert.alert("Done", "Chat history has been cleared.");
          },
        },
      ],
    );
  };

  // Handle export data
  const handleExportData = async () => {
    Alert.alert(
      "Export Your Data",
      "This will download ALL your ChooseGOD data including prayers, journal entries, reading progress, and settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            setIsExporting(true);
            try {
              const { data, error } =
                await supabase.functions.invoke("export-user-data");
              if (error)
                throw new Error(error.message || "Failed to export data");
              if (!data) throw new Error("No data returned from export");

              const timestamp = new Date().toISOString().split("T")[0];
              await Share.share({
                message: JSON.stringify(data, null, 2),
                title: `ChooseGOD Data Export - ${timestamp}`,
              });
            } catch (err) {
              logger.error("[ExportData] Error:", err);
              Alert.alert(
                "Export Failed",
                err instanceof Error
                  ? err.message
                  : "Failed to export your data. Please try again.",
                [{ text: "OK" }],
              );
            } finally {
              setIsExporting(false);
            }
          },
        },
      ],
    );
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This will remove all your data including:\n\n• Reading progress\n• Journal entries\n• Prayer requests\n• Chat history\n• All preferences\n\nThis action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Type DELETE to confirm. Your account and all data will be permanently removed.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete Everything",
                  style: "destructive",
                  onPress: async () => {
                    const result = await deleteAccount();
                    if (result.success) {
                      Alert.alert(
                        "Account Deleted",
                        "Your account has been permanently deleted. We hope to see you again.",
                        [{ text: "OK" }],
                      );
                    } else {
                      Alert.alert(
                        "Error",
                        result.error ||
                          "Failed to delete account. Please try again.",
                        [{ text: "OK" }],
                      );
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  // Handle restore purchases
  const handleRestorePurchases = useCallback(async () => {
    const result = await restorePurchases();
    Alert.alert(
      result.success ? "Restored!" : "No Subscription Found",
      result.message,
      [{ text: "OK" }],
    );
  }, [restorePurchases]);

  // Handle manage subscription
  const handleManageSubscription = useCallback(() => {
    Linking.openURL("https://apps.apple.com/account/subscriptions");
  }, []);

  // Handle footer verse tap
  const handleFooterVersePress = () => {
    navigateToBibleReference(navigation, "Psalm 119:105");
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
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Personalize your experience</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scripture Settings */}
        <SectionHeader title="Scripture" />
        <View style={styles.section}>
          <Text style={styles.sectionInnerLabel}>Preferred Translation</Text>
          <TranslationPicker
            value={preferences.preferredTranslation}
            onChange={handleTranslationChange}
          />
          <View style={styles.divider} />
          <Text style={styles.sectionInnerLabel}>Font Size</Text>
          <FontSizePicker
            value={preferences.fontSize}
            onChange={(size) => updatePreferences({ fontSize: size })}
          />
        </View>

        {/* Daily Practice */}
        <SectionHeader title="Daily Practice" />
        <View style={styles.section}>
          <SettingRow
            icon="sunny"
            iconColor={theme.colors.accent}
            label="Morning Devotional"
            description="Reminder at 7:00 AM"
            rightElement={
              <Switch
                value={preferences.dailyDevotional}
                onValueChange={handleMorningDevotionalToggle}
                disabled={isSchedulingNotification}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.text}
              />
            }
          />
          <SettingRow
            icon="moon"
            iconColor={theme.colors.gradient.end}
            label="Evening Reflection"
            description="Reminder at 9:00 PM"
            rightElement={
              <Switch
                value={preferences.eveningExamen}
                onValueChange={handleEveningExamenToggle}
                disabled={isSchedulingNotification}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.text}
              />
            }
          />
          <SettingRow
            icon="notifications"
            iconColor={theme.colors.info}
            label="Notifications"
            description="Enable push notifications"
            isLast
            rightElement={
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={handleNotificationToggle}
                disabled={isSchedulingNotification}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.text}
              />
            }
          />
        </View>

        {/* Subscription */}
        <SectionHeader title="Subscription" />
        <View style={styles.section}>
          <SettingRow
            icon="sparkles"
            iconColor={theme.colors.accent}
            label={isPremium ? "ChooseGOD Pro" : "Upgrade to Pro"}
            description={
              isPremium ? "You have unlimited access" : "Unlock all features"
            }
            onPress={isPremium ? undefined : showPaywall}
            rightElement={
              isPremium ? (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              ) : undefined
            }
          />
          {isPremium && (
            <SettingRow
              icon="card-outline"
              iconColor={theme.colors.textSecondary}
              label="Manage Subscription"
              description="View or cancel in App Store"
              onPress={handleManageSubscription}
            />
          )}
          <SettingRow
            icon="refresh-outline"
            iconColor={theme.colors.info}
            label={isRestoring ? "Restoring..." : "Restore Purchases"}
            description="Recover your subscription"
            isLast
            onPress={isRestoring ? undefined : handleRestorePurchases}
            rightElement={
              isRestoring ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : undefined
            }
          />
        </View>

        {/* Share */}
        <SectionHeader title="Share" />
        <View style={styles.section}>
          <SettingRow
            icon="gift-outline"
            iconColor={theme.colors.accent}
            label="Invite Friends"
            description="Give 7 days Pro, get 7 days free"
            isLast
            onPress={() => navigation.navigate("Referral")}
          />
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingRow
            icon="download-outline"
            iconColor={theme.colors.success}
            label={isExporting ? "Exporting..." : "Export Data"}
            description="Download all your data (GDPR)"
            onPress={isExporting ? undefined : handleExportData}
          />
          <SettingRow
            icon="trash-outline"
            iconColor={theme.colors.error}
            label="Clear Chat History"
            description="Remove all messages"
            onPress={handleClearChat}
          />
          <SettingRow
            icon="log-out-outline"
            iconColor={theme.colors.textSecondary}
            label="Sign Out"
            onPress={handleSignOut}
          />
          <SettingRow
            icon="person-remove-outline"
            iconColor={theme.colors.error}
            label={isDeleting ? "Deleting..." : "Delete Account"}
            description="Permanently remove all data"
            isLast
            onPress={isDeleting ? undefined : handleDeleteAccount}
          />
        </View>

        {/* Privacy & Legal */}
        <SectionHeader title="Privacy & Legal" />
        <View style={styles.section}>
          <SettingRow
            icon="shield-checkmark-outline"
            iconColor={theme.colors.primary}
            label="Privacy & Data"
            description="Manage analytics and crash reporting"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => (navigation as any).navigate("ConsentManagement")}
          />
          <SettingRow
            icon="document-text-outline"
            iconColor={theme.colors.textSecondary}
            label="Privacy Policy"
            onPress={() => Linking.openURL("https://choosegod.app/privacy")}
          />
          <SettingRow
            icon="reader-outline"
            iconColor={theme.colors.textSecondary}
            label="Terms of Service"
            isLast
            onPress={() => Linking.openURL("https://choosegod.app/terms")}
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingRow
            icon="information-circle-outline"
            iconColor={theme.colors.textSecondary}
            label="Version"
            value="1.0.0"
          />
          <SettingRow
            icon="heart"
            iconColor={theme.colors.error}
            label="Our Philosophy"
            description="We are not God, only helping others find HIM"
            onPress={() => setShowPhilosophy(true)}
          />
          <SettingRow
            icon="bug-outline"
            iconColor={theme.colors.textMuted}
            label="Subscription Debug"
            description="Troubleshoot subscription issues"
            isLast
            onPress={() => (navigation as any).navigate("SubscriptionDebug")}
          />
        </View>

        {/* Footer - Tappable Scripture */}
        <TouchableOpacity
          style={styles.footer}
          onPress={handleFooterVersePress}
          activeOpacity={0.7}
        >
          <View style={styles.footerQuote}>
            <Ionicons
              name="book-outline"
              size={16}
              color={theme.colors.textMuted}
            />
          </View>
          <Text style={styles.footerText}>
            &quot;Your word is a lamp for my feet, a light on my path.&quot;
          </Text>
          <View style={styles.footerVerseRow}>
            <Text style={styles.footerVerse}>Psalm 119:105</Text>
            <Ionicons
              name="arrow-forward"
              size={12}
              color={theme.colors.primary}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Philosophy Modal */}
      <PhilosophyModal
        visible={showPhilosophy}
        onClose={() => setShowPhilosophy(false)}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles (layout only; component styles moved to extracted files)
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
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
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
  section: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionInnerLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  footerQuote: {
    marginBottom: theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: theme.fontSize.md * 1.5,
  },
  footerVerseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  footerVerse: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  proBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  proBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textInverse,
    letterSpacing: 0.5,
  },
});
