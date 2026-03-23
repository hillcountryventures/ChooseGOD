/**
 * PrayerReminderModal - Set reminders for prayers (Premium)
 *
 * Allows users to:
 * - Set recurring reminders (daily, 3 days, weekly)
 * - View/remove existing reminders
 * - Premium feature with upgrade prompt for free users
 *
 * Glass effect design, professional polish.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { theme } from '../lib/theme';
import { PrayerRequest } from '../types';
import { 
  usePrayerPremiumStore, 
  REMINDER_INTERVALS,
  ReminderInterval,
} from '../store/prayerPremiumStore';
import { useIsPremium, useSubscriptionStore } from '../store/subscriptionStore';

interface PrayerReminderModalProps {
  visible: boolean;
  prayer: PrayerRequest | null;
  onClose: () => void;
}

export function PrayerReminderModal({ visible, prayer, onClose }: PrayerReminderModalProps) {
  const isPremium = useIsPremium();
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  
  const setReminder = usePrayerPremiumStore((s) => s.setReminder);
  const removeReminder = usePrayerPremiumStore((s) => s.removeReminder);
  const getReminder = usePrayerPremiumStore((s) => s.getReminder);
  
  const [selectedInterval, setSelectedInterval] = useState<ReminderInterval | null>(null);
  const existingReminder = prayer ? getReminder(prayer.id) : undefined;

  const requestNotificationPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  const handleSetReminder = async (interval: ReminderInterval) => {
    if (!isPremium) {
      onClose();
      showPaywall();
      return;
    }

    if (!prayer) return;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Notifications Disabled',
        'Enable notifications in Settings to receive prayer reminders.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedInterval(interval);
    await setReminder(prayer.id, interval);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const intervalConfig = REMINDER_INTERVALS.find((i) => i.id === interval);
    Alert.alert(
      'Reminder Set',
      `You'll be reminded to pray ${intervalConfig?.label.toLowerCase() || 'regularly'}.`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleRemoveReminder = async () => {
    if (!prayer) return;
    
    await removeReminder(prayer.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleUpgrade = () => {
    onClose();
    showPaywall();
  };

  if (!prayer) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="notifications" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Prayer Reminder</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Prayer preview */}
            <View style={styles.prayerPreview}>
              <Text style={styles.prayerText} numberOfLines={2}>
                "{prayer.request}"
              </Text>
            </View>

            {isPremium ? (
              <>
                {/* Interval options */}
                <Text style={styles.sectionLabel}>Remind me to pray</Text>
                <View style={styles.intervalOptions}>
                  {REMINDER_INTERVALS.map((interval) => {
                    const isActive = existingReminder?.interval === interval.id;
                    const isSelected = selectedInterval === interval.id;
                    
                    return (
                      <TouchableOpacity
                        key={interval.id}
                        style={[
                          styles.intervalButton,
                          (isActive || isSelected) && styles.intervalButtonActive,
                        ]}
                        onPress={() => handleSetReminder(interval.id)}
                      >
                        <Text style={[
                          styles.intervalButtonText,
                          (isActive || isSelected) && styles.intervalButtonTextActive,
                        ]}>
                          {interval.label}
                        </Text>
                        {isActive && (
                          <Ionicons 
                            name="checkmark-circle" 
                            size={18} 
                            color={theme.colors.primary} 
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Remove reminder if exists */}
                {existingReminder && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={handleRemoveReminder}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    <Text style={styles.removeButtonText}>Remove Reminder</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              // Non-premium: Show upgrade prompt
              <View style={styles.upgradeSection}>
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={24} color={theme.colors.accent} />
                </View>
                <Text style={styles.upgradeTitle}>Premium Feature</Text>
                <Text style={styles.upgradeDescription}>
                  Set reminders to pray for specific requests daily, every 3 days, or weekly.
                </Text>
                
                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              </View>
            )}
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  blurContainer: {
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  prayerPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  prayerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  intervalOptions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  intervalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  intervalButtonActive: {
    backgroundColor: theme.colors.primaryAlpha[15],
    borderColor: theme.colors.primary,
  },
  intervalButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  intervalButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  removeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
  },
  // Upgrade section
  upgradeSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  premiumBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  upgradeTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  upgradeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.full,
  },
  upgradeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});

export default PrayerReminderModal;
