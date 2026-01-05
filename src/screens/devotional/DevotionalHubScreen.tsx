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

  const handleSeriesPress = (enrollment: EnrollmentProgress) => {
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.headerTitle}>Your Devotionals</Text>
          </View>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => navigation.navigate('SeriesLibrary')}
          >
            <Ionicons name="compass-outline" size={24} color={theme.colors.primary} />
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
          {/* Streak Banner */}
          {streak > 0 && (
            <View style={styles.streakBanner}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={24} color={theme.colors.accent} />
              </View>
              <View style={styles.streakContent}>
                <Text style={styles.streakCount}>{streak} Day Streak</Text>
                <Text style={styles.streakText}>Keep it going!</Text>
              </View>
              <View style={styles.streakDays}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                  const isCompleted = index < streak;
                  const isToday = index === new Date().getDay();
                  return (
                    <View
                      key={index}
                      style={[
                        styles.streakDay,
                        isCompleted && styles.streakDayCompleted,
                        isToday && styles.streakDayToday,
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : (
                        <Text style={styles.streakDayText}>{day}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Primary Devotional Card */}
          {primaryProgress && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Continue Your Journey</Text>
              <TouchableOpacity
                style={styles.primaryCard}
                onPress={handleContinueDevotional}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={getSeriesGradient(primaryProgress.seriesSlug) as [string, string]}
                  style={styles.primaryCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Progress Ring */}
                  <View style={styles.progressRingContainer}>
                    <View style={styles.progressRing}>
                      <Text style={styles.progressDay}>Day</Text>
                      <Text style={styles.progressNumber}>{primaryProgress.currentDay}</Text>
                    </View>
                  </View>

                  <View style={styles.primaryCardContent}>
                    <Text style={styles.primaryCardTitle} numberOfLines={2}>
                      {primaryProgress.seriesTitle}
                    </Text>
                    <View style={styles.primaryCardMeta}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${primaryProgress.progressPercentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(primaryProgress.progressPercentage)}% complete
                      </Text>
                    </View>
                  </View>

                  <View style={styles.continueButton}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Other Enrolled Series */}
          {otherProgress.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Also Enrolled</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {otherProgress.map((enrollment) => (
                  <TouchableOpacity
                    key={enrollment.enrollmentId}
                    style={styles.enrolledCard}
                    onPress={() => handleSeriesPress(enrollment)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={getSeriesGradient(enrollment.seriesSlug) as [string, string]}
                      style={styles.enrolledCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.enrolledCardDay}>Day {enrollment.currentDay}</Text>
                      <Text style={styles.enrolledCardTitle} numberOfLines={2}>
                        {enrollment.seriesTitle}
                      </Text>
                      <View style={styles.enrolledProgressBar}>
                        <View
                          style={[
                            styles.enrolledProgressFill,
                            { width: `${enrollment.progressPercentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.enrolledProgressText}>
                        {enrollment.daysRemaining} days left
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Discover More */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.discoverCard}
              onPress={() => navigation.navigate('SeriesLibrary')}
              activeOpacity={0.8}
            >
              <View style={styles.discoverIconContainer}>
                <Ionicons name="add" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.discoverContent}>
                <Text style={styles.discoverTitle}>Discover More</Text>
                <Text style={styles.discoverDescription}>
                  Browse our library of devotional series
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Empty State */}
          {progress.length === 0 && !enrollmentsLoading && (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={theme.colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Active Devotionals</Text>
              <Text style={styles.emptyStateDescription}>
                Start a devotional journey to grow in your faith
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
  greeting: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  discoverButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContent: {
    flex: 1,
  },
  streakCount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  streakText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  streakDays: {
    flexDirection: 'row',
    gap: 4,
  },
  streakDay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayCompleted: {
    backgroundColor: theme.colors.accent,
  },
  streakDayToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  streakDayText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  primaryCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  primaryCardGradient: {
    padding: theme.spacing.lg,
    minHeight: 180,
  },
  progressRingContainer: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDay: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: theme.fontWeight.medium,
  },
  progressNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  primaryCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  primaryCardTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginBottom: theme.spacing.md,
    maxWidth: '70%',
  },
  primaryCardMeta: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  continueButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  horizontalScroll: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg,
  },
  enrolledCard: {
    width: width * 0.6,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  enrolledCardGradient: {
    padding: theme.spacing.md,
    minHeight: 140,
  },
  enrolledCardDay: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  enrolledCardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
    marginBottom: 'auto',
  },
  enrolledProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  enrolledProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  enrolledProgressText: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  discoverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  discoverIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverContent: {
    flex: 1,
  },
  discoverTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  discoverDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyStateButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
