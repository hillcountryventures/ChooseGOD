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

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { useDailyVerse } from '../hooks/useDailyVerse';
import { ChatMode, BottomTabParamList, RootStackParamList } from '../types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { navigateToBibleVerse, navigateToProverbsOfDay, openJournalCompose } from '../lib/navigationHelpers';

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
        translation: 'KJV',
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

  if (isLoading || !dailyVerse) {
    return (
      <View style={styles.heroCard}>
        <LinearGradient colors={['#1F1F1F', '#2A2A2A']} style={styles.heroGradient}>
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
      <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.heroGradient}>
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
  const proverbsChapter = Math.min(dayOfMonth, 31);

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
  const streak = Math.min(recentMoments.length, 7);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  return (
    <View style={styles.streakBar}>
      <View style={styles.streakHeader}>
        <View style={styles.streakTitleRow}>
          <Ionicons name="flame" size={18} color={theme.colors.accent} />
          <Text style={styles.streakTitle}>
            {streak > 0 ? `${streak} day streak` : 'Start your streak'}
          </Text>
        </View>
      </View>
      <View style={styles.streakDays}>
        {weekDays.map((day, index) => {
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

  if (memoryVersesDue.length > 0) {
    card = {
      icon: 'bulb',
      iconBg: theme.colors.accent,
      title: 'Memory Review',
      subtitle: `${memoryVersesDue.length} verse${memoryVersesDue.length > 1 ? 's' : ''} ready to review`,
      onPress: () => navigation.navigate('Ask', { mode: 'memory' }),
    };
  } else if (pendingObedienceSteps.length > 0) {
    card = {
      icon: 'checkmark-circle',
      iconBg: '#22C55E',
      title: 'Follow Through',
      subtitle: `${pendingObedienceSteps.length} commitment${pendingObedienceSteps.length > 1 ? 's' : ''} to check on`,
      onPress: () => navigation.navigate('Journey'),
    };
  } else if (activePrayers.length > 0) {
    card = {
      icon: 'heart',
      iconBg: '#EF4444',
      title: 'Continue in Prayer',
      subtitle: `${activePrayers.length} prayer${activePrayers.length > 1 ? 's' : ''} before the Lord`,
      onPress: () => navigation.navigate('Ask', { mode: 'prayer' }),
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
// Floating Ask Bar - Quick access to Ask tab
// ============================================================================
function FloatingAskBar() {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('Ask', { mode: 'auto' as ChatMode });
  };

  return (
    <View style={styles.floatingBar}>
      <TouchableOpacity style={styles.floatingInput} onPress={handlePress} activeOpacity={0.9}>
        <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.floatingPlaceholder}>Ask anything about Scripture...</Text>
        <View style={styles.floatingArrow}>
          <Ionicons name="arrow-forward-circle" size={24} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// Main HomeScreen
// ============================================================================
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>What&apos;s on your heart today?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="person-circle-outline" size={36} color={theme.colors.textSecondary} />
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

        {/* Spacer for floating bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Ask Bar */}
      <FloatingAskBar />
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
  profileButton: {
    padding: theme.spacing.xs,
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
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
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
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
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

  // Floating Ask Bar
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  floatingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  floatingPlaceholder: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  floatingArrow: {
    marginLeft: theme.spacing.sm,
  },
});
