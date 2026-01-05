import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  OnboardingStackParamList,
  DevotionalSeries,
  getSeriesGradient,
} from '../../types';
import { useDevotionalStore } from '../../store/devotionalStore';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Recommendations'>;
type RouteProps = RouteProp<OnboardingStackParamList, 'Recommendations'>;

export default function RecommendationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { quizResponses } = route.params;
  const { user } = useAuthStore();

  const {
    allSeries,
    fetchAllSeries,
    getRecommendedSeries,
    saveOnboardingResponses,
  } = useDevotionalStore();

  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<DevotionalSeries[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);

      // Fetch all series if not loaded
      if (allSeries.length === 0) {
        await fetchAllSeries();
      }

      // Get personalized recommendations
      const recs = await getRecommendedSeries(quizResponses);
      setRecommended(recs);

      // Auto-select top recommendation
      if (recs.length > 0) {
        setSelectedIds(new Set([recs[0].id]));
      }

      // Save quiz responses
      if (user) {
        await saveOnboardingResponses(user.id, quizResponses);
      }

      setLoading(false);
    }

    loadRecommendations();
  }, []);

  const toggleSelection = (seriesId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    if (selectedIds.size === 0) return;

    const selectedArray = Array.from(selectedIds);
    navigation.navigate('NotificationSetup', {
      selectedSeriesIds: selectedArray,
    });
  };

  const handleBrowseAll = () => {
    // For now, just continue with current selection
    // In full implementation, this would navigate to full library
    handleContinue();
  };

  const renderSeriesCard = (series: DevotionalSeries, isTopPick: boolean = false) => {
    const isSelected = selectedIds.has(series.id);
    const gradient = getSeriesGradient(series.slug);

    return (
      <TouchableOpacity
        key={series.id}
        style={[
          isTopPick ? styles.topPickCard : styles.seriesCard,
          isSelected && styles.cardSelected,
        ]}
        onPress={() => toggleSelection(series.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          style={isTopPick ? styles.topPickGradient : styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isTopPick && (
            <View style={styles.topPickBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.topPickBadgeText}>Top Pick</Text>
            </View>
          )}

          <View style={styles.cardContent}>
            <Text
              style={[
                isTopPick ? styles.topPickTitle : styles.cardTitle,
              ]}
              numberOfLines={2}
            >
              {series.title}
            </Text>
            <Text
              style={[
                isTopPick ? styles.topPickDescription : styles.cardDescription,
              ]}
              numberOfLines={isTopPick ? 3 : 2}
            >
              {series.description}
            </Text>
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{series.totalDays} days</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="speedometer-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{series.difficultyLevel}</Text>
              </View>
            </View>
          </View>

          {/* Selection indicator */}
          <View
            style={[
              styles.selectionIndicator,
              isSelected && styles.selectionIndicatorSelected,
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Finding your perfect journey...</Text>
      </View>
    );
  }

  const topPick = recommended[0];
  const otherRecommendations = recommended.slice(1);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Recommendations</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Intro Text */}
          <Text style={styles.introText}>
            Based on your answers, we think you'll love these devotional journeys. Select one or more to get started!
          </Text>

          {/* Top Pick */}
          {topPick && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perfect for You</Text>
              {renderSeriesCard(topPick, true)}
            </View>
          )}

          {/* Other Recommendations */}
          {otherRecommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Also Recommended</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {otherRecommendations.map((series) =>
                  renderSeriesCard(series, false)
                )}
              </ScrollView>
            </View>
          )}

          {/* Browse All Link */}
          <TouchableOpacity
            style={styles.browseAllButton}
            onPress={handleBrowseAll}
          >
            <Text style={styles.browseAllText}>Browse All Devotionals</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedIds.size === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedIds.size === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedIds.size > 0
                  ? [theme.colors.primary, theme.colors.primaryDark]
                  : [theme.colors.border, theme.colors.border]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                Start {selectedIds.size === 1 ? 'This Journey' : `${selectedIds.size} Journeys`}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  introText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
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
  topPickCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: theme.colors.accent,
  },
  topPickGradient: {
    padding: theme.spacing.lg,
    minHeight: 200,
  },
  topPickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  topPickBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  cardContent: {
    flex: 1,
  },
  topPickTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginBottom: theme.spacing.sm,
  },
  topPickDescription: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  selectionIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  horizontalScroll: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg,
  },
  seriesCard: {
    width: width * 0.65,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardGradient: {
    padding: theme.spacing.md,
    minHeight: 150,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  browseAllText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  continueButtonDisabled: {
    opacity: 0.5,
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
