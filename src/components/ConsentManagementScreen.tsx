/**
 * ConsentManagementScreen - Privacy consent toggles
 *
 * Allows users to opt in/out of analytics (PostHog) and crash reporting (Sentry).
 * Stores consent state in AsyncStorage.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

const CONSENT_ANALYTICS_KEY = '@choosegod_consent_analytics';
const CONSENT_CRASH_KEY = '@choosegod_consent_crash';

/**
 * Helper to read current consent state from AsyncStorage.
 */
async function loadConsent(): Promise<{ analytics: boolean; crash: boolean }> {
  try {
    const [analytics, crash] = await Promise.all([
      AsyncStorage.getItem(CONSENT_ANALYTICS_KEY),
      AsyncStorage.getItem(CONSENT_CRASH_KEY),
    ]);
    return {
      analytics: analytics !== 'false', // default true
      crash: crash !== 'false', // default true
    };
  } catch {
    return { analytics: true, crash: true };
  }
}

export default function ConsentManagementScreen() {
  const navigation = useNavigation();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashEnabled, setCrashEnabled] = useState(true);

  useEffect(() => {
    loadConsent().then(({ analytics, crash }) => {
      setAnalyticsEnabled(analytics);
      setCrashEnabled(crash);
    });
  }, []);

  const handleAnalyticsToggle = useCallback(async (value: boolean) => {
    setAnalyticsEnabled(value);
    try {
      await AsyncStorage.setItem(CONSENT_ANALYTICS_KEY, String(value));
      // Dynamically import to avoid hard crashes if PostHog isn't configured
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const posthog = require('posthog-react-native');
        if (value) {
          posthog.default?.optIn?.();
        } else {
          posthog.default?.optOut?.();
        }
      } catch {
        // PostHog not available — no-op
      }
    } catch {
      Alert.alert('Error', 'Failed to save analytics preference.');
    }
  }, []);

  const handleCrashToggle = useCallback(async (value: boolean) => {
    setCrashEnabled(value);
    try {
      await AsyncStorage.setItem(CONSENT_CRASH_KEY, String(value));
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Sentry = require('@sentry/react-native');
        if (value) {
          Sentry.init({ enabled: true });
        } else {
          Sentry.close?.();
        }
      } catch {
        // Sentry not available — no-op
      }
    } catch {
      Alert.alert('Error', 'Failed to save crash reporting preference.');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Privacy &amp; Data</Text>
            <Text style={styles.subtitle}>Manage what data we collect</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Your data belongs to you. Toggle these settings to control what ChooseGOD collects. Changes take effect immediately.
          </Text>
        </View>

        {/* Analytics */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: theme.colors.info + '20' }]}>
                <Ionicons name="analytics" size={18} color={theme.colors.info} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Analytics</Text>
                <Text style={styles.rowDescription}>
                  Helps us understand how you use the app so we can improve it. No personal data is shared.
                </Text>
              </View>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={handleAnalyticsToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.text}
            />
          </View>

          <View style={styles.divider} />

          {/* Crash Reporting */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: theme.colors.error + '20' }]}>
                <Ionicons name="bug" size={18} color={theme.colors.error} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Crash Reporting</Text>
                <Text style={styles.rowDescription}>
                  Sends anonymous crash reports so we can fix bugs faster. No personal information is included.
                </Text>
              </View>
            </View>
            <Switch
              value={crashEnabled}
              onValueChange={handleCrashToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.text}
            />
          </View>
        </View>

        {/* What We Collect */}
        <Text style={styles.sectionHeader}>WHAT WE COLLECT</Text>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.infoRowText}>Screen views &amp; feature usage (anonymous)</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.infoRowText}>Crash logs &amp; error traces (anonymous)</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="close-circle" size={16} color={theme.colors.error} />
            <Text style={styles.infoRowText}>We never sell your data to third parties</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="close-circle" size={16} color={theme.colors.error} />
            <Text style={styles.infoRowText}>We never share your prayers or journal entries</Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '15',
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: 10,
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  rowDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  infoRowText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
