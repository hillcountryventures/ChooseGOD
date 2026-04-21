/**
 * PrivacyCenterScreen \u2014 the "Signal of Christian apps" surface.
 *
 * Per Decision #16, this is loud privacy positioning. Users can see in
 * one place:
 *   - Our data commitments (what we do and don't do with their content)
 *   - Their own crisis flags (radical transparency, Pillar #4)
 *   - Download / delete their data
 *   - Training data opt-out status
 *
 * Accessed from Settings.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { logger } from '../../utils/logger';

interface CrisisFlag {
  id: string;
  tier: number;
  message_preview: string;
  created_at: string;
}

const COMMITMENTS: Array<{ icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = [
  {
    icon: 'lock-closed',
    title: 'Your content is encrypted',
    body: 'Journal entries, prayers, and chat history are encrypted at rest. A database breach would leak nothing readable.',
  },
  {
    icon: 'ban',
    title: 'No ads. No AdTech. Ever.',
    body: 'No Facebook pixel. No TikTok tracking. No selling data. Your walk with God is not a product we resell.',
  },
  {
    icon: 'sparkles',
    title: 'Your words don\u2019t train AI',
    body: 'We set explicit training-opt-out on every AI call. Your journal entries and prayers are yours \u2014 not fuel for someone else\u2019s model.',
  },
  {
    icon: 'heart',
    title: 'Crisis flags are transparent',
    body: 'If you mention self-harm or crisis, we save a flag so we can check in later. You can see and delete every flag below. It\u2019s never shared with anyone.',
  },
  {
    icon: 'archive',
    title: 'Take your data anytime',
    body: 'Download everything we have in one tap. Delete your account with a 24-hour grace window \u2014 we export your data first.',
  },
];

export default function PrivacyCenterScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [flags, setFlags] = useState<CrisisFlag[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(true);

  const loadFlags = useCallback(async () => {
    if (!user?.id) return;
    setLoadingFlags(true);
    try {
      const { data, error } = await supabase
        .from('crisis_flags')
        .select('id, tier, message_preview, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      setFlags((data ?? []) as CrisisFlag[]);
    } catch (err) {
      logger.warn('[PrivacyCenter] load flags failed', err);
    } finally {
      setLoadingFlags(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const deleteFlag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crisis_flags')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setFlags((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      logger.error('[PrivacyCenter] delete flag failed', err);
      Alert.alert('Couldn\u2019t delete', 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.tagline}>
          Your prayers are sacred. We treat them that way.
        </Text>

        <Text style={styles.sectionHeader}>Our Commitments</Text>
        {COMMITMENTS.map((c) => (
          <View key={c.title} style={styles.commitmentRow}>
            <View style={styles.commitmentIconWrap}>
              <Ionicons name={c.icon} size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.commitmentTitle}>{c.title}</Text>
              <Text style={styles.commitmentBody}>{c.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionHeader}>Your Crisis Flags</Text>
        <Text style={styles.sectionBlurb}>
          When you mention self-harm or crisis, we save a flag so we can check in on
          you later. Only you and our safety team can see these. Delete any you want
          \u2014 we respect your choice completely.
        </Text>
        {loadingFlags ? (
          <ActivityIndicator style={{ marginVertical: 16 }} color={theme.colors.primary} />
        ) : flags.length === 0 ? (
          <View style={styles.emptyFlags}>
            <Text style={styles.emptyFlagsText}>
              No flags. We\u2019re glad you\u2019re here. \U0001F90D
            </Text>
          </View>
        ) : (
          flags.map((f) => (
            <View key={f.id} style={styles.flagRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.flagTier}>Tier {f.tier}</Text>
                <Text style={styles.flagPreview} numberOfLines={2}>
                  {f.message_preview}
                </Text>
                <Text style={styles.flagDate}>
                  {new Date(f.created_at).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteFlag(f.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete flag from ${new Date(f.created_at).toLocaleDateString()}`}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={styles.footnote}>
          Read the full privacy policy at choosegod.app/privacy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionBlurb: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 19,
    marginBottom: 12,
  },
  commitmentRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  commitmentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(201,169,98,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  commitmentBody: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 19,
  },
  emptyFlags: {
    padding: 18,
    backgroundColor: 'rgba(201,169,98,0.05)',
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyFlagsText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  flagTier: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  flagPreview: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  flagDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  deleteBtn: {
    padding: 6,
  },
  footnote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 30,
    textAlign: 'center',
  },
});
