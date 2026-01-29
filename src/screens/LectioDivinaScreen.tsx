/**
 * LectioDivinaScreen - Guided Lectio Divina practice
 * 
 * Four-step ancient prayer practice:
 * 1. Lectio (Read) - Slowly read the passage
 * 2. Meditatio (Reflect) - What word/phrase stands out?
 * 3. Oratio (Respond) - Pray your response to God
 * 4. Contemplatio (Rest) - Sit in God's presence
 * 
 * Each step has timed guidance with gentle prompts.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { theme } from '../lib/theme';
import { RootStackParamList } from '../types';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const { width: _width } = Dimensions.get('window');

type RouteProps = RouteProp<RootStackParamList, 'LectioDivina'>;

interface Step {
  id: 'lectio' | 'meditatio' | 'oratio' | 'contemplatio';
  title: string;
  subtitle: string;
  instruction: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  durationSeconds: number;
  hasInput?: boolean;
  inputPlaceholder?: string;
}

const STEPS: Step[] = [
  {
    id: 'lectio',
    title: 'Lectio',
    subtitle: 'Read',
    instruction: 'Read the passage slowly, out loud if possible. Let each word sink in. Read it 2-3 times.',
    icon: 'book',
    color: theme.colors.primary,
    durationSeconds: 90,
  },
  {
    id: 'meditatio',
    title: 'Meditatio',
    subtitle: 'Reflect',
    instruction: 'What word or phrase captures your attention? Sit with it. What is stirring in your heart?',
    icon: 'heart',
    color: theme.colors.prayer,
    durationSeconds: 120,
    hasInput: true,
    inputPlaceholder: 'The word/phrase that stands out to me...',
  },
  {
    id: 'oratio',
    title: 'Oratio',
    subtitle: 'Respond',
    instruction: 'Talk to God about what you noticed. Share your thoughts, questions, gratitude, or needs.',
    icon: 'chatbubble-ellipses',
    color: theme.colors.accent,
    durationSeconds: 120,
    hasInput: true,
    inputPlaceholder: 'My prayer response...',
  },
  {
    id: 'contemplatio',
    title: 'Contemplatio',
    subtitle: 'Rest',
    instruction: 'Release words and thoughts. Simply rest in God\'s presence. Be still and know He is God.',
    icon: 'moon',
    color: theme.colors.success,
    durationSeconds: 90,
  },
];

// Default verse if none provided
const DEFAULT_VERSE = {
  ref: 'Psalm 46:10',
  text: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
};

export default function LectioDivinaScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const user = useAuthStore((state) => state.user);
  const addMoment = useStore((state) => state.addMoment);

  const verseRef = route.params?.verseRef || DEFAULT_VERSE.ref;
  const verseText = route.params?.verseText || DEFAULT_VERSE.text;

  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(STEPS[0].durationSeconds);
  const [isPaused, setIsPaused] = useState(true); // Start paused so user can read
  const [isComplete, setIsComplete] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Use Reanimated for progress bar (supports layout animation on UI thread)
  const progressValue = useSharedValue(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animated style for progress bar using Reanimated worklet
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%` as unknown as number,
    };
  });

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;

  // Advance to next step function (defined early for use in effects)
  const advanceToNextStep = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      setIsComplete(true);
      return;
    }

    // Fade out, change step, fade in
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setTimeRemaining(STEPS[nextStep].durationSeconds);
      setIsPaused(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [currentStep, totalSteps, fadeAnim]);

  // Timer logic
  useEffect(() => {
    if (isPaused || isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-advance to next step
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          advanceToNextStep();
          return STEPS[Math.min(currentStep + 1, totalSteps - 1)]?.durationSeconds || 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isComplete, currentStep, totalSteps, advanceToNextStep]);

  // Animate progress using Reanimated (runs on UI thread for 60fps)
  useEffect(() => {
    progressValue.value = withTiming((currentStep + 1) / totalSteps, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [currentStep, totalSteps, progressValue]);

  const handleNextStep = () => {
    advanceToNextStep();
    if (currentStep >= totalSteps - 1) {
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep <= 0) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep((prev) => prev - 1);
      setTimeRemaining(STEPS[currentStep - 1].durationSeconds);
      setIsPaused(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleComplete = async () => {
    // Save as a spiritual moment
    if (user?.id) {
      try {
        const content = [
          `**Lectio Divina - ${verseRef}**`,
          '',
          `*Passage:* "${verseText}"`,
          '',
          responses.meditatio ? `*What stood out:* ${responses.meditatio}` : '',
          responses.oratio ? `*Prayer response:* ${responses.oratio}` : '',
        ].filter(Boolean).join('\n');

        await supabase.from('spiritual_moments').insert({
          user_id: user.id,
          moment_type: 'lectio',
          content,
          themes: ['lectio divina', 'meditation', 'prayer'],
        });

        // Update local state
        addMoment({
          id: Date.now().toString(),
          userId: user.id,
          momentType: 'lectio',
          content,
          themes: ['lectio divina', 'meditation', 'prayer'],
          linkedVerses: [],
          createdAt: new Date(),
        });
      } catch (err) {
        console.error('[LectioDivina] Save error:', err);
      }
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Completion screen
  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="leaf" size={64} color={theme.colors.success} />
          </View>
          <Text style={styles.completionTitle}>Practice Complete</Text>
          <Text style={styles.completionVerse}>&quot;{verseRef}&quot;</Text>
          <Text style={styles.completionText}>
            You&apos;ve spent time in God&apos;s Word through the ancient practice of Lectio Divina.
            May His Word continue to dwell in you richly.
          </Text>

          {responses.meditatio && (
            <View style={styles.completionReflection}>
              <Text style={styles.reflectionLabel}>What stood out:</Text>
              <Text style={styles.reflectionText}>{responses.meditatio}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.completionButton} onPress={handleClose}>
            <Text style={styles.completionButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lectio Divina</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Progress - uses Reanimated for 60fps UI thread animation */}
        <View style={styles.progressContainer}>
          <Reanimated.View style={[styles.progressBar, progressBarStyle]} />
        </View>

        {/* Step indicators */}
        <View style={styles.stepIndicators}>
          {STEPS.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.stepDot,
                i <= currentStep && styles.stepDotActive,
                { backgroundColor: i <= currentStep ? s.color : theme.colors.surface },
              ]}
            >
              {i < currentStep && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Verse Card */}
          <View style={styles.verseCard}>
            <Text style={styles.verseRef}>{verseRef}</Text>
            <Text style={styles.verseText}>{verseText}</Text>
          </View>

          {/* Current Step */}
          <Animated.View style={[styles.stepCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={[`${step.color}15`, `${step.color}05`]}
              style={styles.stepGradient}
            >
              {/* Step Header */}
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconContainer, { backgroundColor: `${step.color}20` }]}>
                  <Ionicons name={step.icon} size={28} color={step.color} />
                </View>
                <View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={[styles.stepSubtitle, { color: step.color }]}>{step.subtitle}</Text>
                </View>
              </View>

              {/* Instruction */}
              <Text style={styles.stepInstruction}>{step.instruction}</Text>

              {/* Timer */}
              <View style={styles.timerContainer}>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() => setIsPaused((p) => !p)}
                >
                  <Ionicons
                    name={isPaused ? 'play' : 'pause'}
                    size={24}
                    color={step.color}
                  />
                </TouchableOpacity>
                <Text style={[styles.timerText, { color: step.color }]}>
                  {formatTime(timeRemaining)}
                </Text>
                <Text style={styles.timerLabel}>
                  {isPaused ? 'Tap to start' : 'remaining'}
                </Text>
              </View>

              {/* Input for meditatio/oratio */}
              {step.hasInput && (
                <TextInput
                  style={styles.input}
                  placeholder={step.inputPlaceholder}
                  placeholderTextColor={theme.colors.textMuted}
                  value={responses[step.id] || ''}
                  onChangeText={(text) =>
                    setResponses((prev) => ({ ...prev, [step.id]: text }))
                  }
                  multiline
                  textAlignVertical="top"
                />
              )}
            </LinearGradient>
          </Animated.View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
            onPress={handlePrevStep}
            disabled={currentStep === 0}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentStep === 0 ? theme.colors.textMuted : theme.colors.text}
            />
            <Text
              style={[
                styles.navButtonText,
                currentStep === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>
              {currentStep + 1} / {totalSteps}
            </Text>
          </View>

          <TouchableOpacity style={styles.navButton} onPress={handleNextStep}>
            <Text style={styles.navButtonText}>
              {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
            </Text>
            <Ionicons
              name={currentStep === totalSteps - 1 ? 'checkmark' : 'chevron-forward'}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressContainer: {
    height: 3,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {},
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  verseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 18,
    color: theme.colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  stepCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  stepGradient: {
    padding: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepInstruction: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  navButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  stepCounter: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stepCounterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  // Completion
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  completionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.successAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  completionVerse: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: 16,
  },
  completionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  completionReflection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  reflectionLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  reflectionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  completionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
