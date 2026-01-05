import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../lib/theme';
import { OnboardingStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'NotificationSetup'>;
type RouteProps = RouteProp<OnboardingStackParamList, 'NotificationSetup'>;

export default function NotificationSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { selectedSeriesIds } = route.params;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(new Date(2024, 0, 1, 7, 0)); // 7:00 AM
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const handleContinue = async () => {
    // In a full implementation, we would:
    // 1. Request notification permissions
    // 2. Save the reminder time to user profile
    // 3. Schedule the notifications

    // For now, just navigate to the enrollment confirmation
    const primarySeriesId = selectedSeriesIds[0];
    navigation.navigate('EnrollConfirm', {
      seriesIds: selectedSeriesIds,
      primarySeriesId,
    });
  };

  const handleSkip = () => {
    const primarySeriesId = selectedSeriesIds[0];
    navigation.navigate('EnrollConfirm', {
      seriesIds: selectedSeriesIds,
      primarySeriesId,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.accentDark]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="notifications" size={48} color="#fff" />
            </LinearGradient>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Stay on Track</Text>
          <Text style={styles.description}>
            Get gentle daily reminders to help you stay consistent with your devotional journey.
          </Text>

          {/* Toggle */}
          <TouchableOpacity
            style={styles.toggleCard}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleContent}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Daily Reminders</Text>
                <Text style={styles.toggleDescription}>
                  We'll remind you at your preferred time
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggle,
                notificationsEnabled && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  notificationsEnabled && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Time Picker */}
          {notificationsEnabled && (
            <View style={styles.timeSection}>
              <Text style={styles.timeSectionTitle}>Reminder Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.timeText}>{formatTime(reminderTime)}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>

              {(showTimePicker || Platform.OS === 'ios') && notificationsEnabled && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    themeVariant="dark"
                  />
                </View>
              )}
            </View>
          )}

          {/* Preview Card */}
          {notificationsEnabled && (
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewIcon}>
                  <Ionicons name="book" size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.previewAppName}>ChooseGOD</Text>
                <Text style={styles.previewTime}>now</Text>
              </View>
              <Text style={styles.previewTitle}>Your devotional is ready</Text>
              <Text style={styles.previewBody}>
                Continue your journey with today's reading on peace and trust.
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
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
                {notificationsEnabled ? 'Enable Reminders' : 'Continue'}
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
  skipButton: {
    padding: theme.spacing.sm,
  },
  skipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  toggleCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  timeSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  timeSectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  timeText: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  pickerContainer: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  previewCard: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  previewIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAppName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  previewTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  previewTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  previewBody: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
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
