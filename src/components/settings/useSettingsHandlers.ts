/**
 * useSettingsHandlers - All settings screen action handlers
 */

import { useState, useCallback } from "react";
import { Alert, Share, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Translation } from "../../types";
import { useStore } from "../../store/useStore";
import { useAuthStore } from "../../store/authStore";
import {
  useSubscriptionStore,
  useIsPremium,
  useIsRestoring,
} from "../../store/subscriptionStore";
import {
  requestPermissions,
  scheduleMorningDevotional,
  scheduleEveningReflection,
  areNotificationsEnabled,
} from "../../lib/notifications";
import { updateUserProfile, supabase } from "../../lib/supabase";
import { navigateToBibleReference } from "../../lib/navigationHelpers";
import { logger } from "../../utils/logger";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useSettingsHandlers() {
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

  const handleClearChat = useCallback(() => {
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
  }, [clearMessages]);

  const handleExportData = useCallback(async () => {
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
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
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
  }, [deleteAccount]);

  const handleRestorePurchases = useCallback(async () => {
    const result = await restorePurchases();
    Alert.alert(
      result.success ? "Restored!" : "No Subscription Found",
      result.message,
      [{ text: "OK" }],
    );
  }, [restorePurchases]);

  const handleManageSubscription = useCallback(() => {
    Linking.openURL("https://apps.apple.com/account/subscriptions");
  }, []);

  const handleFooterVersePress = useCallback(() => {
    navigateToBibleReference(navigation, "Psalm 119:105");
  }, [navigation]);

  return {
    // State
    preferences,
    updatePreferences,
    isPremium,
    isRestoring,
    isDeleting,
    isExporting,
    isSchedulingNotification,
    showPhilosophy,
    showPaywall,

    // Setters
    setShowPhilosophy,

    // Navigation
    navigation,

    // Handlers
    handleTranslationChange,
    handleNotificationToggle,
    handleMorningDevotionalToggle,
    handleEveningExamenToggle,
    handleClearChat,
    handleExportData,
    handleSignOut,
    handleDeleteAccount,
    handleRestorePurchases,
    handleManageSubscription,
    handleFooterVersePress,
  };
}
