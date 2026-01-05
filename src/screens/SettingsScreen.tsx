import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { Translation, TRANSLATIONS } from '../types';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({
  icon,
  iconColor = theme.colors.textSecondary,
  label,
  value,
  onPress,
  rightElement,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={styles.settingLabel}>{label}</Text>
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

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function TranslationPicker({
  value,
  onChange,
}: {
  value: Translation;
  onChange: (t: Translation) => void;
}) {
  return (
    <View style={styles.pickerContainer}>
      {TRANSLATIONS.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={[
            styles.pickerOption,
            value === t.id && styles.pickerOptionSelected,
          ]}
          onPress={() => onChange(t.id)}
        >
          <Text
            style={[
              styles.pickerOptionText,
              value === t.id && styles.pickerOptionTextSelected,
            ]}
          >
            {t.id}
          </Text>
          {value === t.id && (
            <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FontSizePicker({
  value,
  onChange,
}: {
  value: 'small' | 'medium' | 'large';
  onChange: (size: 'small' | 'medium' | 'large') => void;
}) {
  const sizes: Array<{ id: 'small' | 'medium' | 'large'; label: string }> = [
    { id: 'small', label: 'Small' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' },
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
            ]}
          >
            {size.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const clearMessages = useStore((state) => state.clearMessages);

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
        </View>

        {/* Bible Settings */}
        <SectionHeader title="Bible" />
        <View style={styles.section}>
          <Text style={styles.settingLabel}>Preferred Translation</Text>
          <TranslationPicker
            value={preferences.preferredTranslation}
            onChange={(t) => updatePreferences({ preferredTranslation: t })}
          />
        </View>

        {/* Display Settings */}
        <SectionHeader title="Display" />
        <View style={styles.section}>
          <Text style={styles.settingLabel}>Font Size</Text>
          <FontSizePicker
            value={preferences.fontSize}
            onChange={(size) => updatePreferences({ fontSize: size })}
          />
        </View>

        {/* Spiritual Practices */}
        <SectionHeader title="Spiritual Practices" />
        <View style={styles.section}>
          <SettingRow
            icon="sunny"
            iconColor={theme.colors.accent}
            label="Daily Devotional Reminder"
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
            label="Evening Examen Reminder"
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
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingRow
            icon="notifications"
            label="Push Notifications"
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

        {/* Data */}
        <SectionHeader title="Data" />
        <View style={styles.section}>
          <SettingRow
            icon="trash-outline"
            iconColor={theme.colors.error}
            label="Clear Chat History"
            onPress={() => {
              clearMessages();
            }}
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingRow
            icon="information-circle-outline"
            label="Version"
            value="1.0.0"
          />
          <SettingRow
            icon="heart-outline"
            iconColor="#EF4444"
            label="Made with love for God's glory"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Your word is a lamp for my feet, a light on my path."
          </Text>
          <Text style={styles.footerVerse}>Psalm 119:105</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sectionHeader: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: theme.spacing.md,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
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
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  pickerOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  pickerOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  segmentOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  segmentOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  segmentOptionTextSelected: {
    color: theme.colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footerVerse: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
});
