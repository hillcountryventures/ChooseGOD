import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  DevotionalStackParamList,
  DevotionalDay,
  DevotionalSeries,
  getSeriesGradient,
  BottomTabParamList,
} from '../../types';
import { useDevotionalStore, useEnrollments } from '../../store/devotionalStore';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { TappableVerse } from '../../components/TappableVerse';
import { InlineVerseText } from '../../components/InlineVerseText';

type NavigationProp = NativeStackNavigationProp<DevotionalStackParamList, 'DailyDevotional'>;
type RouteProps = RouteProp<DevotionalStackParamList, 'DailyDevotional'>;

export default function DailyDevotionalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { enrollmentId, seriesId, dayNumber } = route.params;
  const { user } = useAuthStore();

  const {
    fetchDayContent,
    fetchSeriesById,
    completeDay,
    currentDay,
    currentDayLoading,
  } = useDevotionalStore();
  const enrollments = useEnrollments();

  const [series, setSeries] = useState<DevotionalSeries | null>(null);
  const [scriptureText, setScriptureText] = useState<string>('');
  const [aiReflection, setAiReflection] = useState<string>('');
  const [reflectionInput, setReflectionInput] = useState('');
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [completing, setCompleting] = useState(false);

  const enrollment = enrollments.find((e) => e.id === enrollmentId);
  const isCompleted = enrollment?.completedDays.includes(dayNumber) || false;

  useEffect(() => {
    loadContent();
  }, [seriesId, dayNumber]);

  const loadContent = async () => {
    // Fetch series info
    const seriesData = await fetchSeriesById(seriesId);
    if (seriesData) {
      setSeries(seriesData);
    }

    // Fetch day content
    const dayData = await fetchDayContent(seriesId, dayNumber);

    if (dayData) {
      // Fetch scripture text
      await loadScripture(dayData);
      // Generate AI reflection
      await generateReflection(dayData, seriesData);
    }
  };

  const loadScripture = async (day: DevotionalDay) => {
    if (day.scriptureRefs.length === 0) {
      setScriptureText('Scripture content will appear here.');
      return;
    }

    try {
      const ref = day.scriptureRefs[0];
      const { data, error } = await supabase
        .from('bible_verses')
        .select('text')
        .eq('book', ref.book)
        .eq('chapter', ref.chapter)
        .gte('verse', ref.verseStart)
        .lte('verse', ref.verseEnd || ref.verseStart)
        .eq('translation', 'kjv')
        .order('verse', { ascending: true });

      if (error) throw error;

      const text = data.map((v) => v.text).join(' ');
      setScriptureText(text || 'Scripture not found.');
    } catch (error) {
      console.error('Error loading scripture:', error);
      setScriptureText('Unable to load scripture.');
    }
  };

  const generateReflection = async (day: DevotionalDay, seriesData: DevotionalSeries | null) => {
    // If we have substantial content in contentPrompt, use it directly
    // This provides a better experience without waiting for AI generation
    if (day.contentPrompt && day.contentPrompt.length > 200) {
      setAiReflection(day.contentPrompt);
      setLoadingReflection(false);
      return;
    }

    if (!user) {
      setAiReflection(day.contentPrompt || 'Take a moment to reflect on today\'s Scripture.');
      setLoadingReflection(false);
      return;
    }

    setLoadingReflection(true);
    try {
      // Call the companion edge function for devotional mode
      const { data, error } = await supabase.functions.invoke('companion', {
        body: {
          userId: user.id,
          message: day.contentPrompt,
          conversationHistory: [],
          contextMode: 'devotional',
          additionalContext: {
            seriesTitle: seriesData?.title,
            dayNumber,
            scriptureRefs: day.scriptureRefs,
          },
        },
      });

      if (error) throw error;
      setAiReflection(data.response || day.contentPrompt);
    } catch (error) {
      console.error('Error generating reflection:', error);
      // Fallback to content prompt
      setAiReflection(day.contentPrompt || 'Take a moment to reflect on today\'s Scripture.');
    } finally {
      setLoadingReflection(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    const success = await completeDay(enrollmentId, dayNumber);
    setCompleting(false);

    if (success && series) {
      navigation.navigate('DevotionalComplete', {
        seriesId,
        dayNumber,
        seriesTitle: series.title,
      });
    }
  };

  const gradient = series ? getSeriesGradient(series.slug) : [theme.colors.primary, theme.colors.primaryDark];

  if (currentDayLoading && !currentDay) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading today's devotional...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={gradient as [string, string]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerDay}>Day {dayNumber}</Text>
              <Text style={styles.headerSeries} numberOfLines={1}>
                {series?.title || 'Loading...'}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Day Title */}
        {currentDay && (
          <Text style={styles.dayTitle}>{currentDay.title}</Text>
        )}

        {/* Scripture Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Today's Scripture</Text>
          </View>
          <View style={styles.scriptureCard}>
            {currentDay?.scriptureRefs[0] && (
              <TappableVerse
                reference={`${currentDay.scriptureRefs[0].book} ${currentDay.scriptureRefs[0].chapter}:${currentDay.scriptureRefs[0].verseStart}${
                  currentDay.scriptureRefs[0].verseEnd &&
                  currentDay.scriptureRefs[0].verseEnd !== currentDay.scriptureRefs[0].verseStart
                    ? `-${currentDay.scriptureRefs[0].verseEnd}`
                    : ''
                }`}
                variant="card"
                showArrow={true}
                style={styles.tappableRef}
              />
            )}
            <Text style={styles.scriptureText}>{scriptureText}</Text>
            {/* Tap hint */}
            <View style={styles.tapHint}>
              <Ionicons name="open-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.tapHintText}>Tap reference to open in Bible</Text>
            </View>
          </View>
        </View>

        {/* AI Reflection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Reflection</Text>
          </View>
          <View style={styles.reflectionCard}>
            {loadingReflection ? (
              <View style={styles.reflectionLoading}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.reflectionLoadingText}>
                  Preparing your reflection...
                </Text>
              </View>
            ) : (
              <InlineVerseText
                text={aiReflection}
                style={styles.reflectionText}
                verseStyle={styles.reflectionVerseLink}
              />
            )}
          </View>
        </View>

        {/* Reflection Questions */}
        {currentDay?.reflectionQuestions && currentDay.reflectionQuestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.sectionTitle}>Reflection Questions</Text>
            </View>
            <View style={styles.questionsCard}>
              {currentDay.reflectionQuestions.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionNumber}>{index + 1}</Text>
                  <Text style={styles.questionText}>{question}</Text>
                </View>
              ))}
            </View>
            <View style={styles.journalCard}>
              <Text style={styles.journalPromptLabel}>Your Journal</Text>
              <TextInput
                style={styles.journalInput}
                placeholder="Write your thoughts..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                value={reflectionInput}
                onChangeText={setReflectionInput}
              />
            </View>
          </View>
        )}

        {/* Prayer Focus */}
        {currentDay?.prayerFocus && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={20} color={theme.colors.prayer} />
              <Text style={styles.sectionTitle}>Prayer Focus</Text>
            </View>
            <View style={styles.prayerCard}>
              <Text style={styles.prayerText}>{currentDay.prayerFocus}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {isCompleted ? (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <Text style={styles.completedText}>Day {dayNumber} Completed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            disabled={completing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.completeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {completing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.completeText}>Mark Day Complete</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
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
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  headerGradient: {
    paddingBottom: theme.spacing.md,
  },
  header: {
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
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  headerDay: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSeries: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  dayTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  scriptureCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  tappableRef: {
    marginBottom: theme.spacing.md,
  },
  scriptureText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tapHintText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  reflectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  reflectionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  reflectionLoadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  reflectionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  reflectionVerseLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  questionsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  questionNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    width: 24,
  },
  questionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
    flex: 1,
  },
  journalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  journalPrompt: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  journalPromptLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  journalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  prayerCard: {
    backgroundColor: theme.colors.primaryAlpha[10],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  prayerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  completeButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  completeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  completeText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  completedText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
});
