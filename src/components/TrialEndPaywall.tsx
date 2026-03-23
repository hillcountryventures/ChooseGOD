/**
 * TrialEndPaywall - Show after 3-day trial ends
 *
 * This paywall shows the user's progress during trial to create FOMO
 * and dramatically improve conversion vs showing paywall before value.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases, {
  PurchasesPackage,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { theme } from '../lib/theme';
import { REVENUECAT_PRODUCT_IDS } from '../constants/subscription';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useTrialStore, TRIAL_DAYS } from '../store/trialStore';
import { logger } from '../utils/logger';

// Legal URLs
const PRIVACY_POLICY_URL = 'https://choosegod.app/privacy.html';
const TERMS_OF_USE_URL = 'https://choosegod.app/#terms';

interface TrialEndPaywallProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TrialEndPaywall({ visible, onClose, onSuccess }: TrialEndPaywallProps) {
  const insets = useSafeAreaInsets();
  const refreshCustomerInfo = useSubscriptionStore((s) => s.refreshCustomerInfo);
  const trialStats = useTrialStore((s) => s.trialStats);
  const markTrialEndPaywallSeen = useTrialStore((s) => s.markTrialEndPaywallSeen);

  // State
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate meaningful stats
  const hasActivity = (
    trialStats.prayersAdded > 0 ||
    trialStats.journalEntries > 0 ||
    trialStats.chaptersRead > 0 ||
    trialStats.chatMessages > 0
  );

  // Fetch offerings
  useEffect(() => {
    if (visible) {
      fetchOfferings();
    }
  }, [visible]);

  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const offerings = await Purchases.getOfferings();

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const availablePackages = offerings.current.availablePackages;
        setPackages(availablePackages);

        // Default to annual
        const annualPkg = availablePackages.find(
          (pkg) => pkg.product.identifier === REVENUECAT_PRODUCT_IDS.yearly
        );
        setSelectedPackage(annualPkg || availablePackages[0]);
      } else {
        setError('No subscription options available');
      }
    } catch (err) {
      logger.error('[TrialEndPaywall] Error fetching offerings:', err);
      setError('Unable to load subscription options');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle purchase
  const handlePurchase = useCallback(async () => {
    if (!selectedPackage) return;

    try {
      setIsPurchasing(true);
      setError(null);

      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      await refreshCustomerInfo();

      if (customerInfo.entitlements.active['ChooseGOD Pro']) {
        markTrialEndPaywallSeen();
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      const purchaseError = err as PurchasesError;

      if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        // User cancelled - that's ok
      } else if (purchaseError.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
        await refreshCustomerInfo();
        markTrialEndPaywallSeen();
        onSuccess?.();
        onClose();
      } else {
        setError('Purchase failed. Please try again.');
        logger.error('[TrialEndPaywall] Purchase error:', purchaseError);
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPackage, refreshCustomerInfo, onSuccess, onClose, markTrialEndPaywallSeen]);

  // Handle restore
  const handleRestore = useCallback(async () => {
    try {
      setIsRestoring(true);
      setError(null);

      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active['ChooseGOD Pro']) {
        await refreshCustomerInfo();
        markTrialEndPaywallSeen();
        Alert.alert('Restored!', 'Your subscription has been restored.', [
          { text: 'OK', onPress: () => { onSuccess?.(); onClose(); } },
        ]);
      } else {
        Alert.alert('No Subscription Found', 'We couldn\'t find an active subscription for your account.');
      }
    } catch (err) {
      logger.error('[TrialEndPaywall] Restore error:', err);
      setError('Restore failed. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  }, [refreshCustomerInfo, onSuccess, onClose, markTrialEndPaywallSeen]);

  // Handle continue without subscribing (limited access)
  const handleContinueFree = () => {
    markTrialEndPaywallSeen();
    onClose();
  };

  // Get annual price display
  const getAnnualPrice = () => {
    const annualPkg = packages.find(
      (pkg) => pkg.product.identifier === REVENUECAT_PRODUCT_IDS.yearly
    );
    if (annualPkg) {
      const monthlyEquiv = annualPkg.product.price / 12;
      return {
        total: annualPkg.product.priceString,
        monthly: `$${monthlyEquiv.toFixed(2)}`,
      };
    }
    return { total: '$36.00', monthly: '$3.00' };
  };

  const annualPrice = getAnnualPrice();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleContinueFree}
    >
      <LinearGradient
        colors={[theme.colors.background, theme.colors.primaryDark]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={40} color={theme.colors.accent} />
            </View>
            <Text style={styles.title}>Your First {TRIAL_DAYS} Days</Text>
            <Text style={styles.subtitle}>
              Look how far you've come in your journey with God
            </Text>
          </View>

          {/* Progress Stats */}
          {hasActivity && (
            <View style={styles.statsContainer}>
              {trialStats.prayersAdded > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.statText}>
                    {trialStats.prayersAdded} prayer{trialStats.prayersAdded !== 1 ? 's' : ''} lifted up
                  </Text>
                </View>
              )}
              {trialStats.prayersAnswered > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.statText}>
                    {trialStats.prayersAnswered} prayer{trialStats.prayersAnswered !== 1 ? 's' : ''} answered!
                  </Text>
                </View>
              )}
              {trialStats.journalEntries > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.statText}>
                    {trialStats.journalEntries} journal entr{trialStats.journalEntries !== 1 ? 'ies' : 'y'} written
                  </Text>
                </View>
              )}
              {trialStats.chaptersRead > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.statText}>
                    {trialStats.chaptersRead} chapter{trialStats.chaptersRead !== 1 ? 's' : ''} read
                  </Text>
                </View>
              )}
              {trialStats.chatMessages > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.statText}>
                    {trialStats.chatMessages} question{trialStats.chatMessages !== 1 ? 's' : ''} asked
                  </Text>
                </View>
              )}
              {trialStats.streakDays > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={20} color={theme.colors.warning} />
                  <Text style={styles.statText}>
                    {trialStats.streakDays}-day streak started
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Value Proposition */}
          <View style={styles.valueSection}>
            <Text style={styles.valueLine}>Don't lose your momentum.</Text>
            <Text style={styles.valueSubline}>
              Continue your spiritual journey with unlimited access to all features.
            </Text>
          </View>

          {/* Pricing */}
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : (
            <View style={styles.pricingSection}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>ChooseGOD Pro</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceMain}>{annualPrice.monthly}</Text>
                  <Text style={styles.pricePeriod}>/month</Text>
                </View>
                <Text style={styles.priceBilled}>
                  Billed annually as {annualPrice.total}
                </Text>
              </View>

              {/* Features */}
              <View style={styles.features}>
                <View style={styles.featureItem}>
                  <Ionicons name="infinite" size={18} color={theme.colors.primary} />
                  <Text style={styles.featureText}>Unlimited AI conversations</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="time" size={18} color={theme.colors.primary} />
                  <Text style={styles.featureText}>Complete spiritual history</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="library" size={18} color={theme.colors.primary} />
                  <Text style={styles.featureText}>All devotional series</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="snow" size={18} color={theme.colors.primary} />
                  <Text style={styles.featureText}>Streak freeze (life happens)</Text>
                </View>
              </View>

              {/* CTA Button */}
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handlePurchase}
                disabled={isPurchasing || !selectedPackage}
                accessibilityRole="button"
                accessibilityLabel="Continue your journey"
              >
                {isPurchasing ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <>
                    <Text style={styles.ctaButtonText}>Continue My Journey</Text>
                    <Ionicons name="arrow-forward" size={20} color={theme.colors.text} />
                  </>
                )}
              </TouchableOpacity>

              {/* Free option */}
              <TouchableOpacity
                style={styles.freeButton}
                onPress={handleContinueFree}
                accessibilityRole="button"
                accessibilityLabel="Continue with limited access"
              >
                <Text style={styles.freeButtonText}>
                  Continue with limited access
                </Text>
              </TouchableOpacity>

              {/* Error */}
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Restore */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={isRestoring}
                accessibilityRole="button"
                accessibilityLabel="Restore purchases"
              >
                {isRestoring ? (
                  <ActivityIndicator color={theme.colors.textMuted} size="small" />
                ) : (
                  <Text style={styles.restoreText}>Restore purchases</Text>
                )}
              </TouchableOpacity>

              {/* Legal */}
              <View style={styles.legalSection}>
                <Text style={styles.legalText}>
                  Cancel anytime. By subscribing, you agree to our{' '}
                  <Text
                    style={styles.legalLink}
                    onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
                  >
                    Terms
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={styles.legalLink}
                    onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  valueSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  valueLine: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  valueSubline: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  pricingSection: {
    alignItems: 'center',
  },
  priceBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  priceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceMain: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  pricePeriod: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  priceBilled: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'stretch',
    marginBottom: theme.spacing.md,
  },
  ctaButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  freeButton: {
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  freeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  restoreButton: {
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  restoreText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  legalSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  legalText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});

export default TrialEndPaywall;
