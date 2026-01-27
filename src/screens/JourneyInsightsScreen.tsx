/**
 * JourneyInsightsScreen
 *
 * A comprehensive dashboard showing the user's spiritual growth journey.
 * Includes: Spiritual Health Score, Prayer Activity, Topics Explored,
 * Most Read Bible Books, Growth Insights, and Recent Milestones.
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen celebrates growth while pointing users toward deeper relationship with God.
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';
import { RootStackParamList } from '../types';

// Components
import { SpiritualScoreCard, PrayerActivityChart, TopicsExplored } from '../components/insights';

// Hook
import { useJourneyInsights } from '../hooks/useJourneyInsights';
import type { BibleBookEngagement, GrowthInsight, RecentMilestone } from '../hooks/useJourneyInsights';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =====================================================
// BIBLE BOOKS SECTION
// =====================================================

interface BibleBooksGridProps {
  books: BibleBookEngagement[];
}

function BibleBooksGrid({ books }: BibleBooksGridProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (books.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Read Books</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>
            Your Bible reading journey starts here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Most Read Books</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.booksGrid}>
        {books.map((book, index) => (
          <View
            key={book.book}
            style={[
              styles.bookCard,
              { backgroundColor: book.gradient[0] },
            ]}
          >
            <Text style={styles.bookEmoji}>{book.emoji}</Text>
            <Text style={styles.bookName}>{book.book}</Text>
            <Text style={styles.bookCount}>{book.verseCount} verses</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// =====================================================
// GROWTH INSIGHT SECTION
// =====================================================

interface GrowthInsightCardProps {
  insight: GrowthInsight | null;
}

function GrowthInsightCard({ insight }: GrowthInsightCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!insight) {
    return null;
  }

  return (
    <Animated.View style={[styles.insightContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[`${theme.colors.success}15`, `${theme.colors.success}25`, `${theme.colors.success}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.insightGradient}
      >
        <View style={styles.insightIconContainer}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightText}>{insight.content}</Text>
          {insight.suggestedVerse && (
            <TouchableOpacity style={styles.verseChip}>
              <Text style={styles.verseChipText}>
                Explore {insight.suggestedVerse}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={12}
                color={theme.colors.success}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// =====================================================
// MILESTONES SECTION
// =====================================================

interface MilestonesCarouselProps {
  milestones: RecentMilestone[];
}

function MilestonesCarousel({ milestones }: MilestonesCarouselProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (milestones.length === 0) {
    return (
      <Animated.View style={[styles.milestonesSection, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Recent Milestones</Text>
        <View style={styles.emptyMilestones}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>
            Keep going! Your first milestone is within reach
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.milestonesSection, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>Recent Milestones</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.milestonesScroll}
      >
        {milestones.map((milestone, index) => (
          <View
            key={milestone.id}
            style={[
              styles.milestoneCard,
              { backgroundColor: milestone.gradient[0] },
            ]}
          >
            <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            <Text style={styles.milestoneDesc}>{milestone.description}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

// =====================================================
// SHARE BUTTON
// =====================================================

function ShareJourneyButton() {
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: "I'm growing in my faith journey with ChooseGOD! 🙏 Join me in daily devotionals and prayer. #ChooseGOD",
        title: 'Share Your Journey',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, []);

  return (
    <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
      <LinearGradient
        colors={[theme.colors.backgroundTertiary, theme.colors.backgroundSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shareButtonGradient}
      >
        <Ionicons name="share-social-outline" size={20} color={theme.colors.text} />
        <Text style={styles.shareButtonText}>Share Your Journey</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// =====================================================
// MAIN SCREEN
// =====================================================

export default function JourneyInsightsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    spiritualHealth,
    weeklyActivity,
    topicsExplored,
    bibleBooks,
    growthInsight,
    milestones,
    isLoading,
    error,
    refresh,
  } = useJourneyInsights();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading your journey...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>Your Growth</Text>
          <Text style={styles.headerTitle}>Journey Insights</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.periodPicker}>
            <Text style={styles.periodText}>This Month</Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      >
        {/* Spiritual Health Score */}
        <SpiritualScoreCard data={spiritualHealth} />

        {/* Prayer Activity Chart */}
        <PrayerActivityChart
          data={weeklyActivity}
          averageMinutes={Math.round(
            weeklyActivity.reduce((acc, d) => acc + d.prayerMinutes, 0) / 7
          )}
        />

        {/* Topics Explored */}
        <TopicsExplored data={topicsExplored} />

        {/* Most Read Books */}
        <BibleBooksGrid books={bibleBooks} />

        {/* Growth Insight */}
        <GrowthInsightCard insight={growthInsight} />

        {/* Milestones */}
        <MilestonesCarousel milestones={milestones} />

        {/* Share Button */}
        <ShareJourneyButton />

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  periodText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },

  // Sections
  sectionContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[10],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: '500',
  },

  // Books Grid
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  bookCard: {
    width: (SCREEN_WIDTH - theme.spacing.md * 4 - theme.spacing.md) / 2,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[15],
  },
  bookEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  bookName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  bookCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  // Growth Insight
  insightContainer: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.colors.success}30`,
  },
  insightGradient: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.success}25`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 18,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  verseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.sm,
  },
  verseChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: '500',
  },

  // Milestones
  milestonesSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  milestonesScroll: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  milestoneCard: {
    width: 130,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[15],
  },
  milestoneEmoji: {
    fontSize: 28,
    marginBottom: theme.spacing.sm,
  },
  milestoneTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  milestoneDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  emptyMilestones: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  // Share Button
  shareButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  shareButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // Bottom padding
  bottomPadding: {
    height: 100,
  },
});
