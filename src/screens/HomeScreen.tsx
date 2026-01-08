/**
 * HomeScreen - Daily Launchpad
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen answers: "What does God have for me today?"
 *
 * Grok/X-Inspired UX:
 * - Minimal: 4 primary elements max
 * - Bold: Large typography hierarchy
 * - Quick: Tappable verse, floating ask bar
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { useDailyVerse } from '../hooks/useDailyVerse';
import { BottomTabParamList, RootStackParamList, ChatMode } from '../types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { navigateToBibleVerse, navigateToProverbsOfDay, openJournalCompose, openChatHub } from '../lib/navigationHelpers';
import { GREETING_HOURS } from '../constants/timing';
import { STREAK_LIMITS, BIBLE_LIMITS } from '../constants/limits';
import { WEEK_DAYS, GREETINGS, BIBLE_DEFAULTS } from '../constants/strings';
import { useChatQuota } from '../hooks/useChatQuota';
import { useUserProfile, getFirstName } from '../hooks/useUserProfile';
import { useAuthStore } from '../store/authStore';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

// ============================================================================
// Hero Verse Card - Tappable verse that opens Bible reader
// ============================================================================
function HeroVerseCard() {
  const navigation = useNavigation<NavigationProp>();
  const { dailyVerse, fetchDailyVerse, isLoading } = useDailyVerse();

  useEffect(() => {
    fetchDailyVerse();
  }, [fetchDailyVerse]);

  const handleVersePress = () => {
    if (!dailyVerse) return;
    // Navigate to Bible at this verse
    navigateToBibleVerse(
      navigation,
      dailyVerse.verse.book,
      dailyVerse.verse.chapter,
      dailyVerse.verse.verse
    );
  };

  const handleReflect = () => {
    if (!dailyVerse) return;
    openJournalCompose(navigation, {
      verse: {
        book: dailyVerse.verse.book,
        chapter: dailyVerse.verse.chapter,
        verse: dailyVerse.verse.verse,
        text: dailyVerse.verse.text,
        translation: BIBLE_DEFAULTS.translation,
      },
      source: {
        type: 'verse_reflection',
        referenceId: `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`,
      },
    });
  };

  const handleShare = async () => {
    if (!dailyVerse) return;
    const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;
    try {
      await Share.share({
        message: `"${dailyVerse.verse.text}"\n\n— ${reference}\n\nShared from ChooseGOD`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAskAboutVerse = () => {
    if (!dailyVerse) return;
    const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;
    openChatHub(navigation, {
      contextVerse: {
        book: dailyVerse.verse.book,
        chapter: dailyVerse.verse.chapter,
        verse: dailyVerse.verse.verse,
        text: dailyVerse.verse.text,
        translation: BIBLE_DEFAULTS.translation,
      },
      initialMessage: `Help me understand ${reference}: "${dailyVerse.verse.text}"`,
    });
  };

  if (isLoading || !dailyVerse) {
    return (
      <View style={styles.heroCard}>
        <LinearGradient colors={theme.colors.gradient.dark as [string, string]} style={styles.heroGradient}>
          <View style={styles.heroLoading}>
            <Ionicons name="book-outline" size={32} color={theme.colors.textMuted} />
            <Text style={styles.heroLoadingText}>Loading today&apos;s verse...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;

  return (
    <View style={styles.heroCard}>
      <LinearGradient colors={theme.colors.gradient.spiritual as [string, string]} style={styles.heroGradient}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTitleRow}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="sunny" size={14} color={theme.colors.accent} />
            </View>
            <Text style={styles.heroTitle}>VERSE OF THE DAY</Text>
          </View>
        </View>

        {/* Tappable verse text */}
        <TouchableOpacity onPress={handleVersePress} activeOpacity={0.8}>
          <Text style={styles.heroVerseText}>&quot;{dailyVerse.verse.text}&quot;</Text>
        </TouchableOpacity>

        {/* Tappable reference - navigates to Bible */}
        <TouchableOpacity
          onPress={handleVersePress}
          style={styles.heroReferenceRow}
          activeOpacity={0.7}
        >
          <Text style={styles.heroReference}>— {reference}</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.heroActionBtn} onPress={handleAskAboutVerse}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.heroActionText}>Ask</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroActionBtn} onPress={handleReflect}>
            <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.heroActionText}>Reflect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroActionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.heroActionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

// ============================================================================
// Proverbs of the Day - Compact tappable row
// ============================================================================
function ProverbsOfTheDay() {
  const navigation = useNavigation<NavigationProp>();
  const dayOfMonth = new Date().getDate();
  const proverbsChapter = Math.min(dayOfMonth, BIBLE_LIMITS.maxProverbsChapters);

  const handlePress = () => {
    navigateToProverbsOfDay(navigation);
  };

  return (
    <TouchableOpacity style={styles.proverbsCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.proverbsIconContainer}>
        <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.proverbsContent}>
        <Text style={styles.proverbsTitle}>Proverbs of the Day</Text>
        <Text style={styles.proverbsSubtitle}>Read Proverbs {proverbsChapter}</Text>
      </View>
      <View style={styles.proverbsChapterBadge}>
        <Text style={styles.proverbsChapterText}>{proverbsChapter}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

// ============================================================================
// Minimal Streak Bar - 7 circles showing weekly progress
// ============================================================================
function StreakBar() {
  const recentMoments = useStore((state) => state.recentMoments);

  // Calculate streak from recent moments
  const streak = Math.min(recentMoments.length, STREAK_LIMITS.weekDays);
  const today = new Date().getDay();

  return (
    <View style={styles.streakBar}>
      <View style={styles.streakHeader}>
        <View style={styles.streakTitleRow}>
          <Ionicons name="flame" size={18} color={theme.colors.accent} />
          <Text style={styles.streakTitle}>
            {streak > 0 ? `${streak} day streak` : GREETINGS.morning}
          </Text>
        </View>
      </View>
      <View style={styles.streakDays}>
        {WEEK_DAYS.map((day: string, index: number) => {
          const isCompleted = index <= today && streak > today - index;
          const isToday = index === today;
          return (
            <View
              key={index}
              style={[
                styles.streakDay,
                isCompleted && styles.streakDayCompleted,
                isToday && styles.streakDayToday,
              ]}
            >
              <Text style={[styles.streakDayText, isCompleted && styles.streakDayTextCompleted]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================================
// Ask the Bible Button - Primary entry point for AI chat
// Includes pulse animation when all 3 seeds are available
// ============================================================================
function AskTheBibleButton() {
  const navigation = useNavigation<NavigationProp>();
  const { seedsRemaining, totalSeeds, isPremium } = useChatQuota();

  // Pulse animation for when all seeds are available (draws attention)
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Only animate if all seeds are available (fresh day) and not premium
    if (seedsRemaining === totalSeeds && !isPremium) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      // Reset to normal scale
      pulseAnim.setValue(1);
    }
  }, [seedsRemaining, totalSeeds, isPremium, pulseAnim]);

  const handlePress = () => {
    openChatHub(navigation);
  };

  return (
    <Animated.View style={[styles.askBibleButton, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={[theme.colors.primary, '#818CF8'] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.askBibleGradient}
        >
          <View style={styles.askBibleIconContainer}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
          </View>
          <View style={styles.askBibleContent}>
            <Text style={styles.askBibleTitle}>Ask the Bible</Text>
            <Text style={styles.askBibleSubtitle}>
              {isPremium
                ? 'Unlimited questions & guidance'
                : seedsRemaining === totalSeeds
                  ? `${seedsRemaining} fresh seeds ready`
                  : `${seedsRemaining} seed${seedsRemaining !== 1 ? 's' : ''} remaining`}
            </Text>
          </View>
          {/* Seed indicator for free users */}
          {!isPremium && (
            <View style={styles.askBibleSeeds}>
              {Array.from({ length: totalSeeds }).map((_, i) => (
                <Text key={i} style={styles.askBibleSeedEmoji}>
                  {i < seedsRemaining ? '🌱' : '·'}
                </Text>
              ))}
            </View>
          )}
          <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// Contextual Card - Shows the most relevant action right now
// ============================================================================
function ContextualCard() {
  const navigation = useNavigation<NavigationProp>();
  const memoryVersesDue = useStore((state) => state.memoryVersesDue);
  const activePrayers = useStore((state) => state.activePrayers);
  const pendingObedienceSteps = useStore((state) => state.pendingObedienceSteps);

  // Priority: Memory verses > Obedience steps > Active prayers > Default devotional
  let card: {
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  } | null = null;

  const openChatWithMode = (mode: ChatMode) => {
    openChatHub(navigation, { contextMode: mode });
  };

  if (memoryVersesDue.length > 0) {
    card = {
      icon: 'bulb',
      iconBg: theme.colors.accent,
      title: 'Memory Review',
      subtitle: `${memoryVersesDue.length} verse${memoryVersesDue.length > 1 ? 's' : ''} ready to review`,
      onPress: () => openChatWithMode('memory'),
    };
  } else if (pendingObedienceSteps.length > 0) {
    card = {
      icon: 'checkmark-circle',
      iconBg: theme.colors.success,
      title: 'Follow Through',
      subtitle: `${pendingObedienceSteps.length} commitment${pendingObedienceSteps.length > 1 ? 's' : ''} to check on`,
      onPress: () => navigation.navigate('Journey'),
    };
  } else if (activePrayers.length > 0) {
    card = {
      icon: 'heart',
      iconBg: theme.colors.error,
      title: 'Continue in Prayer',
      subtitle: `${activePrayers.length} prayer${activePrayers.length > 1 ? 's' : ''} before the Lord`,
      onPress: () => navigation.navigate('Prayers'),
    };
  } else {
    // Default: Start devotional
    card = {
      icon: 'sunny',
      iconBg: theme.colors.accent,
      title: "Today's Devotional",
      subtitle: 'Start your day with God',
      onPress: () => navigation.navigate('Devotionals', { screen: 'DevotionalHub' }),
    };
  }

  return (
    <TouchableOpacity style={styles.contextCard} onPress={card.onPress} activeOpacity={0.8}>
      <View style={[styles.contextIcon, { backgroundColor: card.iconBg }]}>
        <Ionicons name={card.icon} size={22} color="#fff" />
      </View>
      <View style={styles.contextContent}>
        <Text style={styles.contextTitle}>{card.title}</Text>
        <Text style={styles.contextSubtitle}>{card.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

// ============================================================================
// Main HomeScreen
// ============================================================================
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);
  const { profile } = useUserProfile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < GREETING_HOURS.morningEnd) return GREETINGS.morning;
    if (hour < GREETING_HOURS.afternoonEnd) return GREETINGS.afternoon;
    return GREETINGS.evening;
  };

  // Get personalized first name (from profile or email)
  const firstName = getFirstName(profile?.displayName ?? null, user?.email ?? null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}{firstName ? `, ${firstName}` : ''}
            </Text>
            <Text style={styles.subtitle}>What&apos;s on your heart today?</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Verse Card - Tappable to Bible */}
        <HeroVerseCard />

        {/* Proverbs of the Day - Tappable to Bible */}
        <ProverbsOfTheDay />

        {/* Minimal Streak */}
        <StreakBar />

        {/* Contextual Action Card - One priority action */}
        <ContextualCard />

        {/* Ask the Bible Button - Dedicated chat entry point */}
        <AskTheBibleButton />

        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Hero Verse Card
  heroCard: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  heroGradient: {
    padding: theme.spacing.lg,
    minHeight: 200,
  },
  heroHeader: {
    marginBottom: theme.spacing.md,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  heroVerseText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    lineHeight: theme.fontSize.xl * 1.6,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  heroReferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  heroReference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryAlpha[15],
    borderRadius: theme.borderRadius.full,
  },
  heroActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  heroLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroLoadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },

  // Proverbs of the Day
  proverbsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  proverbsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proverbsContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  proverbsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  proverbsSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  proverbsChapterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  proverbsChapterText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },

  // Streak Bar
  streakBar: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakHeader: {
    marginBottom: theme.spacing.sm,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  streakTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakDayCompleted: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  streakDayToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  streakDayText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
  },
  streakDayTextCompleted: {
    color: '#fff',
  },

  // Ask the Bible Button
  askBibleButton: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  askBibleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  askBibleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  askBibleContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  askBibleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  askBibleSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  askBibleSeeds: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    gap: 2,
  },
  askBibleSeedEmoji: {
    fontSize: 14,
  },

  // Contextual Card
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contextIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  contextTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  contextSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
