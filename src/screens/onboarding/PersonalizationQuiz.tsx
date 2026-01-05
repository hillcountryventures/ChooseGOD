import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  OnboardingStackParamList,
  OnboardingResponses,
  ONBOARDING_QUIZ,
  QuizQuestion,
  QuizOption,
} from '../../types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Quiz'>;

export default function PersonalizationQuiz() {
  const navigation = useNavigation<NavigationProp>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<OnboardingResponses>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const question = ONBOARDING_QUIZ[currentQuestion];
  const totalQuestions = ONBOARDING_QUIZ.length;
  const progress = (currentQuestion + 1) / totalQuestions;

  const handleSelectOption = (option: QuizOption) => {
    const field = question.field;
    setResponses((prev) => ({
      ...prev,
      [field]: option.value,
    }));

    // Animate to next question
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setCurrentQuestion(currentQuestion + 1);
          slideAnim.setValue(width);
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      } else {
        // All questions answered, navigate to recommendations
        navigation.navigate('Recommendations', { quizResponses: { ...responses, [field]: option.value } });
      }
    }, 200);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(currentQuestion - 1);
        slideAnim.setValue(-width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    if (!question.isRequired) {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        navigation.navigate('Recommendations', { quizResponses: responses });
      }
    }
  };

  const renderOption = (option: QuizOption, index: number) => {
    const isSelected = responses[question.field] === option.value;

    return (
      <TouchableOpacity
        key={option.value}
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        onPress={() => handleSelectOption(option)}
        activeOpacity={0.8}
      >
        {option.icon && (
          <View
            style={[
              styles.optionIcon,
              isSelected && styles.optionIconSelected,
            ]}
          >
            <Ionicons
              name={option.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={isSelected ? '#fff' : theme.colors.primary}
            />
          </View>
        )}
        <View style={styles.optionContent}>
          <Text
            style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
          >
            {option.label}
          </Text>
          {option.description && (
            <Text style={styles.optionDescription}>{option.description}</Text>
          )}
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestion + 1} of {totalQuestions}
            </Text>
          </View>
          {!question.isRequired && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Question */}
        <Animated.View
          style={[
            styles.questionContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={styles.questionText}>{question.question}</Text>

          <ScrollView
            style={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsContent}
          >
            {question.options.map((option, index) => renderOption(option, index))}
          </ScrollView>
        </Animated.View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  skipButton: {
    padding: theme.spacing.sm,
  },
  skipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  questionText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: theme.spacing.md,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSelected: {
    backgroundColor: theme.colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
