import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import { OnboardingStackParamList } from '../../types';
import { useTrackScreen } from '../../hooks/useAnalytics';

const { width, height: _height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  useTrackScreen('onboarding_welcome');

  // Track top-of-funnel onboarding event
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { trackOnboardingStarted } = require('../../services/analytics');
    trackOnboardingStarted();
  }, []);

  return (
    <LinearGradient
      colors={theme.colors.gradient.spiritualFull as unknown as [string, string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require('../../../assets/icon.png')}
               
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>
              Your companion for growing closer to God through Scripture, prayer, and reflection
            </Text>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <View style={styles.decorativeLine} />
            <Ionicons name="sparkles" size={24} color={theme.colors.accent} />
            <View style={styles.decorativeLine} />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Carousel')}
              activeOpacity={0.8}
              accessibilityLabel="Get started"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.text} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                // Navigate back to login (handled by parent navigator)
                navigation.getParent()?.goBack();
              }}
              activeOpacity={0.7}
              accessibilityLabel="I already have an account"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            {"\u201CDraw near to God, and he will draw near to you.\u201D"}
          </Text>
          <Text style={styles.quoteReference}>— James 4:8</Text>
        </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  decorativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  decorativeLine: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryButton: {
    width: '100%',
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
  primaryButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  quoteContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  quoteReference: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
