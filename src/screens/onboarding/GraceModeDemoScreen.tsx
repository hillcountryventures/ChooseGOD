/**
 * GraceModeDemoScreen \u2014 Onboarding screen #2 per Decision #7.
 *
 * Users experience the hero mechanic before they commit to an account.
 * Mock data simulates a reading plan they "started 3 days ago" where
 * they "missed 2 days." The Grace Mode card offers a 2-minute catch-up.
 *
 * On tap, the catch-up card reveals a pre-written warm summary so the
 * user feels the wedge ("this app doesn't shame me for falling off")
 * within 10-15 seconds of opening the app.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../lib/theme';
import { trackEvent } from '../../services/analytics';

// Pre-written demo content \u2014 no API call needed so the demo works offline
// and costs nothing. The actual product uses real scripture + AI.
const DEMO_SUMMARY = [
  'The Story So Far',
  '',
  'Three days ago you started walking through the Psalms with us. ' +
    'Then life happened \u2014 work got heavy, sleep got short. We see you.',
  '',
  'Here\u2019s what you missed: David crying out, God drawing near to the ' +
    'broken-hearted, and an invitation to taste-and-see that the Lord is good. ' +
    'Psalm 34 especially reminds us \u2014 God is not waiting for us to get it right. He\u2019s ' +
    'already close.',
  '',
  'A Word for Today',
  '',
  '"The LORD is close to the brokenhearted." \u2014 Psalm 34:18',
  '',
  'Come back when you\u2019re ready. No guilt. No streak to rebuild. Just grace.',
].join('\n');

export default function GraceModeDemoScreen() {
  const navigation = useNavigation<{ navigate: (name: string) => void } & never>();
  const [expanded, setExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardPulse = useRef(new Animated.Value(1)).current;

  // Gentle pulse on the trigger card so it reads as interactive
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cardPulse, {
          toValue: 1.02,
          duration: 1600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(cardPulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();
  }, [cardPulse]);

  const handleReveal = () => {
    setExpanded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    trackEvent('onboarding_grace_demo_revealed');
  };

  const handleContinue = () => {
    trackEvent('onboarding_grace_demo_completed', { revealed: expanded });
    // Next screen in the 4-screen flow: Pick Your Path
    navigation.navigate('PersonalizationQuiz' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>A Quick Taste</Text>
        <Text style={styles.title}>Every Bible app shames you when you miss a day.</Text>
        <Text style={styles.subtitle}>
          We\u2019re different. Watch what happens here:
        </Text>

        <View style={styles.scenarioBox}>
          <View style={styles.scenarioRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.scenarioText}>
              Imagine you started reading the Psalms 3 days ago.
            </Text>
          </View>
          <View style={styles.scenarioRow}>
            <Ionicons name="cloudy-night" size={16} color={theme.colors.textMuted} />
            <Text style={styles.scenarioText}>
              Life happened. You\u2019ve missed 2 days.
            </Text>
          </View>
        </View>

        {!expanded ? (
          <Animated.View style={{ transform: [{ scale: cardPulse }] }}>
            <TouchableOpacity
              style={styles.graceCard}
              onPress={handleReveal}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Tap to see Grace Mode catch-up"
            >
              <View style={styles.graceIconWrap}>
                <Ionicons name="sparkles" size={22} color={theme.colors.background} />
              </View>
              <View style={styles.graceTextWrap}>
                <Text style={styles.graceTitle}>Grace Mode</Text>
                <Text style={styles.graceSubtitle}>
                  Tap for a 2-minute catch-up \u2014 no guilt.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.summaryBox, { opacity: fadeAnim }]}>
            <Text style={styles.summaryText}>{DEMO_SUMMARY}</Text>
          </Animated.View>
        )}

        <View style={styles.spacer} />

        <Text style={styles.tagline}>
          Everyone can use a little more grace.
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  eyebrow: {
    fontSize: 13,
    letterSpacing: 1.2,
    color: theme.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 28,
  },
  scenarioBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  scenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scenarioText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    flexShrink: 1,
  },
  graceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    gap: 12,
  },
  graceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  graceTextWrap: { flex: 1 },
  graceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.background,
  },
  graceSubtitle: {
    fontSize: 13,
    color: theme.colors.background,
    opacity: 0.85,
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: 'rgba(201,169,98,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 23,
    color: theme.colors.text,
  },
  spacer: { flex: 1 },
  tagline: {
    fontSize: 15,
    fontStyle: 'italic',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: theme.colors.text,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
