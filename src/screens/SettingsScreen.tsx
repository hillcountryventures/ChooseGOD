/**
 * SettingsScreen - Personalization & Preferences
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Settings help personalize the Scripture experience
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { Translation, AVAILABLE_TRANSLATIONS } from '../types';
import { navigateToBibleReference } from '../lib/navigationHelpers';
import {
  requestPermissions,
  scheduleDevotionalReminder,
  cancelDevotionalReminders,
  areNotificationsEnabled,
} from '../lib/notifications';
import { updateUserProfile } from '../lib/supabase';

// ============================================================================
// Setting Row Component
// ============================================================================
interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

function SettingRow({
  icon,
  iconColor = theme.colors.textSecondary,
  label,
  value,
  description,
  onPress,
  rightElement,
  isLast = false,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, isLast && styles.settingRowLast]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconBg, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      {rightElement || (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {onPress && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textMuted}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Section Header
// ============================================================================
function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ============================================================================
// Translation Picker
// ============================================================================
function TranslationPicker({
  value,
  onChange,
}: {
  value: Translation;
  onChange: (t: Translation) => void;
}) {
  return (
    <View style={styles.pickerContainer}>
      {AVAILABLE_TRANSLATIONS.map((t, index) => (
        <TouchableOpacity
          key={t.id}
          style={[
            styles.pickerOption,
            value === t.id && styles.pickerOptionSelected,
            index === AVAILABLE_TRANSLATIONS.length - 1 && styles.pickerOptionLast,
          ]}
          onPress={() => onChange(t.id)}
        >
          <View style={styles.pickerOptionContent}>
            <View style={styles.pickerOptionHeader}>
              <Text
                style={[
                  styles.pickerOptionText,
                  value === t.id && styles.pickerOptionTextSelected,
                ]}
              >
                {t.id}
              </Text>
              <Text style={styles.pickerOptionLanguage}>{t.language}</Text>
            </View>
            <Text style={styles.pickerOptionDescription}>{t.description}</Text>
          </View>
          {value === t.id && (
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================================================
// Font Size Picker
// ============================================================================
function FontSizePicker({
  value,
  onChange,
}: {
  value: 'small' | 'medium' | 'large';
  onChange: (size: 'small' | 'medium' | 'large') => void;
}) {
  const sizes: Array<{ id: 'small' | 'medium' | 'large'; label: string; sample: number }> = [
    { id: 'small', label: 'Small', sample: 14 },
    { id: 'medium', label: 'Medium', sample: 16 },
    { id: 'large', label: 'Large', sample: 20 },
  ];

  return (
    <View style={styles.segmentContainer}>
      {sizes.map((size) => (
        <TouchableOpacity
          key={size.id}
          style={[
            styles.segmentOption,
            value === size.id && styles.segmentOptionSelected,
          ]}
          onPress={() => onChange(size.id)}
        >
          <Text
            style={[
              styles.segmentOptionText,
              value === size.id && styles.segmentOptionTextSelected,
              { fontSize: size.sample },
            ]}
          >
            Aa
          </Text>
          <Text style={[styles.segmentLabel, value === size.id && styles.segmentLabelSelected]}>
            {size.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================================================
// Philosophy Modal
// ============================================================================
function PhilosophyModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Our Philosophy</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.philosophySection}>
            <View style={styles.philosophyIconContainer}>
              <Ionicons name="book" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.philosophyTitle}>
              We are not God, only helping others find HIM
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              ChooseGOD is a tool, not a replacement for Scripture, church, or community.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              The AI companion is designed to point you back to God&apos;s Word, never to replace it.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              Every feature, every response, every interaction should lead you closer to Jesus.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              We believe the Bible is the inspired Word of God and the ultimate authority for faith and life.
            </Text>
          </View>

          <View style={styles.philosophyVerse}>
            <Text style={styles.philosophyVerseText}>
              &quot;All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.&quot;
            </Text>
            <Text style={styles.philosophyVerseRef}>— 2 Timothy 3:16</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ============================================================================
// Main Settings Screen
// ============================================================================
export default function SettingsScreen() {
  const navigation = useNavigation();
  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const clearMessages = useStore((state) => state.clearMessages);
  const recentMoments = useStore((state) => state.recentMoments);
  const activePrayers = useStore((state) => state.activePrayers);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const isDeleting = useAuthStore((state) => state.isDeleting);
  const user = useAuthStore((state) => state.user);

  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [isSchedulingNotification, setIsSchedulingNotification] = useState(false);

  // Handle translation change - updates local store and syncs to Supabase
  const handleTranslationChange = useCallback(async (translation: Translation) => {
    // Update local preferences immediately for responsive UI
    updatePreferences({ preferredTranslation: translation });

    // Sync to Supabase if user is logged in
    if (user?.id) {
      await updateUserProfile(user.id, { preferredTranslation: translation });
    }
  }, [updatePreferences, user?.id]);

  // Handle notification toggle changes
  const handleNotificationToggle = useCallback(async (enabled: boolean) => {
    if (enabled) {
      // Request permissions first
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    } else {
      // Cancel all notifications when disabled
      await cancelDevotionalReminders();
    }
    updatePreferences({ notificationsEnabled: enabled });
  }, [updatePreferences]);

  // Handle morning devotional toggle
  const handleMorningDevotionalToggle = useCallback(async (enabled: boolean) => {
    setIsSchedulingNotification(true);
    try {
      if (enabled) {
        // Check if notifications are enabled first
        const notificationsEnabled = await areNotificationsEnabled();
        if (!notificationsEnabled) {
          const granted = await requestPermissions();
          if (!granted) {
            Alert.alert(
              'Enable Notifications',
              'Please enable notifications to receive morning devotional reminders.',
              [{ text: 'OK' }]
            );
            setIsSchedulingNotification(false);
            return;
          }
          updatePreferences({ notificationsEnabled: true });
        }
        // Schedule morning reminder at 7:00 AM
        await scheduleDevotionalReminder({ hours: 7, minutes: 0 }, 'Morning Devotional');
      } else {
        // Cancel morning reminders
        await cancelDevotionalReminders();
      }
      updatePreferences({ dailyDevotional: enabled });
    } catch (error) {
      console.error('Error toggling morning devotional:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    } finally {
      setIsSchedulingNotification(false);
    }
  }, [updatePreferences]);

  // Handle evening examen toggle
  const handleEveningExamenToggle = useCallback(async (enabled: boolean) => {
    setIsSchedulingNotification(true);
    try {
      if (enabled) {
        // Check if notifications are enabled first
        const notificationsEnabled = await areNotificationsEnabled();
        if (!notificationsEnabled) {
          const granted = await requestPermissions();
          if (!granted) {
            Alert.alert(
              'Enable Notifications',
              'Please enable notifications to receive evening examen reminders.',
              [{ text: 'OK' }]
            );
            setIsSchedulingNotification(false);
            return;
          }
          updatePreferences({ notificationsEnabled: true });
        }
        // Schedule evening reminder at 9:00 PM
        await scheduleDevotionalReminder({ hours: 21, minutes: 0 }, 'Evening Examen');
      }
      updatePreferences({ eveningExamen: enabled });
    } catch (error) {
      console.error('Error toggling evening examen:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    } finally {
      setIsSchedulingNotification(false);
    }
  }, [updatePreferences]);

  // Handle clear chat with confirmation
  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'This will remove all messages from your chat. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearMessages();
            Alert.alert('Done', 'Chat history has been cleared.');
          },
        },
      ]
    );
  };

  // Handle export data
  const handleExportData = async () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      preferences,
      moments: recentMoments,
      prayers: activePrayers,
    };

    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: 'ChooseGOD Data Export',
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  // Handle delete account (Apple App Store requirement)
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This will remove all your data including:\n\n• Reading progress\n• Journal entries\n• Prayer requests\n• Chat history\n• All preferences\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Second confirmation for safety
            Alert.alert(
              'Final Confirmation',
              'Type DELETE to confirm. Your account and all data will be permanently removed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    const result = await deleteAccount();
                    if (result.success) {
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been permanently deleted. We hope to see you again.',
                        [{ text: 'OK' }]
                      );
                    } else {
                      Alert.alert(
                        'Error',
                        result.error || 'Failed to delete account. Please try again.',
                        [{ text: 'OK' }]
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Handle footer verse tap
  const handleFooterVersePress = () => {
    navigateToBibleReference(navigation, 'Psalm 119:105');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingRow
            icon="download-outline"
            iconColor={theme.colors.success}
            label="Export Data"
            description="Download your spiritual journey"
            onPress={handleExportData}
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
            isLast
            onPress={() => setShowPhilosophy(true)}
          />
        </View>

        {/* Footer - Tappable Scripture */}
        <TouchableOpacity
          style={styles.footer}
          onPress={handleFooterVersePress}
          activeOpacity={0.7}
        >
          <View style={styles.footerQuote}>
            <Ionicons name="book-outline" size={16} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.footerText}>
            &quot;Your word is a lamp for my feet, a light on my path.&quot;
          </Text>
          <View style={styles.footerVerseRow}>
            <Text style={styles.footerVerse}>Psalm 119:105</Text>
            <Ionicons name="arrow-forward" size={12} color={theme.colors.primary} />
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
// Styles
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  settingIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  settingValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  pickerContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  pickerOptionLast: {
    marginBottom: 0,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  pickerOptionContent: {
    flex: 1,
  },
  pickerOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pickerOptionLanguage: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  pickerOptionTextSelected: {
    color: theme.colors.primary,
  },
  pickerOptionDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  segmentOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  segmentOptionText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  segmentOptionTextSelected: {
    color: theme.colors.text,
  },
  segmentLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  segmentLabelSelected: {
    color: theme.colors.text,
  },
  footer: {
    alignItems: 'center',
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
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: theme.fontSize.md * 1.5,
  },
  footerVerseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  footerVerse: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalClose: {
    padding: theme.spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  philosophySection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  philosophyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  philosophyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: theme.fontSize.xl * 1.4,
  },
  philosophyPoint: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  philosophyText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
  },
  philosophyVerse: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  philosophyVerseText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.md * 1.5,
    textAlign: 'center',
  },
  philosophyVerseRef: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
