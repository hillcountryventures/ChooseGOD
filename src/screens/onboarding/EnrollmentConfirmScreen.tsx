import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  OnboardingStackParamList,
  DevotionalSeries,
  getSeriesGradient,
} from '../../types';
import { useDevotionalStore } from '../../store/devotionalStore';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'EnrollConfirm'>;
type RouteProps = RouteProp<OnboardingStackParamList, 'EnrollConfirm'>;

export default function EnrollmentConfirmScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { seriesIds, primarySeriesId } = route.params;
  const { user } = useAuthStore();

  const {
    allSeries,
    enrollInSeries,
    markOnboardingComplete,
    fetchEnrollments,
  } = useDevotionalStore();

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [primarySeries, setPrimarySeries] = useState<DevotionalSeries | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Find the primary series
    const series = allSeries.find((s) => s.id === primarySeriesId);
    if (series) {
      setPrimarySeries(series);
    }

    // Show confetti animation
    setShowConfetti(true);
    setLoading(false);
  }, [primarySeriesId, allSeries]);

  const handleBeginJourney = async () => {
    if (!user) return;

    setEnrolling(true);

    try {
      // Enroll in all selected series
      for (let i = 0; i < seriesIds.length; i++) {
        const seriesId = seriesIds[i];
        const isPrimary = seriesId === primarySeriesId;
        await enrollInSeries(user.id, seriesId, isPrimary);
      }

      // Mark onboarding as complete
      await markOnboardingComplete(user.id);

      // Fetch enrollments
      await fetchEnrollments(user.id);

      // Navigate to main app - the App.tsx will handle showing the main navigator
      // since onboardingCompleted is now true
    } catch (error) {
      console.error('Error enrolling:', error);
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const gradient = primarySeries
    ? getSeriesGradient(primarySeries.slug)
    : [theme.colors.primary, theme.colors.primaryDark];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Confetti placeholder - in production use react-native-confetti-cannon */}
        {showConfetti && (
          <View style={styles.confettiContainer}>
            {/* Simplified confetti effect with Ionicons */}
            {[...Array(12)].map((_, i) => (
              <Ionicons
                key={i}
                name="sparkles"
                size={24}
                color={i % 3 === 0 ? theme.colors.accent : i % 3 === 1 ? theme.colors.primary : theme.colors.success}
                style={[
                  styles.confettiPiece,
                  {
                    left: `${(i * 8) + 4}%`,
                    top: `${(i * 3) + 5}%`,
                    transform: [{ rotate: `${i * 30}deg` }],
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={gradient as [string, string]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle" size={64} color="#fff" />
            </LinearGradient>
          </View>

          {/* Celebration Text */}
          <Text style={styles.celebrationText}>You're All Set!</Text>
          <Text style={styles.enrolledText}>
            You're enrolled in{' '}
            <Text style={styles.seriesName}>
              {primarySeries?.title || 'your devotional journey'}
            </Text>
          </Text>

          {seriesIds.length > 1 && (
            <Text style={styles.additionalText}>
              + {seriesIds.length - 1} more {seriesIds.length - 1 === 1 ? 'series' : 'series'}
            </Text>
          )}

          {/* Day 1 Preview */}
          <View style={styles.previewCard}>
            <LinearGradient
              colors={gradient as [string, string]}
              style={styles.previewGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>Day 1</Text>
              </View>
              <Text style={styles.previewTitle}>
                Your Journey Begins
              </Text>
              <Text style={styles.previewDescription}>
                Start with Scripture, receive a personalized reflection, and set your intention for the days ahead.
              </Text>
              <View style={styles.previewMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="book-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>Scripture reading</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="bulb-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>Reflection prompt</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="heart-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>Prayer focus</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Series Info */}
          {primarySeries && (
            <View style={styles.seriesInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>{primarySeries.totalDays} days</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Ionicons name="speedometer-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>{primarySeries.difficultyLevel}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.beginButton}
            onPress={handleBeginJourney}
            disabled={enrolling}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {enrolling ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Begin Day 1</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
    zIndex: 10,
  },
  confettiPiece: {
    position: 'absolute',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  celebrationText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  enrolledText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  seriesName: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  additionalText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  previewCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginTop: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  previewGradient: {
    padding: theme.spacing.lg,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  previewBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginBottom: theme.spacing.sm,
  },
  previewDescription: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  previewMeta: {
    gap: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  seriesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  beginButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  buttonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
