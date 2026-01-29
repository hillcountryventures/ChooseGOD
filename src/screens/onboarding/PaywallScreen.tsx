/**
 * PaywallScreen - Onboarding Paywall Step
 * 
 * Full-screen paywall during onboarding flow.
 * Users can subscribe, start trial, or continue with limited access.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Purchases, {
  PurchasesPackage,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { theme } from '../../lib/theme';
import { OnboardingStackParamList } from '../../types';
import { PAYWALL_CONTENT, REVENUECAT_PRODUCT_IDS } from '../../constants/subscription';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useTrackScreen } from '../../hooks/useAnalytics';

// Legal URLs
const PRIVACY_POLICY_URL = 'https://choosegod.app/privacy.html';
const TERMS_OF_USE_URL = 'https://choosegod.app/#terms';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Paywall'>;
type RouteProps = RouteProp<OnboardingStackParamList, 'Paywall'>;

interface PackageOption {
  package: PurchasesPackage;
  id: string;
  title: string;
  price: string;
  period: string;
  pricePerMonth?: string;
  badge?: string;
  isSelected: boolean;
}

export default function PaywallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { selectedSeriesIds } = route.params;
  
  const refreshCustomerInfo = useSubscriptionStore((s) => s.refreshCustomerInfo);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  // Track paywall impression
  useTrackScreen('paywall');

  // State
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track paywall shown event
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { trackPaywallShown } = require('../../services/analytics');
    trackPaywallShown();
  }, []);

  // Check if already subscribed and skip
  useEffect(() => {
    if (isPremium) {
      navigateNext();
    }
  }, [isPremium]);

  // Fetch offerings from RevenueCat
  useEffect(() => {
    fetchOfferings();
  }, []);

  const navigateNext = () => {
    navigation.navigate('NotificationSetup', { selectedSeriesIds });
  };

  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const offerings = await Purchases.getOfferings();

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const availablePackages = offerings.current.availablePackages;
        setPackages(availablePackages);

        // Default to annual if available
        const annualPkg = availablePackages.find(
          (pkg) => pkg.product.identifier === REVENUECAT_PRODUCT_IDS.yearly
        );
        setSelectedPackage(annualPkg || availablePackages[0]);
      } else {
        setError('No subscription options available.');
      }
    } catch (err) {
      console.error('[PaywallScreen] Error fetching offerings:', err);
      setError('Unable to load subscription options.');
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

      // Refresh customer info in store
      await refreshCustomerInfo();

      // Check if purchase was successful
      if (customerInfo.entitlements.active['ChooseGOD Pro']) {
        navigateNext();
      }
    } catch (err) {
      const purchaseError = err as PurchasesError;

      switch (purchaseError.code) {
        case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
          // User cancelled - don't show error
          break;
        case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
          setError('Purchases are not allowed on this device.');
          break;
        case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
          await refreshCustomerInfo();
          navigateNext();
          break;
        case PURCHASES_ERROR_CODE.NETWORK_ERROR:
          setError("We couldn't reach the store. Check your connection and try again.");
          break;
        default:
          setError("That didn't work — please try once more.");
          console.error('[PaywallScreen] Purchase error:', purchaseError);
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPackage, refreshCustomerInfo, navigation, selectedSeriesIds]);

  // Handle restore
  const handleRestore = useCallback(async () => {
    try {
      setIsRestoring(true);
      setError(null);

      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active['ChooseGOD Pro']) {
        await refreshCustomerInfo();
        navigateNext();
      } else {
        setError('No active subscription found.');
      }
    } catch (err) {
      console.error('[PaywallScreen] Restore error:', err);
      setError('Unable to restore purchases.');
    } finally {
      setIsRestoring(false);
    }
  }, [refreshCustomerInfo, navigation, selectedSeriesIds]);

  // Format package for display
  const formatPackage = (pkg: PurchasesPackage): PackageOption => {
    const product = pkg.product;
    const isYearly = product.identifier === REVENUECAT_PRODUCT_IDS.yearly;
    const isMonthly = product.identifier === REVENUECAT_PRODUCT_IDS.monthly;

    let period = '';
    let pricePerMonth: string | undefined;

    if (isYearly) {
      period = '/year';
      const yearlyPrice = product.price;
      const monthlyEquiv = yearlyPrice / 12;
      pricePerMonth = `${product.currencyCode} ${monthlyEquiv.toFixed(2)}/mo`;
    } else if (isMonthly) {
      period = '/month';
    } else {
      period = ' one-time';
    }

    return {
      package: pkg,
      id: product.identifier,
      title: isYearly ? 'Annual' : isMonthly ? 'Monthly' : 'Lifetime',
      price: product.priceString,
      period,
      pricePerMonth,
      badge: isYearly ? 'BEST VALUE' : undefined,
      isSelected: selectedPackage?.product.identifier === product.identifier,
    };
  };

  // Render feature item
  const renderFeature = (feature: { icon: string; title: string; description: string }, index: number) => (
    <View key={index} style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons
          name={feature.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={theme.colors.accent}
        />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  // Render package option
  const renderPackageOption = (pkg: PurchasesPackage) => {
    const option = formatPackage(pkg);

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.planCard, option.isSelected && styles.planCardSelected]}
        onPress={() => setSelectedPackage(pkg)}
        activeOpacity={0.7}
      >
        {option.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{option.badge}</Text>
          </View>
        )}
        <View style={styles.planContent}>
          <View style={styles.planLeft}>
            <View style={[styles.radioOuter, option.isSelected && styles.radioOuterSelected]}>
              {option.isSelected && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.planTitle}>{option.title}</Text>
          </View>
          <View style={styles.planRight}>
            <Text style={styles.planPrice}>
              {option.price}
              <Text style={styles.planPeriod}>{option.period}</Text>
            </Text>
            {option.pricePerMonth && (
              <Text style={styles.planSubtext}>{option.pricePerMonth}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.primaryDark]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Skip Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={navigateNext}
              style={styles.skipButton}
              accessibilityLabel="Continue with limited access"
            >
              <Text style={styles.skipText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <View style={styles.hero}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={40} color={theme.colors.accent} />
              </View>
              <Text style={styles.subscriptionTitle}>ChooseGOD Pro</Text>
              <Text style={styles.headline}>{PAYWALL_CONTENT.headline}</Text>
              <Text style={styles.subheadline}>{PAYWALL_CONTENT.subheadline}</Text>
            </View>

            {/* Social Proof */}
            <View style={styles.socialProof}>
              <View style={styles.socialProofRow}>
                <View style={styles.socialProofItem}>
                  <Ionicons name="people" size={20} color={theme.colors.accent} />
                  <Text style={styles.socialProofText}>{PAYWALL_CONTENT.socialProof.userCount}</Text>
                </View>
                <View style={styles.socialProofDivider} />
                <View style={styles.socialProofItem}>
                  <Ionicons name="star" size={20} color={theme.colors.accent} />
                  <Text style={styles.socialProofText}>
                    {PAYWALL_CONTENT.socialProof.rating} ({PAYWALL_CONTENT.socialProof.ratingCount} reviews)
                  </Text>
                </View>
              </View>
              {/* Featured testimonial */}
              <View style={styles.testimonial}>
                <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textMuted} />
                <Text style={styles.testimonialText}>
                  &ldquo;{PAYWALL_CONTENT.socialProof.testimonials[0].text}&rdquo;
                </Text>
                <Text style={styles.testimonialAuthor}>
                  — {PAYWALL_CONTENT.socialProof.testimonials[0].author}
                </Text>
              </View>
            </View>

            {/* Features */}
            <View style={styles.features}>
              {PAYWALL_CONTENT.features.map(renderFeature)}
            </View>

            {/* Plans */}
            <View style={styles.plans}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.accent} />
                  <Text style={styles.loadingText}>Loading options...</Text>
                </View>
              ) : error && packages.length === 0 ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={32} color={theme.colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity onPress={fetchOfferings} style={styles.retryButton}>
                    <Text style={styles.retryText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                packages.map(renderPackageOption)
              )}
            </View>

            {/* Trial Message */}
            {!isLoading && packages.length > 0 && (
              <Text style={styles.trialMessage}>{PAYWALL_CONTENT.trialMessage}</Text>
            )}

            {/* Error Message */}
            {error && packages.length > 0 && (
              <View style={styles.inlineError}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                <Text style={styles.inlineErrorText}>{error}</Text>
              </View>
            )}

            {/* CTA Button */}
            {!isLoading && packages.length > 0 && (
              <TouchableOpacity
                style={[styles.ctaButton, isPurchasing && styles.ctaButtonDisabled]}
                onPress={handlePurchase}
                disabled={isPurchasing || !selectedPackage}
                activeOpacity={0.8}
                accessibilityLabel={isPurchasing ? 'Processing purchase' : 'Start 7-day free trial'}
                accessibilityRole="button"
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color={theme.colors.textInverse} />
                ) : (
                  <Text style={styles.ctaText}>Start Free Trial</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Restore Purchases */}
            <TouchableOpacity
              onPress={handleRestore}
              disabled={isRestoring}
              style={styles.restoreButton}
              accessibilityLabel="Restore previous purchases"
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : (
                <Text style={styles.restoreText}>Restore Purchases</Text>
              )}
            </TouchableOpacity>

            {/* Auto-Renewal Disclosure */}
            <Text style={styles.renewalDisclosure}>
              Subscription automatically renews unless canceled at least 24 hours before the end
              of the current period. Your account will be charged for renewal within 24 hours
              prior to the end of the current period.
            </Text>

            {/* Legal Links */}
            <View style={styles.legalLinks}>
              <TouchableOpacity
                style={styles.legalButton}
                onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
              >
                <Text style={styles.legalButtonText}>Privacy Policy</Text>
              </TouchableOpacity>
              <View style={styles.legalDivider} />
              <TouchableOpacity
                style={styles.legalButton}
                onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
              >
                <Text style={styles.legalButtonText}>Terms of Use</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accentAlpha[20],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  socialProof: {
    marginBottom: 24,
    alignItems: 'center',
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  socialProofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  socialProofText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  socialProofDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  testimonial: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  testimonialText: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  testimonialAuthor: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentAlpha[10],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  plans: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.errorAlpha?.[20] || 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surfaceElevated,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textInverse,
    letterSpacing: 0.5,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: theme.colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  planSubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  trialMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 6,
  },
  inlineErrorText: {
    fontSize: 14,
    color: theme.colors.error,
  },
  ctaButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 14,
    color: theme.colors.accent,
  },
  renewalDisclosure: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  legalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  legalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.border,
  },
});
