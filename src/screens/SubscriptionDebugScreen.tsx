/**
 * SubscriptionDebugScreen - Subscription Diagnostics
 *
 * Debug screen to help troubleshoot subscription issues.
 * Shows RevenueCat status, entitlements, and verification info.
 * Only visible in development or via secret gesture.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import { theme } from '../lib/theme';
import {
  useSubscriptionStore,
  SubscriptionDebugInfo,
} from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';
import { useTrackScreen } from '../hooks/useAnalytics';

// ============================================================================
// Debug Info Row Component
// ============================================================================
interface DebugRowProps {
  label: string;
  value: string | boolean | null | undefined;
  valueColor?: string;
  isLast?: boolean;
}

function DebugRow({ label, value, valueColor, isLast = false }: DebugRowProps) {
  const displayValue = value === null || value === undefined
    ? 'N/A'
    : typeof value === 'boolean'
    ? value ? 'Yes' : 'No'
    : String(value);

  const color = valueColor || (
    value === true ? theme.colors.success :
    value === false ? theme.colors.error :
    theme.colors.text
  );

  return (
    <View style={[styles.debugRow, isLast && styles.debugRowLast]}>
      <Text style={styles.debugLabel}>{label}</Text>
      <Text style={[styles.debugValue, { color }]}>{displayValue}</Text>
    </View>
  );
}

// ============================================================================
// Section Component
// ============================================================================
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================
export default function SubscriptionDebugScreen() {
  useTrackScreen('subscription_debug');
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const getSubscriptionDebugInfo = useSubscriptionStore((s) => s.getSubscriptionDebugInfo);
  const refreshCustomerInfo = useSubscriptionStore((s) => s.refreshCustomerInfo);
  const restorePurchases = useSubscriptionStore((s) => s.restorePurchases);
  const isRestoring = useSubscriptionStore((s) => s.isRestoring);

  const [debugInfo, setDebugInfo] = useState<SubscriptionDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawCustomerInfo, setRawCustomerInfo] = useState<string | null>(null);

  // Load debug info
  const loadDebugInfo = useCallback(async () => {
    try {
      const info = getSubscriptionDebugInfo();
      setDebugInfo(info);

      // Get raw customer info for detailed debugging
      const isConfigured = await Purchases.isConfigured();
      if (isConfigured) {
        const customerInfo = await Purchases.getCustomerInfo();
        setRawCustomerInfo(JSON.stringify(customerInfo, null, 2));
      }
    } catch (error) {
      logger.error('[Debug] Error loading info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getSubscriptionDebugInfo]);

  useEffect(() => {
    loadDebugInfo();
  }, [loadDebugInfo]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshCustomerInfo();
    await loadDebugInfo();
    setIsRefreshing(false);
  }, [refreshCustomerInfo, loadDebugInfo]);

  // Restore handler
  const handleRestore = useCallback(async () => {
    const result = await restorePurchases();
    Alert.alert(
      result.success ? 'Restored' : 'Not Found',
      result.message
    );
    await loadDebugInfo();
  }, [restorePurchases, loadDebugInfo]);

  // Export debug info
  const handleExport = useCallback(async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      debugInfo,
      rawCustomerInfo: rawCustomerInfo ? JSON.parse(rawCustomerInfo) : null,
    };

    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: 'ChooseGOD Subscription Debug Info',
      });
    } catch (error) {
      logger.error('[Debug] Export error:', error);
    }
  }, [debugInfo, rawCustomerInfo, user?.id]);

  // Get verification status color
  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return theme.colors.success;
      case 'VERIFIED_ON_DEVICE':
        return theme.colors.accent;
      case 'FAILED':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Loading debug info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription Debug</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
          <Ionicons name="share-outline" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* Status Overview */}
        <Section title="Status Overview">
          <DebugRow
            label="Premium Active"
            value={debugInfo?.isPremium}
          />
          <DebugRow
            label="Verification Status"
            value={debugInfo?.verificationStatus}
            valueColor={getVerificationColor(debugInfo?.verificationStatus || '')}
          />
          <DebugRow
            label="RevenueCat Configured"
            value={debugInfo?.isConfigured}
          />
          <DebugRow
            label="Has Customer Info"
            value={debugInfo?.hasCustomerInfo}
            isLast
          />
        </Section>

        {/* Entitlements */}
        <Section title="Active Entitlements">
          {debugInfo?.activeEntitlements && debugInfo.activeEntitlements.length > 0 ? (
            debugInfo.activeEntitlements.map((entitlement, index) => (
              <DebugRow
                key={entitlement}
                label={`Entitlement ${index + 1}`}
                value={entitlement}
                valueColor={theme.colors.success}
                isLast={index === debugInfo.activeEntitlements.length - 1}
              />
            ))
          ) : (
            <DebugRow
              label="Entitlements"
              value="None active"
              valueColor={theme.colors.textMuted}
              isLast
            />
          )}
        </Section>

        {/* Subscription Details */}
        <Section title="Subscription Details">
          <DebugRow
            label="Original App User ID"
            value={debugInfo?.originalAppUserId}
          />
          <DebugRow
            label="Latest Expiration"
            value={debugInfo?.latestExpirationDate
              ? new Date(debugInfo.latestExpirationDate).toLocaleString()
              : null}
          />
          <DebugRow
            label="Management URL"
            value={debugInfo?.managementUrl ? 'Available' : 'Not available'}
            isLast
          />
        </Section>

        {/* User Info */}
        <Section title="User Info">
          <DebugRow
            label="Supabase User ID"
            value={user?.id || 'Not logged in'}
          />
          <DebugRow
            label="Email"
            value={user?.email}
            isLast
          />
        </Section>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color={theme.colors.text} />
                <Text style={styles.actionButtonText}>Refresh Status</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={20} color={theme.colors.accent} />
                <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                  Restore Purchases
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Raw Customer Info (collapsible) */}
        {rawCustomerInfo && __DEV__ && (
          <Section title="Raw Customer Info (Dev Only)">
            <ScrollView horizontal style={styles.rawInfoContainer}>
              <Text style={styles.rawInfo}>{rawCustomerInfo}</Text>
            </ScrollView>
          </Section>
        )}

        {/* Help text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            {"If you're experiencing subscription issues, try the following:"}
          </Text>
          <Text style={styles.helpItem}>1. Pull down to refresh status</Text>
          <Text style={styles.helpItem}>{"2. Tap \u201CRestore Purchases\u201D if you've previously subscribed"}</Text>
          <Text style={styles.helpItem}>3. Check your App Store subscription settings</Text>
          <Text style={styles.helpItem}>4. Export and share debug info with support</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  exportButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  sectionContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  debugRowLast: {
    borderBottomWidth: 0,
  },
  debugLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  debugValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    maxWidth: '50%',
    textAlign: 'right',
  },
  actions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  actionButtonTextSecondary: {
    color: theme.colors.accent,
  },
  rawInfoContainer: {
    maxHeight: 200,
    padding: theme.spacing.sm,
  },
  rawInfo: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: theme.colors.textMuted,
  },
  helpContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  helpText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  helpItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
});
