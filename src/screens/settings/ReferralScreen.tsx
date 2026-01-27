/**
 * ReferralScreen - Share ChooseGOD, earn free Pro time
 * 
 * "Give 7 days Pro, Get 7 days Pro" referral program.
 * Uses unique referral codes linked to user accounts.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  daysEarned: number;
}

export default function ReferralScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    if (!user) return;
    
    try {
      // Get or create referral code
      const { data, error } = await supabase
        .from('user_referrals')
        .select('referral_code, total_referrals, successful_referrals, days_earned')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No referral record exists, create one
        const newCode = generateReferralCode(user.id);
        const { data: newData } = await supabase
          .from('user_referrals')
          .insert({
            user_id: user.id,
            referral_code: newCode,
            total_referrals: 0,
            successful_referrals: 0,
            days_earned: 0,
          })
          .select()
          .single();
        
        if (newData) {
          setStats({
            referralCode: newData.referral_code,
            totalReferrals: 0,
            successfulReferrals: 0,
            daysEarned: 0,
          });
        }
      } else if (data) {
        setStats({
          referralCode: data.referral_code,
          totalReferrals: data.total_referrals,
          successfulReferrals: data.successful_referrals,
          daysEarned: data.days_earned,
        });
      }
    } catch (err) {
      console.error('Error loading referral stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = (userId: string): string => {
    // Generate a unique 8-character code from user ID
    const hash = userId.replace(/-/g, '').substring(0, 6).toUpperCase();
    return `CG${hash}`;
  };

  const handleCopyCode = async () => {
    if (!stats) return;
    
    await Clipboard.setStringAsync(stats.referralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!stats) return;
    
    const shareUrl = `https://choosegod.app/invite/${stats.referralCode}`;
    const message = `I've been using ChooseGOD for Bible study and it's amazing! The AI companion helps me understand Scripture deeper.\n\nUse my invite code "${stats.referralCode}" to get 7 days of Pro free:\n${shareUrl}`;

    try {
      await Share.share({
        message,
        url: shareUrl,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="gift" size={48} color={theme.colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Give 7 Days, Get 7 Days</Text>
          <Text style={styles.heroSubtitle}>
            Share ChooseGOD with friends. When they try Pro, you both get 7 days free!
          </Text>
        </View>

        {/* Referral Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{stats?.referralCode || '...'}</Text>
            <TouchableOpacity 
              onPress={handleCopyCode}
              style={styles.copyButton}
              accessibilityLabel={isCopied ? "Code copied" : "Copy referral code"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={isCopied ? "checkmark" : "copy-outline"} 
                size={20} 
                color={isCopied ? theme.colors.success : theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
          {isCopied && (
            <Text style={styles.copiedText}>Copied to clipboard!</Text>
          )}
        </View>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
          accessibilityLabel="Share your referral code"
          accessibilityRole="button"
        >
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share with Friends</Text>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.totalReferrals || 0}</Text>
              <Text style={styles.statLabel}>Friends Invited</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.successfulReferrals || 0}</Text>
              <Text style={styles.statLabel}>Tried Pro</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.daysEarned || 0}</Text>
              <Text style={styles.statLabel}>Days Earned</Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share Your Code</Text>
              <Text style={styles.stepDescription}>
                Send your unique code to friends who might enjoy ChooseGOD
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>They Sign Up</Text>
              <Text style={styles.stepDescription}>
                Your friend downloads the app and enters your code
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>You Both Win</Text>
              <Text style={styles.stepDescription}>
                When they start their Pro trial, you both get 7 extra days free
              </Text>
            </View>
          </View>
        </View>

        {/* Scripture */}
        <View style={styles.scriptureCard}>
          <Ionicons name="book-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.scriptureText}>
            "A generous person will prosper; whoever refreshes others will be refreshed."
          </Text>
          <Text style={styles.scriptureRef}>— Proverbs 11:25</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.lg,
  },
  codeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  codeText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  copiedText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    marginTop: theme.spacing.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xl,
  },
  shareButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  statsSection: {
    marginBottom: theme.spacing.xl,
  },
  statsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  howItWorks: {
    marginBottom: theme.spacing.xl,
  },
  howItWorksTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  step: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  scriptureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  scriptureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  scriptureRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
