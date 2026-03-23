/**
 * TranslationSelectScreen - Bible translation preference
 *
 * Simple selection of preferred Bible translation.
 * Shows only available translations based on device language.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Localization from 'expo-localization';
import { theme } from '../../lib/theme';
import { OnboardingStackParamList, Translation, TRANSLATIONS } from '../../types';
import { useStore } from '../../store/useStore';
import { useTrackScreen } from '../../hooks/useAnalytics';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'TranslationSelect'>;
type RouteProps = RouteProp<OnboardingStackParamList, 'TranslationSelect'>;

// English translations to show prominently (NIV first - most popular)
const ENGLISH_TRANSLATIONS: Translation[] = ['NIV', 'KJV', 'ASV'];

// Map device language to translation
const LANGUAGE_MAP: Record<string, Translation[]> = {
  'en': ['KJV', 'NIV', 'ASV'],
  'es': ['RVR1960', 'RVR'],
  'pt': ['PAA'],
  'de': ['SCHLACHTER'],
  'fr': ['FRENCH'],
  'zh': ['CUV'],
  'ko': ['KOREAN'],
  'ru': ['SYNODAL'],
  'vi': ['VIETNAMESE'],
  'ro': ['ROMANIAN'],
  'fi': ['FINNISH'],
};

export default function TranslationSelectScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  useTrackScreen('onboarding_translation');

  const updatePreferences = useStore((s) => s.updatePreferences);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation>('NIV');

  // Get device language
  const deviceLanguage = Localization.locale.split('-')[0];
  const suggestedTranslations = LANGUAGE_MAP[deviceLanguage] || ENGLISH_TRANSLATIONS;

  // Get translation info
  const availableTranslations = useMemo(() => {
    return TRANSLATIONS.filter((t) => suggestedTranslations.includes(t.id));
  }, [suggestedTranslations]);

  // If device isn't English, also show English options
  const showEnglishSection = deviceLanguage !== 'en' && !['en'].includes(deviceLanguage);
  const englishTranslations = useMemo(() => {
    return TRANSLATIONS.filter((t) => ENGLISH_TRANSLATIONS.includes(t.id));
  }, []);

  const handleSelect = (translation: Translation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTranslation(translation);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Save preference
    updatePreferences({ preferredTranslation: selectedTranslation });
    
    // Navigate to short quiz (just time + experience)
    navigation.navigate('Quiz', {
      emotionalContext: route.params?.emotionalContext,
    });
  };

  const renderTranslationOption = (translationId: Translation) => {
    const info = TRANSLATIONS.find((t) => t.id === translationId);
    if (!info) return null;

    const isSelected = selectedTranslation === translationId;

    return (
      <TouchableOpacity
        key={translationId}
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        onPress={() => handleSelect(translationId)}
        activeOpacity={0.8}
      >
        <View style={styles.optionContent}>
          <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
            {info.name}
          </Text>
          <Text style={styles.optionDescription}>{info.description}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={styles.questionContainer}>
          <Ionicons name="book-outline" size={32} color={theme.colors.primary} />
          <Text style={styles.question}>Which Bible translation do you prefer?</Text>
          <Text style={styles.subtext}>You can change this anytime in settings.</Text>
        </View>

        {/* Primary translations based on language */}
        <View style={styles.section}>
          {availableTranslations.map((t) => renderTranslationOption(t.id))}
        </View>

        {/* English section for non-English devices */}
        {showEnglishSection && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>English</Text>
            {englishTranslations.map((t) => renderTranslationOption(t.id))}
          </View>
        )}
      </ScrollView>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  question: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  subtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  section: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryAlpha[10],
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionNameSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  continueButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
