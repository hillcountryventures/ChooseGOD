/**
 * EmotionalWelcomeScreen - Pain-oriented onboarding start
 *
 * Single question: "What brings you here today?"
 * Emotional hooks that connect to user's real situation.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';
import { OnboardingStackParamList } from '../../types';
import { useTrackScreen } from '../../hooks/useAnalytics';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

interface WelcomeOption {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  emotionalHook: string;
}

const WELCOME_OPTIONS: WelcomeOption[] = [
  {
    id: 'hurting',
    label: 'I\'m going through something hard',
    description: 'Anxiety, grief, uncertainty, or pain',
    icon: 'heart-outline',
    emotionalHook: 'hurting',
  },
  {
    id: 'seeking',
    label: 'I\'m searching for answers',
    description: 'Questions about God, faith, or purpose',
    icon: 'search-outline',
    emotionalHook: 'seeking',
  },
  {
    id: 'growing',
    label: 'I want to grow deeper',
    description: 'Already walking with God, want more',
    icon: 'trending-up-outline',
    emotionalHook: 'growing',
  },
  {
    id: 'new',
    label: 'I\'m new to faith',
    description: 'Just starting or exploring Christianity',
    icon: 'leaf-outline',
    emotionalHook: 'new',
  },
  {
    id: 'returning',
    label: 'I\'m coming back',
    description: 'Returning after time away from God',
    icon: 'arrow-undo-outline',
    emotionalHook: 'returning',
  },
];

export default function EmotionalWelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  useTrackScreen('onboarding_emotional_welcome');

  const handleSelect = (option: WelcomeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to AI Demo first (show value early), pass context
    navigation.navigate('AIDemo', { 
      emotionalContext: option.emotionalHook,
      skipPaywall: true,
    });
  };

  return (
    <LinearGradient
      colors={theme.colors.gradient.spiritualFull as unknown as [string, string, string]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Question */}
          <Text style={styles.question}>What brings you here today?</Text>
          <Text style={styles.subtext}>
            There's no wrong answer. This helps us meet you where you are.
          </Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {WELCOME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Skip option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('AIDemo', { skipPaywall: true })}
          >
            <Text style={styles.skipText}>Just let me explore</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  question: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  skipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});
