import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  DevotionalStackParamList,
  DevotionalSeries,
  getSeriesGradient,
} from '../../types';
import { useDevotionalStore, useEnrollments } from '../../store/devotionalStore';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<DevotionalStackParamList, 'SeriesDetail'>;
type RouteProps = RouteProp<DevotionalStackParamList, 'SeriesDetail'>;

export default function SeriesDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { seriesId, series: routeSeries } = route.params;
  const { user } = useAuthStore();

  const {
    fetchSeriesById,
    enrollInSeries,
    fetchEnrollments,
  } = useDevotionalStore();
  const enrollments = useEnrollments();

  const [series, setSeries] = useState<DevotionalSeries | null>(routeSeries || null);
  const [loading, setLoading] = useState(!routeSeries);
  const [enrolling, setEnrolling] = useState(false);

  const existingEnrollment = enrollments.find((e) => e.seriesId === seriesId);
  const isEnrolled = !!existingEnrollment;

  useEffect(() => {
    if (!routeSeries) {
      loadSeries();
    }
  }, [seriesId]);

  const loadSeries = async () => {
    setLoading(true);
    const data = await fetchSeriesById(seriesId);
    if (data) {
      setSeries(data);
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!user || !series) return;

    setEnrolling(true);
    const enrollment = await enrollInSeries(user.id, series.id, enrollments.length === 0);
    await fetchEnrollments(user.id);
    setEnrolling(false);

    if (enrollment) {
      // Navigate to the first day
      navigation.navigate('DailyDevotional', {
        enrollmentId: enrollment.id,
        seriesId: series.id,
        dayNumber: 1,
      });
    }
  };

  const handleContinue = () => {
    if (existingEnrollment) {
      navigation.navigate('DailyDevotional', {
        enrollmentId: existingEnrollment.id,
        seriesId: existingEnrollment.seriesId,
        dayNumber: existingEnrollment.currentDay,
      });
    }
  };

  if (loading || !series) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const gradient = getSeriesGradient(series.slug);
  const progressPercentage = existingEnrollment
    ? (existingEnrollment.completedDays.length / series.totalDays) * 100
    : 0;

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <LinearGradient
        colors={gradient as [string, string]}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            {series.isSeasonal && (
              <View style={styles.seasonalBadge}>
                <Ionicons name="calendar" size={14} color="#fff" />
                <Text style={styles.seasonalText}>Seasonal</Text>
              </View>
            )}
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{series.title}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{series.totalDays} days</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Ionicons name="speedometer-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{series.difficultyLevel}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enrolled Progress */}
        {isEnrolled && existingEnrollment && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.progressTitle}>You're Enrolled</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                Day {existingEnrollment.currentDay} of {series.totalDays}
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Journey</Text>
          <Text style={styles.description}>{series.description}</Text>
        </View>

        {/* Topics */}
        {series.topics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Topics Covered</Text>
            <View style={styles.topicsContainer}>
              {series.topics.map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Experience</Text>
          <View style={styles.featuresList}>
            {[
              { icon: 'book-outline', text: 'Daily Scripture readings' },
              { icon: 'bulb-outline', text: 'AI-personalized reflections' },
              { icon: 'create-outline', text: 'Journaling prompts' },
              { icon: 'heart-outline', text: 'Prayer guidance' },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={isEnrolled ? handleContinue : handleEnroll}
          disabled={enrolling}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {enrolling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {isEnrolled ? 'Continue Journey' : 'Start This Journey'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

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
  },
  heroGradient: {
    paddingBottom: theme.spacing.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  seasonalText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  heroContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  heroTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginBottom: theme.spacing.md,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'capitalize',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  progressCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  progressTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  progressBarContainer: {},
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  topicChip: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  topicText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  featuresList: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  ctaButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  ctaText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
