/**
 * SettingsScreen - Personalization & Preferences
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Settings help personalize the Scripture experience
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";

// Extracted settings components
import {
  SettingRow,
  SectionHeader,
  PhilosophyModal,
  TranslationPicker,
  FontSizePicker,
} from "../components/settings";
import { useSettingsHandlers } from "../components/settings/useSettingsHandlers";
import { RedeemGiftModal } from "../components/settings/RedeemGiftModal";

export default function SettingsScreen() {
  const [showRedeemGift, setShowRedeemGift] = React.useState(false);
  const {
    preferences,
    updatePreferences,
    isPremium,
    isRestoring,
    isDeleting,
    isExporting,
    isSchedulingNotification,
    showPhilosophy,
    showPaywall,
    setShowPhilosophy,
    navigation,
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
  } = useSettingsHandlers();

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
            onPress={isRestoring ? undefined : handleRestorePurchases}
            rightElement={
              isRestoring ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : undefined
            }
          />
          <SettingRow
            icon="ticket-outline"
            iconColor={theme.colors.accent}
            label="Redeem a Gift Code"
            description="Activate a gift of ChooseGOD Pro"
            isLast
            onPress={() => setShowRedeemGift(true)}
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

      {/* Redeem Gift Modal */}
      <RedeemGiftModal
        visible={showRedeemGift}
        onClose={() => setShowRedeemGift(false)}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles (layout only; component styles in extracted files)
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
