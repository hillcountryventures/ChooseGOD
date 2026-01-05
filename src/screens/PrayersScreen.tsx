import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { PrayerRequest, BottomTabParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<BottomTabParamList>;

type TabType = 'active' | 'answered';

function TabButton({
  active,
  label,
  count,
  onPress,
}: {
  active: boolean;
  label: string;
  count?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
        {count !== undefined && count > 0 && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );
}

function PrayerCard({
  prayer,
  onMarkAnswered,
}: {
  prayer: PrayerRequest;
  onMarkAnswered: (id: string) => void;
}) {
  const formattedDate = new Date(prayer.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const daysSince = Math.floor(
    (Date.now() - new Date(prayer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.prayerCard}>
      <Text style={styles.prayerText}>{prayer.request}</Text>

      {prayer.scriptureAnchor && (
        <View style={styles.scriptureAnchor}>
          <Ionicons name="book-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.scriptureText}>
            Standing on: {prayer.scriptureAnchor.book} {prayer.scriptureAnchor.chapter}:
            {prayer.scriptureAnchor.verse}
          </Text>
        </View>
      )}

      <View style={styles.prayerFooter}>
        <Text style={styles.prayerDate}>
          Praying since {formattedDate}
          {daysSince > 0 && ` (${daysSince} day${daysSince > 1 ? 's' : ''})`}
        </Text>
        {prayer.status === 'active' && (
          <TouchableOpacity
            style={styles.answeredButton}
            onPress={() => onMarkAnswered(prayer.id)}
          >
            <Text style={styles.answeredButtonText}>God Answered!</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function AnsweredPrayerCard({ prayer }: { prayer: PrayerRequest }) {
  const answeredDate = prayer.answeredAt
    ? new Date(prayer.answeredAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <View style={[styles.prayerCard, styles.answeredCard]}>
      <View style={styles.answeredBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
        <Text style={styles.answeredBadgeText}>Answered</Text>
      </View>

      <Text style={styles.prayerText}>{prayer.request}</Text>

      {prayer.answeredReflection && (
        <View style={styles.reflectionContainer}>
          <Text style={styles.reflectionLabel}>How God answered:</Text>
          <Text style={styles.reflectionText}>{prayer.answeredReflection}</Text>
        </View>
      )}

      {answeredDate && (
        <Text style={styles.answeredDate}>Answered on {answeredDate}</Text>
      )}
    </View>
  );
}

function EmptyPrayers({ tab }: { tab: TabType }) {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={tab === 'active' ? 'heart-outline' : 'trophy-outline'}
        size={64}
        color={theme.colors.textMuted}
      />
      <Text style={styles.emptyTitle}>
        {tab === 'active' ? 'No Active Prayers' : 'No Answered Prayers Yet'}
      </Text>
      <Text style={styles.emptyText}>
        {tab === 'active'
          ? 'Start a conversation to add prayer requests. The companion will help you articulate your needs before the Lord.'
          : "When God answers your prayers, they'll be celebrated here as testimonials of His faithfulness."}
      </Text>
      {tab === 'active' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() =>
            navigation.navigate('Ask', { mode: 'prayer' })
          }
        >
          <Ionicons name="add" size={20} color={theme.colors.text} />
          <Text style={styles.emptyButtonText}>Start Praying</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PrayersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const activePrayers = useStore((state) => state.activePrayers);
  const updatePrayer = useStore((state) => state.updatePrayer);

  const active = activePrayers.filter((p) => p.status === 'active');
  const answered = activePrayers.filter((p) => p.status === 'answered');

  const handleMarkAnswered = (id: string) => {
    // Navigate to chat for reflection
    navigation.navigate('Ask', {
      mode: 'celebration',
      initialMessage: "God answered my prayer! Let me tell you what happened...",
    });
    // Update prayer status
    updatePrayer(id, {
      status: 'answered',
      answeredAt: new Date(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Prayers</Text>
          <Text style={styles.subtitle}>Your conversation with God</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('Ask', { mode: 'prayer' })
          }
        >
          <Ionicons name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TabButton
          active={activeTab === 'active'}
          label="Active"
          count={active.length}
          onPress={() => setActiveTab('active')}
        />
        <TabButton
          active={activeTab === 'answered'}
          label="Answered"
          count={answered.length}
          onPress={() => setActiveTab('answered')}
        />
      </View>

      {/* Content */}
      {activeTab === 'active' && (
        active.length > 0 ? (
          <FlatList
            data={active}
            renderItem={({ item }) => (
              <PrayerCard prayer={item} onMarkAnswered={handleMarkAnswered} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <EmptyPrayers tab="active" />
          </ScrollView>
        )
      )}

      {activeTab === 'answered' && (
        answered.length > 0 ? (
          <FlatList
            data={answered}
            renderItem={({ item }) => <AnsweredPrayerCard prayer={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <EmptyPrayers tab="answered" />
          </ScrollView>
        )
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.text,
  },
  scrollContent: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  prayerCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  answeredCard: {
    borderColor: '#22C55E30',
  },
  prayerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.5,
  },
  scriptureAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  scriptureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  prayerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  prayerDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  answeredButton: {
    backgroundColor: '#22C55E',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  answeredButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  answeredBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#22C55E',
    textTransform: 'uppercase',
  },
  reflectionContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reflectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  reflectionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  answeredDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: theme.fontSize.md * 1.5,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
  },
  emptyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});
