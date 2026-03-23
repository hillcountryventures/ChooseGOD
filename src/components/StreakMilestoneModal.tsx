/**
 * StreakMilestoneModal - Celebrate streak achievements with rewards
 *
 * Glass effect design, no emojis. Professional polish.
 * Includes milestone rewards (temporary premium unlocks).
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../lib/theme';
import { logger } from '../utils/logger';
import { useStreakStore, MILESTONE_REWARDS, MilestoneReward } from '../store/streakStore';
import { useIsPremium } from '../store/subscriptionStore';

export interface StreakMilestone {
  days: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  scripture: string;
  scriptureRef: string;
  gradient: [string, string];
}

// Milestone definitions (no emojis)
export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    title: 'Three Days In',
    description: 'You\'re building a rhythm with God. Small steps, big faithfulness.',
    icon: 'leaf',
    scripture: 'The Lord directs the steps of the godly. He delights in every detail of their lives.',
    scriptureRef: 'Psalm 37:23',
    gradient: ['#34D399', '#10B981'],
  },
  {
    days: 7,
    title: 'One Week Strong',
    description: 'Seven consecutive days in God\'s Word. The foundation of a lifelong habit.',
    icon: 'flame',
    scripture: 'For where two or three gather in my name, there am I with them.',
    scriptureRef: 'Matthew 18:20',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    days: 14,
    title: 'Two Weeks of Faith',
    description: 'Two weeks of daily devotion. You\'re building spiritual muscle.',
    icon: 'trending-up',
    scripture: 'But grow in the grace and knowledge of our Lord and Savior Jesus Christ.',
    scriptureRef: '2 Peter 3:18',
    gradient: ['#10B981', '#059669'],
  },
  {
    days: 30,
    title: 'One Month Milestone',
    description: 'A full month walking with God daily. This is no longer a habit — it\'s who you are.',
    icon: 'star',
    scripture: 'I have hidden your word in my heart that I might not sin against you.',
    scriptureRef: 'Psalm 119:11',
    gradient: ['#6366F1', '#4F46E5'],
  },
  {
    days: 60,
    title: 'Two Months Deep',
    description: 'Sixty days of faithfulness. Your roots are growing deep.',
    icon: 'leaf',
    scripture: 'Blessed is the one who does not walk in step with the wicked... but whose delight is in the law of the Lord.',
    scriptureRef: 'Psalm 1:1-2',
    gradient: ['#22C55E', '#16A34A'],
  },
  {
    days: 100,
    title: 'Century Club',
    description: '100 days of daily devotion. You\'re among the most committed believers.',
    icon: 'trophy',
    scripture: 'I have fought the good fight, I have finished the race, I have kept the faith.',
    scriptureRef: '2 Timothy 4:7',
    gradient: ['#EAB308', '#CA8A04'],
  },
  {
    days: 365,
    title: 'Year of Devotion',
    description: 'An entire year walking with God every single day. Extraordinary faithfulness.',
    icon: 'ribbon',
    scripture: 'The Lord himself goes before you and will be with you; he will never leave you nor forsake you.',
    scriptureRef: 'Deuteronomy 31:8',
    gradient: ['#EC4899', '#DB2777'],
  },
];

export function getMilestoneForStreak(streak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.days === streak) || null;
}

export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak) || null;
}

interface StreakMilestoneModalProps {
  visible: boolean;
  milestone: StreakMilestone | null;
  onClose: () => void;
}

export function StreakMilestoneModal({
  visible,
  milestone,
  onClose,
}: StreakMilestoneModalProps) {
  const scaleAnim = useMemo(() => new Animated.Value(0), []);
  const iconScale = useMemo(() => new Animated.Value(0), []);
  const isPremium = useIsPremium();
  const claimMilestoneReward = useStreakStore((s) => s.claimMilestoneReward);
  const claimedMilestones = useStreakStore((s) => s.claimedMilestones);

  // Check if this milestone has a reward
  const milestoneReward = milestone 
    ? MILESTONE_REWARDS.find(r => r.days === milestone.days)
    : null;
  const hasClaimedReward = milestone 
    ? claimedMilestones.includes(milestone.days)
    : false;

  useEffect(() => {
    if (visible && milestone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      iconScale.setValue(0);
    }
  }, [visible, milestone]);

  const handleShare = async () => {
    if (!milestone) return;

    try {
      await Share.share({
        message: `${milestone.title}\n\nI just hit a ${milestone.days}-day streak on ChooseGOD!\n\n"${milestone.scripture}" — ${milestone.scriptureRef}\n\n#ChooseGOD #Faith`,
      });
    } catch (error) {
      logger.error('Error sharing milestone:', error);
    }
  };

  const handleClaimReward = () => {
    if (!milestone || !milestoneReward || hasClaimedReward) return;
    
    const claimed = claimMilestoneReward(milestone.days);
    if (claimed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  };

  if (!milestone) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
        >
          {/* Glass background */}
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <LinearGradient
              colors={[...milestone.gradient.map(c => c + '40'), 'transparent']}
              style={styles.gradientOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            {/* Streak count badge */}
            <View style={styles.daysBadge}>
              <Text style={styles.daysNumber}>{milestone.days}</Text>
              <Text style={styles.daysLabel}>DAYS</Text>
            </View>

            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { 
                  transform: [{ scale: iconScale }],
                  backgroundColor: milestone.gradient[0] + '30',
                  borderColor: milestone.gradient[0] + '50',
                },
              ]}
            >
              <Ionicons 
                name={milestone.icon} 
                size={40} 
                color={milestone.gradient[0]} 
              />
            </Animated.View>

            {/* Content */}
            <Text style={styles.title}>{milestone.title}</Text>
            <Text style={styles.description}>{milestone.description}</Text>

            {/* Scripture */}
            <View style={styles.scriptureContainer}>
              <View style={styles.scriptureQuote}>
                <Ionicons
                  name="book-outline"
                  size={14}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.scripture}>
                  "{milestone.scripture}"
                </Text>
              </View>
              <Text style={styles.scriptureRef}>— {milestone.scriptureRef}</Text>
            </View>

            {/* Reward section (if applicable and not premium) */}
            {milestoneReward && !isPremium && !hasClaimedReward && (
              <View style={styles.rewardSection}>
                <View style={styles.rewardBadge}>
                  <Ionicons name="gift-outline" size={16} color={theme.colors.accent} />
                  <Text style={styles.rewardText}>Reward Unlocked</Text>
                </View>
                <Text style={styles.rewardDescription}>{milestoneReward.description}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              {milestoneReward && !isPremium && !hasClaimedReward ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: milestone.gradient[0] }]}
                  onPress={handleClaimReward}
                >
                  <Ionicons name="gift" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Claim Reward</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}
                >
                  <Ionicons name="share-outline" size={18} color={theme.colors.text} />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Continue</Text>
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
  daysBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  daysNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  daysLabel: {
    fontSize: 10,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
  },
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
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  scriptureContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  scriptureQuote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  scripture: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  scriptureRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  rewardSection: {
    backgroundColor: theme.colors.accentAlpha[10],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[30],
    width: '100%',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  rewardText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
  rewardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shareButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});
