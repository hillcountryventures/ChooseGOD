/**
 * StreakMilestoneModal - Celebrate streak achievements
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Celebrating consistency in walking with God.
 */

import React, { useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../lib/theme';
import { logger } from '../utils/logger';

export interface StreakMilestone {
  days: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  scripture: string;
  scriptureRef: string;
  gradient: [string, string];
  badge: string;
}

// Milestone definitions
export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    title: 'Three Days In!',
    description: "You're building a rhythm with God. Small steps, big faithfulness.",
    icon: 'leaf',
    scripture: 'The Lord directs the steps of the godly. He delights in every detail of their lives.',
    scriptureRef: 'Psalm 37:23 (NLT)',
    gradient: ['#34D399', '#10B981'],
    badge: '🌱',
  },
  {
    days: 7,
    title: 'One Week Strong!',
    description: 'You\'ve spent 7 consecutive days in God\'s Word. This is the foundation of a lifelong habit.',
    icon: 'flame',
    scripture: 'For where two or three gather in my name, there am I with them.',
    scriptureRef: 'Matthew 18:20',
    gradient: ['#F59E0B', '#D97706'],
    badge: '🔥',
  },
  {
    days: 14,
    title: 'Two Weeks of Faith!',
    description: 'Two weeks of daily devotion. You\'re building spiritual muscle.',
    icon: 'trending-up',
    scripture: 'But grow in the grace and knowledge of our Lord and Savior Jesus Christ.',
    scriptureRef: '2 Peter 3:18',
    gradient: ['#10B981', '#059669'],
    badge: '📈',
  },
  {
    days: 30,
    title: 'One Month Milestone!',
    description: 'A full month walking with God daily. This is no longer a habit—it\'s who you are.',
    icon: 'star',
    scripture: 'I have hidden your word in my heart that I might not sin against you.',
    scriptureRef: 'Psalm 119:11',
    gradient: ['#6366F1', '#4F46E5'],
    badge: '⭐',
  },
  {
    days: 60,
    title: 'Two Months Deep!',
    description: 'Sixty days of faithfulness. Your roots are growing deep.',
    icon: 'leaf',
    scripture: 'Blessed is the one who does not walk in step with the wicked... but whose delight is in the law of the Lord.',
    scriptureRef: 'Psalm 1:1-2',
    gradient: ['#22C55E', '#16A34A'],
    badge: '🌿',
  },
  {
    days: 100,
    title: 'Century Club!',
    description: '100 days of daily devotion. You\'re among the most committed believers using ChooseGOD.',
    icon: 'trophy',
    scripture: 'I have fought the good fight, I have finished the race, I have kept the faith.',
    scriptureRef: '2 Timothy 4:7',
    gradient: ['#EAB308', '#CA8A04'],
    badge: '🏆',
  },
  {
    days: 365,
    title: 'Year of Devotion!',
    description: 'An entire year walking with God every single day. This is extraordinary faithfulness.',
    icon: 'ribbon',
    scripture: 'The Lord himself goes before you and will be with you; he will never leave you nor forsake you.',
    scriptureRef: 'Deuteronomy 31:8',
    gradient: ['#EC4899', '#DB2777'],
    badge: '👑',
  },
];

/**
 * Get the milestone for a given streak count (if any)
 */
export function getMilestoneForStreak(streak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find(m => m.days === streak) || null;
}

/**
 * Get the next milestone for a given streak
 */
export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find(m => m.days > currentStreak) || null;
}

interface StreakMilestoneModalProps {
  visible: boolean;
  milestone: StreakMilestone | null;
  onClose: () => void;
}

export function StreakMilestoneModal({ visible, milestone, onClose }: StreakMilestoneModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && milestone) {
      // Trigger haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate in
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(badgeScale, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      badgeScale.setValue(0);
    }
  }, [visible, milestone]);

  const handleShare = async () => {
    if (!milestone) return;
    
    try {
      await Share.share({
        message: `🎉 ${milestone.title}\n\nI just hit a ${milestone.days}-day streak on ChooseGOD!\n\n"${milestone.scripture}" — ${milestone.scriptureRef}\n\n#ChooseGOD #BibleStudy #Faith`,
      });
    } catch (error) {
      logger.error('Error sharing milestone:', error);
    }
  };

  if (!milestone) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={milestone.gradient}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Badge */}
            <Animated.View style={[
              styles.badgeContainer,
              { transform: [{ scale: badgeScale }, { rotate: spin }] }
            ]}>
              <Text style={styles.badge}>{milestone.badge}</Text>
            </Animated.View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name={milestone.icon} size={48} color="#fff" />
            </View>

            {/* Content */}
            <Text style={styles.streakCount}>{milestone.days} Days</Text>
            <Text style={styles.title}>{milestone.title}</Text>
            <Text style={styles.description}>{milestone.description}</Text>

            {/* Scripture */}
            <View style={styles.scriptureContainer}>
              <Ionicons name="book-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.scripture}>{`\u201C${milestone.scripture}\u201D`}</Text>
              <Text style={styles.scriptureRef}>— {milestone.scriptureRef}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>Share Achievement</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -20,
    right: 20,
  },
  badge: {
    fontSize: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  streakCount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  scriptureContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  scripture: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  scriptureRef: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  shareButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
});
