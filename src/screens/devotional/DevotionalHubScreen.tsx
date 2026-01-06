/**
 * DevotionalHubScreen
 * Simplified hub focused on primary devotional journey
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Daily devotions as a consistent pathway to deeper relationship with God
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  DevotionalStackParamList,
  EnrollmentProgress,
  getSeriesGradient,
} from '../../types';
import { useDevotionalStore, usePrimaryEnrollment, useEnrollments } from '../../store/devotionalStore';
import { useAuthStore } from '../../store/authStore';
import { useIsPremium, useSubscriptionStore } from '../../store/subscriptionStore';
import { DrawNearBanner } from '../../components/devotional/DrawNearBanner';
import { FREE_ENROLLMENT_LIMIT } from '../../constants/subscription';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<DevotionalStackParamList, 'DevotionalHub'>;

export default function DevotionalHubScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const {
    fetchEnrollments,
    getEnrollmentProgress,
    enrollmentsLoading,
  } = useDevotionalStore();

  const enrollments = useEnrollments();
  const primaryEnrollment = usePrimaryEnrollment();
  const isPremium = useIsPremium();
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);

  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<EnrollmentProgress[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    await fetchEnrollments(user.id);
    const progressData = await getEnrollmentProgress(user.id);
    setProgress(progressData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleContinueDevotional = () => {
    if (primaryEnrollment) {
      navigation.navigate('DailyDevotional', {
        enrollmentId: primaryEnrollment.id,
        seriesId: primaryEnrollment.seriesId,
        dayNumber: primaryEnrollment.currentDay,
      });
    }
  };

  const handleSeriesPress = (enrollment: EnrollmentProgress, index: number) => {
    // Free users can only access the first devotional (primary is index 0, others start at 1)
    const isLocked = !isPremium && index >= FREE_ENROLLMENT_LIMIT;

    if (isLocked) {
      showPaywall();
      return;
    }

    navigation.navigate('DailyDevotional', {
      enrollmentId: enrollment.enrollmentId,
      seriesId: enrollment.seriesId,
      dayNumber: enrollment.currentDay,
    });
  };

  const primaryProgress = progress.find((p) => p.isPrimary);
  const otherProgress = progress.filter((p) => !p.isPrimary);

  // Calculate streak (simplified)
  const streak = enrollments.length > 0
    ? Math.min(7, Math.max(1, enrollments[0]?.completedDays.length || 0))
    : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Simplified Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Daily Devotional</Text>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color={theme.colors.accent} />
                <Text style={styles.streakBadgeText}>{streak}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.libraryButton}
            onPress={() => navigation.navigate('SeriesLibrary')}
          >
            <Ionicons name="library-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Draw Near Verse Banner */}
          <DrawNearBanner />

          {/* Primary Devotional Hero Card */}
          {primaryProgress && (
            <TouchableOpacity
              style={styles.primaryHero}
              onPress={handleContinueDevotional}
              activeOpacity={0.95}
            >
              <LinearGradient
                colors={getSeriesGradient(primaryProgress.seriesSlug) as [string, string]}
                style={styles.primaryHeroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroHeader}>
                  <Text style={styles.heroSeriesTitle} numberOfLines={2}>
                    {primaryProgress.seriesTitle}
                  </Text>
                  <View style={styles.heroDayBadge}>
                    <Text style={styles.heroDayLabel}>Day</Text>
                    <Text style={styles.heroDayNumber}>{primaryProgress.currentDay}</Text>
                    <Text style={styles.heroDayOf}>of {primaryProgress.totalDays}</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.heroProgress}>
                  <View style={styles.heroProgressBar}>
                    <View
                      style={[
                        styles.heroProgressFill,
                        { width: `${primaryProgress.progressPercentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.heroProgressText}>
                    {Math.round(primaryProgress.progressPercentage)}% complete
                  </Text>
                </View>

                {/* Continue button */}
                <View style={styles.heroCTA}>
                  <Text style={styles.heroCTAText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Other Enrollments - Cards */}
          {otherProgress.length > 0 && (
            <View style={styles.otherSection}>
              <Text style={styles.otherSectionTitle}>Your Devotionals</Text>
              <View style={styles.enrollmentCards}>
                {otherProgress.map((enrollment, index) => {
                  const enrollmentIndex = index + 1; // +1 because primary is index 0
                  const isLocked = !isPremium && enrollmentIndex >= FREE_ENROLLMENT_LIMIT;

                  return (
                    <TouchableOpacity
                      key={enrollment.enrollmentId}
                      style={styles.enrollmentCard}
                      onPress={() => handleSeriesPress(enrollment, enrollmentIndex)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={getSeriesGradient(enrollment.seriesSlug) as [string, string]}
                        style={styles.enrollmentCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {/* Lock overlay for non-premium users */}
                        {isLocked && (
                          <View style={styles.lockOverlay}>
                            <View style={styles.lockBadge}>
                              <Ionicons name="lock-closed" size={14} color="#fff" />
                              <Text style={styles.lockText}>Pro</Text>
                            </View>
                          </View>
                        )}

                        <Text style={styles.enrollmentCardTitle} numberOfLines={2}>
                          {enrollment.seriesTitle}
                        </Text>

                        <View style={styles.enrollmentCardFooter}>
                          <View style={styles.enrollmentCardDay}>
                            <Text style={styles.enrollmentCardDayLabel}>Day</Text>
                            <Text style={styles.enrollmentCardDayNumber}>
                              {enrollment.currentDay}/{enrollment.totalDays}
                            </Text>
                          </View>

                          {/* Mini progress bar */}
                          <View style={styles.enrollmentCardProgress}>
                            <View
                              style={[
                                styles.enrollmentCardProgressFill,
                                { width: `${enrollment.progressPercentage}%` },
                              ]}
                            />
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Discover Link */}
          <TouchableOpacity
            style={styles.discoverLink}
            onPress={() => navigation.navigate('SeriesLibrary')}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.discoverLinkText}>Discover more series</Text>
          </TouchableOpacity>

          {/* Empty State */}
          {progress.length === 0 && !enrollmentsLoading && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="book-outline" size={48} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>Begin Your Journey</Text>
              <Text style={styles.emptyStateDescription}>
                Start a devotional series to grow closer to God through daily Scripture and reflection.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('SeriesLibrary')}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.emptyStateButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.emptyStateButtonText}>Browse Devotionals</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accent + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  streakBadgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
  libraryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Primary Hero Card
  primaryHero: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  primaryHeroGradient: {
    padding: theme.spacing.lg,
    minHeight: 200,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  heroSeriesTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  heroDayBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  heroDayLabel: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroDayNumber: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    lineHeight: 36,
  },
  heroDayOf: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  heroProgress: {
    marginBottom: theme.spacing.lg,
  },
  heroProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: theme.spacing.xs,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  heroProgressText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  heroCTAText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },

  // Other Enrollments Section
  otherSection: {
    marginBottom: theme.spacing.lg,
  },
  otherSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  enrollmentCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  enrollmentCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  enrollmentCardGradient: {
    padding: theme.spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  enrollmentCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
    marginBottom: theme.spacing.sm,
  },
  enrollmentCardFooter: {
    marginTop: 'auto',
  },
  enrollmentCardDay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  enrollmentCardDayLabel: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  enrollmentCardDayNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  enrollmentCardProgress: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  enrollmentCardProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  lockText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },

  // Discover Link
  discoverLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  discoverLinkText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  emptyStateButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
