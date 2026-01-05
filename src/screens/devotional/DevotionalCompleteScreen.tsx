import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  DevotionalStackParamList,
  getSeriesGradient,
} from '../../types';
import { useDevotionalStore, useEnrollments } from '../../store/devotionalStore';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<DevotionalStackParamList, 'DevotionalComplete'>;
type RouteProps = RouteProp<DevotionalStackParamList, 'DevotionalComplete'>;

const ENCOURAGEMENTS = [
  "Well done! You're building a beautiful habit.",
  'Your faithfulness is inspiring!',
  'One day at a time, one step closer to God.',
  "You're investing in what matters most.",
  'Keep pressing on in faith!',
  "God sees your dedication. You're doing great!",
];

export default function DevotionalCompleteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { seriesId, dayNumber, seriesTitle } = route.params;

  const { fetchSeriesById } = useDevotionalStore();
  const enrollments = useEnrollments();

  const [showConfetti, setShowConfetti] = useState(true);
  const [encouragement, setEncouragement] = useState('');

  const enrollment = enrollments.find((e) => e.seriesId === seriesId);
  const totalDays = enrollment?.series?.totalDays || 0;
  const isSeriesComplete = dayNumber >= totalDays;

  useEffect(() => {
    // Pick a random encouragement
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENTS.length);
    setEncouragement(ENCOURAGEMENTS[randomIndex]);
  }, []);

  const handleContinue = () => {
    if (isSeriesComplete) {
      // Go back to hub
      navigation.navigate('DevotionalHub');
    } else if (enrollment) {
      // Go to next day
      navigation.navigate('DailyDevotional', {
        enrollmentId: enrollment.id,
        seriesId,
        dayNumber: dayNumber + 1,
      });
    } else {
      navigation.navigate('DevotionalHub');
    }
  };

  const handleGoHome = () => {
    navigation.navigate('DevotionalHub');
  };

  const gradient = getSeriesGradient(
    enrollment?.series?.slug || 'default'
  ) as [string, string];

  // Calculate streak (simplified)
  const streak = enrollment?.completedDays.length || 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Confetti Effect */}
        {showConfetti && (
          <View style={styles.confettiContainer}>
            {[...Array(16)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={20}
                color={
                  i % 4 === 0
                    ? theme.colors.accent
                    : i % 4 === 1
                    ? theme.colors.primary
                    : i % 4 === 2
                    ? theme.colors.success
                    : '#EC4899'
                }
                style={[
                  styles.confettiPiece,
                  {
                    left: `${(i * 6) + 2}%`,
                    top: `${(i % 4) * 5 + 3}%`,
                    transform: [{ rotate: `${i * 22.5}deg` }],
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
              colors={gradient}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSeriesComplete ? (
                <Ionicons name="trophy" size={64} color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle" size={64} color="#fff" />
              )}
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isSeriesComplete ? 'Journey Complete!' : 'Day Complete!'}
          </Text>

          {/* Day Info */}
          {!isSeriesComplete && (
            <Text style={styles.dayInfo}>
              Day {dayNumber} of {totalDays}
            </Text>
          )}

          {/* Series Name */}
          <Text style={styles.seriesName}>{seriesTitle}</Text>

          {/* Encouragement */}
          <Text style={styles.encouragement}>{encouragement}</Text>

          {/* Streak Card */}
          {streak > 0 && (
            <View style={styles.streakCard}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="flame" size={32} color={theme.colors.accent} />
              </View>
              <View style={styles.streakContent}>
                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
          )}

          {/* Progress */}
          {!isSeriesComplete && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(dayNumber / totalDays) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {totalDays - dayNumber} days remaining
              </Text>
            </View>
          )}

          {/* Series Complete Message */}
          {isSeriesComplete && (
            <View style={styles.completeMessage}>
              <Ionicons name="heart" size={24} color="#EC4899" />
              <Text style={styles.completeText}>
                You've completed this devotional journey. May God continue to bless your walk with Him!
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {isSeriesComplete ? 'Back to Devotionals' : 'Continue to Day ' + (dayNumber + 1)}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {!isSeriesComplete && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoHome}
            >
              <Text style={styles.secondaryButtonText}>Done for Today</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
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
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  dayInfo: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  seriesName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  encouragement: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContent: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  streakLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  completeMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  completeText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  primaryButton: {
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
  secondaryButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
