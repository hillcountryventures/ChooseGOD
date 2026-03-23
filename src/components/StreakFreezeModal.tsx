/**
 * StreakFreezeModal - Offer streak freeze when user misses a day
 *
 * Premium users can use 2 freezes per month.
 * Glass effect design, professional polish.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../lib/theme';
import { useStreakStore, FREEZES_PER_MONTH } from '../store/streakStore';
import { useIsPremium, useSubscriptionStore } from '../store/subscriptionStore';

interface StreakFreezeModalProps {
  visible: boolean;
  currentStreak: number;
  onClose: () => void;
  onStreakLost: () => void;
}

export function StreakFreezeModal({
  visible,
  currentStreak,
  onClose,
  onStreakLost,
}: StreakFreezeModalProps) {
  const isPremium = useIsPremium();
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const useStreakFreeze = useStreakStore((s) => s.useStreakFreeze);
  const canUseFreeze = useStreakStore((s) => s.canUseFreeze);
  const getFreezesRemaining = useStreakStore((s) => s.getFreezesRemaining);

  const freezesRemaining = getFreezesRemaining(isPremium);
  const canFreeze = canUseFreeze(isPremium);

  const handleUseFreeze = () => {
    if (!canFreeze) return;
    
    const success = useStreakFreeze();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    }
  };

  const handleUpgrade = () => {
    onClose();
    showPaywall();
  };

  const handleLoseStreak = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onStreakLost();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.2)', 'transparent']}
              style={styles.gradientOverlay}
            />

            {/* Warning icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="snow" size={40} color={theme.colors.info} />
            </View>

            {/* Content */}
            <Text style={styles.title}>You Missed Yesterday</Text>
            <Text style={styles.subtitle}>
              Your {currentStreak}-day streak is at risk
            </Text>

            {isPremium ? (
              // Premium user - can use freeze
              <>
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Ionicons name="snow-outline" size={18} color={theme.colors.info} />
                    <Text style={styles.infoText}>
                      Use a streak freeze to keep your progress
                    </Text>
                  </View>
                  <Text style={styles.freezeCount}>
                    {freezesRemaining} of {FREEZES_PER_MONTH} freezes remaining this month
                  </Text>
                </View>

                <View style={styles.actions}>
                  {canFreeze ? (
                    <TouchableOpacity
                      style={styles.freezeButton}
                      onPress={handleUseFreeze}
                    >
                      <Ionicons name="snow" size={20} color="#fff" />
                      <Text style={styles.freezeButtonText}>Use Streak Freeze</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noFreezesBox}>
                      <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} />
                      <Text style={styles.noFreezesText}>
                        No freezes remaining this month
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleLoseStreak}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {canFreeze ? 'Let it go, start fresh' : 'Start fresh'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Free user - show upgrade option
              <>
                <View style={styles.upgradeBox}>
                  <View style={styles.upgradeHeader}>
                    <Ionicons name="diamond-outline" size={20} color={theme.colors.accent} />
                    <Text style={styles.upgradeTitle}>Premium Feature</Text>
                  </View>
                  <Text style={styles.upgradeDescription}>
                    Life happens. Premium members get {FREEZES_PER_MONTH} streak freezes per month 
                    to protect their progress.
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={handleUpgrade}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade to Save Streak</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleLoseStreak}
                  >
                    <Text style={styles.secondaryButtonText}>Start fresh</Text>
                  </TouchableOpacity>
                </View>
              </>
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
    alignItems: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.info + '20',
    borderWidth: 2,
    borderColor: theme.colors.info + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '100%',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  freezeCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  upgradeBox: {
    backgroundColor: theme.colors.accentAlpha[10],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '100%',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[30],
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  upgradeTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
  upgradeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  noFreezesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.warning + '40',
  },
  noFreezesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  freezeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.info,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  freezeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  upgradeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  upgradeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});

export default StreakFreezeModal;
