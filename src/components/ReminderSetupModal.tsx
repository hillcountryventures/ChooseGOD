/**
 * ReminderSetupModal - Wayfarer Bible Reading Reminder Setup
 *
 * A modal that appears when users enroll in the 365-day reading plan.
 * Captures their preferred reminder time for daily notifications.
 *
 * Philosophy: "When shall we meet?" - Making the commitment feel personal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';

interface ReminderSetupModalProps {
  visible: boolean;
  onConfirm: (selectedTime: Date) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export default function ReminderSetupModal({
  visible,
  onConfirm,
  onSkip,
  isLoading = false,
}: ReminderSetupModalProps) {
  // Default to 7:00 AM
  const getDefaultTime = () => {
    const date = new Date();
    date.setHours(7, 0, 0, 0);
    return date;
  };

  const [selectedTime, setSelectedTime] = useState<Date>(getDefaultTime());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && date) {
        setSelectedTime(date);
      }
    } else if (date) {
      setSelectedTime(date);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm(selectedTime);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight] as [string, string]}
                style={styles.iconGradient}
              >
                <Ionicons name="notifications" size={32} color="#fff" />
              </LinearGradient>
            </View>

            {/* Title & Description */}
            <Text style={styles.title}>When shall we meet?</Text>
            <Text style={styles.description}>
              Consistency is the key to a transformed heart. Choose a quiet time for your daily reading.
            </Text>

            {/* Time Picker */}
            <View style={styles.pickerContainer}>
              {Platform.OS === 'android' && !showPicker ? (
                <TouchableOpacity
                  style={styles.androidTimeButton}
                  onPress={() => setShowPicker(true)}
                >
                  <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.androidTimeText}>{formatTime(selectedTime)}</Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  style={styles.picker}
                  textColor={theme.colors.text}
                  themeVariant="dark"
                />
              )}
            </View>

            {/* Suggested Times */}
            <View style={styles.suggestedTimes}>
              <Text style={styles.suggestedLabel}>Popular times:</Text>
              <View style={styles.suggestedRow}>
                {[
                  { label: '6:00 AM', hours: 6 },
                  { label: '7:00 AM', hours: 7 },
                  { label: '9:00 PM', hours: 21 },
                ].map((preset) => {
                  const isSelected = selectedTime.getHours() === preset.hours && selectedTime.getMinutes() === 0;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      style={[styles.suggestedChip, isSelected && styles.suggestedChipSelected]}
                      onPress={() => {
                        const newTime = new Date();
                        newTime.setHours(preset.hours, 0, 0, 0);
                        setSelectedTime(newTime);
                      }}
                    >
                      <Text style={[styles.suggestedChipText, isSelected && styles.suggestedChipTextSelected]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  {isLoading ? (
                    <Text style={styles.primaryButtonText}>Setting up...</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.primaryButtonText}>Set Reminder & Begin</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkip}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.skipButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>

            {/* Privacy Note */}
            <Text style={styles.privacyNote}>
              You can change this anytime in Settings
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },

  // Icon
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title & Description
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.lg,
  },

  // Picker
  pickerContainer: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  picker: {
    height: 150,
    width: '100%',
  },
  androidTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  androidTimeText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  // Suggested Times
  suggestedTimes: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  suggestedLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  suggestedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  suggestedChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestedChipSelected: {
    backgroundColor: theme.colors.primaryAlpha[20],
    borderColor: theme.colors.primary,
  },
  suggestedChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  suggestedChipTextSelected: {
    color: theme.colors.primary,
  },

  // Actions
  actions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  primaryButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  skipButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },

  // Privacy Note
  privacyNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
