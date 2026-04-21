/**
 * PracticesHub \u2014 index screen for guided spiritual practices.
 *
 * Per Decision #6 in the market-capture plan, Lectio Divina / Examen / Memory
 * verse practice leave the chat-mode picker and become dedicated guided
 * linear flows. This hub is their entry point.
 *
 * Premium gating per Decision #12: Lectio + Examen = Pro; Memory + bookmark
 * practice free-forever.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../lib/theme';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Practice {
  id: 'lectio' | 'examen' | 'memory';
  title: string;
  subtitle: string;
  duration: string;
  icon: keyof typeof Ionicons.glyphMap;
  isPro: boolean;
  route: keyof RootStackParamList;
}

const PRACTICES: Practice[] = [
  {
    id: 'lectio',
    title: 'Lectio Divina',
    subtitle: 'Ancient 4-step contemplative reading: Read, Meditate, Pray, Contemplate.',
    duration: '\u223c12 min',
    icon: 'leaf',
    isPro: true,
    route: 'LectioDivina',
  },
  {
    id: 'examen',
    title: 'Evening Examen',
    subtitle: 'Ignatian reflection on the day: Gratitude, Review, Sorrow, Hope, Rest.',
    duration: '\u223c8 min',
    icon: 'moon',
    isPro: true,
    route: 'Examen',
  },
  {
    id: 'memory',
    title: 'Scripture Memory',
    subtitle: 'Hide God\u2019s Word in your heart with spaced repetition (SM-2).',
    duration: '\u223c5 min',
    icon: 'bulb',
    isPro: false,
    route: 'MemoryPractice',
  },
];

export default function PracticesHub() {
  const navigation = useNavigation<NavProp>();
  const { isPremium, showPaywall } = usePremiumStatus();

  const handlePress = (p: Practice) => {
    if (p.isPro && !isPremium) {
      showPaywall();
      return;
    }
    navigation.navigate(p.route as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Practices</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lead}>
          Short, guided rhythms for your walk with God. Come as you are.
        </Text>

        {PRACTICES.map((p) => {
          const locked = p.isPro && !isPremium;
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={() => handlePress(p)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${p.title}. ${locked ? 'Pro feature. ' : ''}${p.subtitle}`}
            >
              <View style={styles.cardIconWrap}>
                <Ionicons name={p.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  {locked && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardSubtitle}>{p.subtitle}</Text>
                <Text style={styles.cardMeta}>{p.duration}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          );
        })}

        <Text style={styles.footnote}>
          More practices coming. Let us know which ancient rhythms you want next.
        </Text>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  lead: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface ?? '#151515',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(201,169,98,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  cardMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: theme.colors.background,
  },
  footnote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
});
