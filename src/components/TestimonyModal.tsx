/**
 * TestimonyModal - Celebrate and share answered prayers
 *
 * Shows:
 * - Journey stats (days prayed, total answered)
 * - Reflection on how God answered
 * - Share to social or within app
 * - Scripture encouragement
 *
 * Glass effect design, professional polish.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { theme } from '../lib/theme';
import { PrayerRequest } from '../types';
import { usePrayerPremiumStore } from '../store/prayerPremiumStore';
import { useStore } from '../store/useStore';
import { logger } from '../utils/logger';

// Encouraging scriptures for answered prayers
const CELEBRATION_SCRIPTURES = [
  { text: 'The Lord has done great things for us, and we are filled with joy.', ref: 'Psalm 126:3' },
  { text: 'You answered me when I called to you; you encouraged me by giving me strength.', ref: 'Psalm 138:3' },
  { text: 'Give thanks to the Lord, for he is good; his love endures forever.', ref: 'Psalm 107:1' },
  { text: 'Praise be to the Lord, for he has heard my cry for mercy.', ref: 'Psalm 28:6' },
  { text: 'I sought the Lord, and he answered me; he delivered me from all my fears.', ref: 'Psalm 34:4' },
];

interface TestimonyModalProps {
  visible: boolean;
  prayer: PrayerRequest | null;
  onClose: () => void;
}

export function TestimonyModal({ visible, prayer, onClose }: TestimonyModalProps) {
  const insets = useSafeAreaInsets();
  const activePrayers = useStore((s) => s.activePrayers);
  const calculateStats = usePrayerPremiumStore((s) => s.calculateStats);
  const markTestimonyShared = usePrayerPremiumStore((s) => s.markTestimonyShared);
  const hasSharedTestimony = usePrayerPremiumStore((s) => s.hasSharedTestimony);

  const scaleAnim = useMemo(() => new Animated.Value(0), []);
  const [scripture] = useState(() => 
    CELEBRATION_SCRIPTURES[Math.floor(Math.random() * CELEBRATION_SCRIPTURES.length)]
  );

  const stats = useMemo(() => calculateStats(activePrayers), [activePrayers, calculateStats]);

  useEffect(() => {
    if (visible && prayer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, prayer]);

  if (!prayer) return null;

  const createdDate = new Date(prayer.createdAt);
  const answeredDate = prayer.answeredAt ? new Date(prayer.answeredAt) : new Date();
  const daysPrayed = Math.max(1, Math.floor(
    (answeredDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  ));

  const handleShare = async () => {
    try {
      const message = prayer.answeredReflection
        ? `God answered my prayer after ${daysPrayed} days.\n\n"${prayer.answeredReflection}"\n\n"${scripture.text}" — ${scripture.ref}\n\n#ChooseGOD #Testimony`
        : `God answered my prayer after ${daysPrayed} days of faithful waiting.\n\n"${scripture.text}" — ${scripture.ref}\n\n#ChooseGOD #Testimony`;

      await Share.share({ message });
      markTestimonyShared(prayer.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Share failed:', error);
    }
  };

  const alreadyShared = hasSharedTestimony(prayer.id);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <Animated.View
          style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.2)', 'transparent']}
              style={styles.gradientOverlay}
            />

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* Header icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-done" size={40} color={theme.colors.success} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Prayer Answered</Text>
            <Text style={styles.subtitle}>
              God moved after {daysPrayed} {daysPrayed === 1 ? 'day' : 'days'}
            </Text>

            {/* Original prayer */}
            <View style={styles.prayerCard}>
              <Text style={styles.prayerText} numberOfLines={3}>
                "{prayer.request}"
              </Text>
            </View>

            {/* Reflection */}
            {prayer.answeredReflection && (
              <View style={styles.reflectionCard}>
                <Ionicons name="heart" size={16} color={theme.colors.success} />
                <Text style={styles.reflectionText}>
                  {prayer.answeredReflection}
                </Text>
              </View>
            )}

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.answeredPrayers}</Text>
                <Text style={styles.statLabel}>Answered</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalPrayers}</Text>
                <Text style={styles.statLabel}>Total Prayers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.avgDaysToAnswer > 0 ? stats.avgDaysToAnswer : '—'}
                </Text>
                <Text style={styles.statLabel}>Avg Days</Text>
              </View>
            </View>

            {/* Scripture */}
            <LinearGradient
              colors={[theme.colors.successAlpha[15], theme.colors.successAlpha[20]]}
              style={styles.scriptureCard}
            >
              <Ionicons name="book-outline" size={16} color={theme.colors.success} />
              <Text style={styles.scriptureText}>"{scripture.text}"</Text>
              <Text style={styles.scriptureRef}>— {scripture.ref}</Text>
            </LinearGradient>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Ionicons 
                  name={alreadyShared ? 'checkmark-circle' : 'share-outline'} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.shareButtonText}>
                  {alreadyShared ? 'Shared' : 'Share Testimony'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
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
    maxWidth: 360,
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
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.successAlpha[20],
    borderWidth: 2,
    borderColor: theme.colors.success + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    marginBottom: theme.spacing.lg,
  },
  prayerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '100%',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  prayerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },
  reflectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.successAlpha[15],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '100%',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  reflectionText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scriptureCard: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  scriptureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  scriptureRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  shareButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  doneButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});

export default TestimonyModal;
