import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { useDailyVerse } from '../hooks/useDailyVerse';
import { ChatMode, BottomTabParamList, RootStackParamList } from '../types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QUICK_CARD_WIDTH = SCREEN_WIDTH * 0.7;

// Practice configuration with gradients and icons
const PRACTICES = {
  devotional: {
    icon: 'sunny',
    label: 'Devotional',
    gradient: ['#F59E0B', '#D97706'],
    description: 'Start your day with God',
    badge: "Today's Topic",
  },
  prayer: {
    icon: 'heart',
    label: 'Prayer',
    gradient: ['#EF4444', '#DC2626'],
    description: 'Bring your heart to God',
    badge: null,
  },
  journal: {
    icon: 'book',
    label: 'Journal',
    gradient: ['#6366F1', '#4F46E5'],
    description: 'Reflect and process',
    badge: null,
  },
  gratitude: {
    icon: 'sparkles',
    label: 'Gratitude',
    gradient: ['#F59E0B', '#FBBF24'],
    description: 'Count your blessings',
    badge: null,
  },
  lectio: {
    icon: 'leaf',
    label: 'Lectio Divina',
    gradient: ['#22C55E', '#16A34A'],
    description: 'Sacred reading practice',
    badge: 'Guided',
  },
  examen: {
    icon: 'moon',
    label: 'Evening Examen',
    gradient: ['#8B5CF6', '#7C3AED'],
    description: 'Review your day with God',
    badge: null,
  },
  memory: {
    icon: 'bulb',
    label: 'Memorize',
    gradient: ['#F59E0B', '#EA580C'],
    description: "Hide God's word in your heart",
    badge: null,
  },
  confession: {
    icon: 'water',
    label: 'Heart Check',
    gradient: ['#3B82F6', '#2563EB'],
    description: 'Examine your heart gently',
    badge: null,
  },
} as const;

// Hero Verse Card Component
function HeroVerseCard() {
  const navigation = useNavigation<NavigationProp>();
  const { dailyVerse, fetchDailyVerse, isLoading } = useDailyVerse();

  useEffect(() => {
    fetchDailyVerse();
  }, [fetchDailyVerse]);

  const handleReflect = () => {
    if (!dailyVerse) return;
    const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;
    navigation.navigate('ReflectionModal', {
      verse: dailyVerse.verse,
      reference,
    });
  };

  const handleShare = async () => {
    if (!dailyVerse) return;
    const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;
    try {
      await Share.share({
        message: `"${dailyVerse.verse.text}"\n\n— ${reference}\n\nShared from ChooseGOD`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading || !dailyVerse) {
    return (
      <View style={styles.heroCard}>
        <LinearGradient colors={['#1F1F1F', '#2A2A2A']} style={styles.heroGradient}>
          <View style={styles.heroLoading}>
            <Ionicons name="book-outline" size={32} color={theme.colors.textMuted} />
            <Text style={styles.heroLoadingText}>Loading today&apos;s verse...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;

  return (
    <View style={styles.heroCard}>
      <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.heroGradient}>
        <View style={styles.heroDecoration}>
          <Ionicons name="sparkles" size={16} color="rgba(245, 158, 11, 0.3)" />
        </View>

        <View style={styles.heroHeader}>
          <View style={styles.heroTitleRow}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="sunny" size={14} color={theme.colors.accent} />
            </View>
            <Text style={styles.heroTitle}>VERSE OF THE DAY</Text>
          </View>
        </View>

        <Text style={styles.heroVerseText}>&quot;{dailyVerse.verse.text}&quot;</Text>

        <Text style={styles.heroReference}>— {reference}</Text>

        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.heroActionBtn} onPress={handleReflect}>
            <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.heroActionText}>Reflect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroActionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.heroActionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

// Proverbs of the Day Component
function ProverbsOfTheDay({ onPress }: { onPress: () => void }) {
  const dayOfMonth = new Date().getDate();
  // Proverbs has 31 chapters, one for each day
  const proverbsChapter = dayOfMonth > 31 ? 31 : dayOfMonth;

  return (
    <TouchableOpacity style={styles.proverbsCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.proverbsIconContainer}>
        <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.proverbsContent}>
        <Text style={styles.proverbsTitle}>Proverbs of the Day</Text>
        <Text style={styles.proverbsSubtitle}>Read Proverbs {proverbsChapter} today</Text>
      </View>
      <View style={styles.proverbsChapterBadge}>
        <Text style={styles.proverbsChapterText}>{proverbsChapter}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

// Streak/Progress Bar Component
function StreakBar() {
  const recentMoments = useStore((state) => state.recentMoments);

  const streak = Math.min(recentMoments.length, 7);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  return (
    <View style={styles.streakBar}>
      <View style={styles.streakHeader}>
        <View style={styles.streakTitleRow}>
          <Ionicons name="flame" size={18} color={theme.colors.accent} />
          <Text style={styles.streakTitle}>
            {streak > 0 ? `${streak} day streak` : 'Start your streak'}
          </Text>
        </View>
        <Text style={styles.streakSubtitle}>Keep growing daily</Text>
      </View>
      <View style={styles.streakDays}>
        {weekDays.map((day, index) => {
          const isCompleted = index <= today && streak > today - index;
          const isToday = index === today;
          return (
            <View
              key={index}
              style={[
                styles.streakDay,
                isCompleted && styles.streakDayCompleted,
                isToday && styles.streakDayToday,
              ]}
            >
              <Text style={[styles.streakDayText, isCompleted && styles.streakDayTextCompleted]}>
                {day}
              </Text>
              {isCompleted && (
                <Ionicons name="checkmark" size={10} color="#fff" style={styles.streakCheck} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Quick Start Card Component
interface QuickStartCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  gradient: string[];
  onPress: () => void;
  badge?: string;
}

function QuickStartCard({ icon, title, subtitle, gradient, onPress, badge }: QuickStartCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickCard}
      >
        {badge && (
          <View style={styles.quickBadge}>
            <Text style={styles.quickBadgeText}>{badge}</Text>
          </View>
        )}
        <View style={styles.quickIconContainer}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickSubtitle}>{subtitle}</Text>
        <View style={styles.quickArrow}>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Practice Grid Card Component
interface PracticeCardProps {
  config: (typeof PRACTICES)[keyof typeof PRACTICES];
  onPress: () => void;
  count?: number;
  lastDate?: string;
}

function PracticeCard({ config, onPress, count, lastDate }: PracticeCardProps) {
  return (
    <TouchableOpacity style={styles.practiceCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.practiceHeader}>
        <LinearGradient colors={config.gradient as [string, string]} style={styles.practiceIconBg}>
          <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
        </LinearGradient>
        {config.badge && (
          <View style={styles.practiceBadge}>
            <Text style={styles.practiceBadgeText}>{config.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.practiceLabel}>{config.label}</Text>
      <Text style={styles.practiceDescription}>{config.description}</Text>

      {count !== undefined && count > 0 && (
        <View style={styles.practiceMetric}>
          <Text style={styles.practiceMetricText}>{count} active</Text>
        </View>
      )}
      {lastDate && <Text style={styles.practiceLastDate}>Last: {lastDate}</Text>}
    </TouchableOpacity>
  );
}

// Floating Ask Bar Component
function FloatingAskBar({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.floatingBar}>
      <TouchableOpacity style={styles.floatingInput} onPress={onPress} activeOpacity={0.9}>
        <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.floatingPlaceholder}>Ask anything about Scripture...</Text>
        <View style={styles.floatingArrow}>
          <Ionicons name="arrow-forward-circle" size={24} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Reminder Card Component
interface ReminderCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ReminderCard({ icon, iconBg, title, subtitle, onPress }: ReminderCardProps) {
  return (
    <TouchableOpacity style={styles.reminderCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.reminderIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <View style={styles.reminderContent}>
        <Text style={styles.reminderTitle}>{title}</Text>
        <Text style={styles.reminderSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const activePrayers = useStore((state) => state.activePrayers);
  const pendingObedienceSteps = useStore((state) => state.pendingObedienceSteps);
  const memoryVersesDue = useStore((state) => state.memoryVersesDue);
  const recentMoments = useStore((state) => state.recentMoments);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const navigateToChat = (mode: ChatMode, initialMessage?: string) => {
    navigation.navigate('Ask', { mode, initialMessage });
  };

  const lastJournalMoment = recentMoments.find((m) => m.momentType === 'journal');
  const lastJournalDate = lastJournalMoment
    ? new Date(lastJournalMoment.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : undefined;

  const todayGratitudeCount = recentMoments.filter(
    (m) =>
      m.momentType === 'gratitude' &&
      new Date(m.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>What&apos;s on your heart today?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="person-circle-outline" size={36} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Verse Card */}
        <HeroVerseCard />

        {/* Proverbs of the Day */}
        <ProverbsOfTheDay
          onPress={() => {
            const chapter = new Date().getDate();
            navigateToChat('lectio', `Let's read and reflect on Proverbs ${chapter} together`);
          }}
        />

        {/* Streak Bar */}
        <StreakBar />

        {/* Quick Start Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScrollContent}
          >
            <QuickStartCard
              icon="sunny"
              title="Today's Devotional"
              subtitle="Personalized for you"
              gradient={['#F59E0B', '#D97706']}
              badge="NEW"
              onPress={() => navigateToChat('devotional', "I'm ready for today's devotional")}
            />
            <QuickStartCard
              icon="book"
              title="Continue Journal"
              subtitle={lastJournalDate ? `Last: ${lastJournalDate}` : 'Start writing'}
              gradient={['#6366F1', '#4F46E5']}
              onPress={() => navigateToChat('journal')}
            />
            <QuickStartCard
              icon="heart"
              title="Prayer Time"
              subtitle={
                activePrayers.length > 0
                  ? `${activePrayers.length} active requests`
                  : 'Bring your heart to God'
              }
              gradient={['#EF4444', '#DC2626']}
              onPress={() => navigateToChat('prayer')}
            />
            <QuickStartCard
              icon="sparkles"
              title="Gratitude"
              subtitle={
                todayGratitudeCount > 0 ? `${todayGratitudeCount} today` : 'Count your blessings'
              }
              gradient={['#F59E0B', '#FBBF24']}
              onPress={() => navigateToChat('gratitude')}
            />
          </ScrollView>
        </View>

        {/* Reminders Section */}
        {(memoryVersesDue.length > 0 ||
          pendingObedienceSteps.length > 0 ||
          activePrayers.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            {memoryVersesDue.length > 0 && (
              <ReminderCard
                icon="bulb"
                iconBg={theme.colors.accent}
                title="Memory Review"
                subtitle={`${memoryVersesDue.length} verse${memoryVersesDue.length > 1 ? 's' : ''} ready to review`}
                onPress={() => navigateToChat('memory')}
              />
            )}
            {pendingObedienceSteps.length > 0 && (
              <ReminderCard
                icon="checkmark-circle"
                iconBg="#22C55E"
                title="Obedience Steps"
                subtitle={`${pendingObedienceSteps.length} commitment${pendingObedienceSteps.length > 1 ? 's' : ''} to follow up`}
                onPress={() => navigation.navigate('Journey')}
              />
            )}
            {activePrayers.length > 0 && (
              <ReminderCard
                icon="heart"
                iconBg="#EF4444"
                title="Active Prayers"
                subtitle={`${activePrayers.length} prayer${activePrayers.length > 1 ? 's' : ''} before the Lord`}
                onPress={() => navigation.navigate('Prayers')}
              />
            )}
          </View>
        )}

        {/* Spiritual Practices Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spiritual Practices</Text>
          <View style={styles.practicesGrid}>
            <PracticeCard
              config={PRACTICES.devotional}
              onPress={() => navigateToChat('devotional', "I'm ready for today's devotional")}
            />
            <PracticeCard
              config={PRACTICES.prayer}
              onPress={() => navigateToChat('prayer')}
              count={activePrayers.length}
            />
            <PracticeCard
              config={PRACTICES.journal}
              onPress={() => navigateToChat('journal')}
              lastDate={lastJournalDate}
            />
            <PracticeCard config={PRACTICES.gratitude} onPress={() => navigateToChat('gratitude')} />
            <PracticeCard config={PRACTICES.lectio} onPress={() => navigateToChat('lectio')} />
            <PracticeCard config={PRACTICES.examen} onPress={() => navigateToChat('examen')} />
            <PracticeCard
              config={PRACTICES.memory}
              onPress={() => navigateToChat('memory')}
              count={memoryVersesDue.length}
            />
            <PracticeCard
              config={PRACTICES.confession}
              onPress={() => navigateToChat('confession')}
            />
          </View>
        </View>

        {/* Spacer for floating bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Ask Bar */}
      <FloatingAskBar onPress={() => navigateToChat('auto')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileButton: {
    padding: theme.spacing.xs,
  },

  // Hero Verse Card
  heroCard: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  heroGradient: {
    padding: theme.spacing.lg,
    minHeight: 200,
  },
  heroDecoration: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.5,
  },
  heroHeader: {
    marginBottom: theme.spacing.md,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  heroVerseText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    lineHeight: theme.fontSize.xl * 1.6,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  heroReference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: theme.borderRadius.full,
  },
  heroActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  heroLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroLoadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },

  // Proverbs of the Day
  proverbsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  proverbsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proverbsContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  proverbsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  proverbsSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  proverbsChapterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  proverbsChapterText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },

  // Streak Bar
  streakBar: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  streakTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  streakSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  streakDayCompleted: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  streakDayToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  streakDayText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
  },
  streakDayTextCompleted: {
    color: '#fff',
  },
  streakCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  // Section
  section: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  // Quick Start Cards
  quickScrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  quickCard: {
    width: QUICK_CARD_WIDTH,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    minHeight: 140,
  },
  quickBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: theme.borderRadius.full,
  },
  quickBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  quickIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  quickTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  quickSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  quickArrow: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },

  // Reminder Cards
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  reminderTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  reminderSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Practices Grid
  practicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  practiceCard: {
    width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 130,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  practiceIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.primary + '30',
    borderRadius: theme.borderRadius.full,
  },
  practiceBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  practiceLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  practiceDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    lineHeight: theme.fontSize.xs * 1.4,
  },
  practiceMetric: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  practiceMetricText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  practiceLastDate: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },

  // Floating Ask Bar
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  floatingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  floatingPlaceholder: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  floatingArrow: {
    marginLeft: theme.spacing.sm,
  },
});
