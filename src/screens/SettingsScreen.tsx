/**
 * SettingsScreen - Personalization & Preferences
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Settings help personalize the Scripture experience
 */

import React, { useState } from 'react';
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
import { Translation, TRANSLATIONS } from '../types';
import { navigateToBibleReference } from '../lib/navigationHelpers';

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
      {TRANSLATIONS.map((t, index) => (
        <TouchableOpacity
          key={t.id}
          style={[
            styles.pickerOption,
            value === t.id && styles.pickerOptionSelected,
            index === TRANSLATIONS.length - 1 && styles.pickerOptionLast,
          ]}
          onPress={() => onChange(t.id)}
        >
          <View style={styles.pickerOptionContent}>
            <Text
              style={[
                styles.pickerOptionText,
                value === t.id && styles.pickerOptionTextSelected,
              ]}
            >
              {t.id}
            </Text>
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

  const [showPhilosophy, setShowPhilosophy] = useState(false);

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
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Personalize your experience</Text>
        </View>

        {/* Scripture Settings */}
        <SectionHeader title="Scripture" />
        <View style={styles.section}>
          <Text style={styles.sectionInnerLabel}>Preferred Translation</Text>
          <TranslationPicker
            value={preferences.preferredTranslation}
            onChange={(t) => updatePreferences({ preferredTranslation: t })}
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
                onValueChange={(value) =>
                  updatePreferences({ dailyDevotional: value })
                }
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
            iconColor="#8B5CF6"
            label="Evening Examen"
            description="Reminder at 9:00 PM"
            rightElement={
              <Switch
                value={preferences.eveningExamen}
                onValueChange={(value) =>
                  updatePreferences({ eveningExamen: value })
                }
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
                onValueChange={(value) =>
                  updatePreferences({ notificationsEnabled: value })
                }
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
            isLast
            onPress={handleSignOut}
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
            iconColor="#EF4444"
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
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
