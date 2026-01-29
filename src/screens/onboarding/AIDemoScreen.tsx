/**
 * AIDemoScreen - Showcase AI Companion During Onboarding
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen gives users their first "aha moment" with the AI companion.
 *
 * Flow: Shows a demo question, then lets them try their own.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';
import { OnboardingStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'AIDemo'>;
type RouteProps = RouteProp<OnboardingStackParamList, 'AIDemo'>;

// Demo conversation to show AI capabilities
const DEMO_QUESTION = "I'm feeling anxious about the future. What does the Bible say?";
const DEMO_RESPONSE = `I understand that feeling — uncertainty about tomorrow can weigh heavy on our hearts.

Scripture speaks directly to this anxiety. In **Matthew 6:34**, Jesus says: *"Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own."*

And in **Philippians 4:6-7**: *"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."*

God invites us to cast our anxieties on Him because He cares for us (1 Peter 5:7). This isn't about ignoring real concerns — it's about trusting that the One who holds tomorrow is also holding you today.

**Would you like to explore any of these verses deeper, or talk about what's specifically weighing on you?**`;

export default function AIDemoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { selectedSeriesIds } = route.params;
  
  const [phase, setPhase] = useState<'intro' | 'demo' | 'try'>('intro');
  const [userQuestion, setUserQuestion] = useState('');
  const [showingResponse, setShowingResponse] = useState(false);
  const [typedResponse, setTypedResponse] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const responseIndex = useRef(0);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [phase]);

  // Typing animation for demo response
  useEffect(() => {
    if (showingResponse && responseIndex.current < DEMO_RESPONSE.length) {
      const timer = setTimeout(() => {
        responseIndex.current += 3; // Type 3 chars at a time for speed
        setTypedResponse(DEMO_RESPONSE.slice(0, responseIndex.current));
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [showingResponse, typedResponse]);

  const handleStartDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('demo');
    // Start showing response after a brief pause
    setTimeout(() => {
      setShowingResponse(true);
    }, 1000);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Paywall', { selectedSeriesIds });
  };

  const handleSkip = () => {
    navigation.navigate('Paywall', { selectedSeriesIds });
  };

  // Intro phase - explain what they're about to see
  if (phase === 'intro') {
    return (
      <LinearGradient
        colors={[theme.colors.background, theme.colors.primaryDark]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <Animated.View style={[styles.introContent, { opacity: fadeAnim }]}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.primary]}
                style={styles.iconGradient}
              >
                <Ionicons name="chatbubbles" size={48} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Meet Your Study Companion</Text>
            <Text style={styles.subtitle}>
              Ask any question about faith, life, or Scripture — and get personalized,
              Bible-grounded guidance instantly.
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="book" size={20} color={theme.colors.primary} />
                <Text style={styles.featureText}>Instant Scripture references</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color={theme.colors.error} />
                <Text style={styles.featureText}>Compassionate, pastoral tone</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
                <Text style={styles.featureText}>Theologically grounded responses</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleStartDemo}>
              <Text style={styles.primaryButtonText}>See It In Action</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Demo phase - show a sample conversation
  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.primaryDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.companionAvatar}>
                <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Study Companion</Text>
                <Text style={styles.headerSubtitle}>Bible study assistant</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Chat area */}
          <ScrollView
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Demo question bubble */}
            <View style={styles.userBubble}>
              <Text style={styles.userBubbleText}>{DEMO_QUESTION}</Text>
            </View>

            {/* AI response bubble */}
            {showingResponse && (
              <Animated.View style={[styles.aiBubble, { opacity: fadeAnim }]}>
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
                  <Text style={styles.aiLabel}>Study Companion</Text>
                </View>
                <Text style={styles.aiBubbleText}>{typedResponse}</Text>
                {typedResponse.length >= DEMO_RESPONSE.length && (
                  <View style={styles.responseComplete}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  </View>
                )}
              </Animated.View>
            )}

            {/* Continue prompt after response is done */}
            {typedResponse.length >= DEMO_RESPONSE.length && (
              <Animated.View style={styles.continuePrompt}>
                <Text style={styles.continuePromptText}>
                  ✨ This is just a taste — you can ask about anything!
                </Text>
              </Animated.View>
            )}
          </ScrollView>

          {/* Bottom action */}
          {typedResponse.length >= DEMO_RESPONSE.length && (
            <View style={styles.bottomAction}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
                <Text style={styles.primaryButtonText}>Continue Setup</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.footnote}>
                You'll have unlimited access to ask questions after setup
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },

  // Intro styles
  introContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    minWidth: 200,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },

  // Demo/chat styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  companionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    borderBottomRightRadius: 4,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  userBubbleText: {
    fontSize: theme.fontSize.md,
    color: '#fff',
    lineHeight: 22,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 4,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  aiLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
  },
  aiBubbleText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  responseComplete: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  continuePrompt: {
    alignItems: 'center',
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  continuePromptText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  bottomAction: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footnote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
