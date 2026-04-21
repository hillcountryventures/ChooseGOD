/**
 * GracefulCancelFlow \u2014 the dignified cancel experience per Decision #17.
 *
 * No dark patterns. One honest reason question. Response-specific
 * kindness, including the Free Pause offer on "timing" that is the
 * plan's hero retention mechanic.
 *
 * This does NOT actually cancel the RevenueCat subscription \u2014 that
 * still routes through handleManageSubscription to the App Store, per
 * Apple's rules. This flow logs the reason so we can cohort-analyze,
 * and offers the Pause alternative.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { logger } from '../../utils/logger';

type Reason = 'price' | 'content' | 'timing' | 'other' | 'skipped';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called if user confirms they want to proceed to App Store cancel. */
  onProceedToCancel: () => void;
}

export const GracefulCancelFlow: React.FC<Props> = ({
  visible,
  onClose,
  onProceedToCancel,
}) => {
  const [step, setStep] = useState<'reason' | 'followup'>('reason');
  const [reason, setReason] = useState<Reason | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  const close = () => {
    setStep('reason');
    setReason(null);
    setFeedback('');
    onClose();
  };

  const logSurvey = async (finalReason: Reason) => {
    if (!user?.id) return;
    try {
      await supabase.from('cancellation_surveys').insert({
        user_id: user.id,
        reason: finalReason,
        feedback: feedback.trim() || null,
      });
    } catch (err) {
      logger.warn('[cancel] survey log failed', err);
    }
  };

  const handleReasonPick = async (r: Reason) => {
    setReason(r);
    await logSurvey(r);
    setStep('followup');
  };

  const handleFreePause = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('subscription_pauses').insert({
        user_id: user.id,
        reason_at_pause: reason,
      });
      if (error) throw error;
      Alert.alert(
        'Pause is on',
        'Your Pro access is paused for 30 days. No charges during the pause. We\u2019ll be here when you\u2019re ready.',
      );
      close();
    } catch {
      Alert.alert('Couldn\u2019t pause', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackForm = () => {
    Linking.openURL('mailto:feedback@choosegod.app?subject=What%20ChooseGOD%20is%20missing');
    close();
  };

  const handleFinalCancel = () => {
    onProceedToCancel();
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {step === 'reason' ? (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Before you go</Text>
                <TouchableOpacity onPress={close} accessibilityLabel="Close">
                  <Ionicons name="close" size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.body}>
                One honest question so we can learn \u2014 was it the price, the
                content, or the timing?
              </Text>

              <TouchableOpacity style={styles.reasonBtn} onPress={() => handleReasonPick('price')}>
                <Text style={styles.reasonLabel}>The price</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reasonBtn} onPress={() => handleReasonPick('content')}>
                <Text style={styles.reasonLabel}>Missing content / features</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reasonBtn} onPress={() => handleReasonPick('timing')}>
                <Text style={styles.reasonLabel}>Timing \u2014 this season of life</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reasonBtn} onPress={() => handleReasonPick('other')}>
                <Text style={styles.reasonLabel}>Something else</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reasonBtn, styles.skipBtn]}
                onPress={() => handleReasonPick('skipped')}
              >
                <Text style={styles.skipLabel}>Skip \u2014 just let me cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Thank you for telling us</Text>
                <TouchableOpacity onPress={close} accessibilityLabel="Close">
                  <Ionicons name="close" size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              {reason === 'timing' && (
                <>
                  <Text style={styles.body}>
                    Life moves in seasons. Would a 30-day pause help instead?
                    Your Days With God, journal, and chat history all stay
                    right where they are.
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleFreePause}
                    disabled={submitting}
                  >
                    <Text style={styles.primaryBtnText}>
                      {submitting ? 'Pausing...' : 'Pause for 30 days (free)'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {reason === 'content' && (
                <>
                  <Text style={styles.body}>
                    What would have kept you? We read every reply.
                  </Text>
                  <TextInput
                    value={feedback}
                    onChangeText={setFeedback}
                    placeholder="What\u2019s missing for you?"
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                    maxLength={400}
                    style={styles.feedbackInput}
                  />
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={async () => {
                      await logSurvey(reason!);
                      handleFeedbackForm();
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Send feedback</Text>
                  </TouchableOpacity>
                </>
              )}

              {reason === 'price' && (
                <Text style={styles.body}>
                  Totally fair. We\u2019ll keep building. Your journal and Days
                  With God stay, free forever.
                </Text>
              )}

              {(reason === 'other' || reason === 'skipped') && (
                <Text style={styles.body}>
                  Thank you for walking with us. Your journal, prayers, and
                  Days With God stay yours whether you stay or go.
                </Text>
              )}

              <TouchableOpacity style={styles.cancelBtn} onPress={handleFinalCancel}>
                <Text style={styles.cancelBtnText}>Continue to cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stayBtn} onPress={close}>
                <Text style={styles.stayBtnText}>Actually, I\u2019ll stay</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  body: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 18,
  },
  reasonBtn: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    marginBottom: 8,
  },
  skipBtn: {
    borderColor: 'transparent',
    marginTop: 6,
  },
  reasonLabel: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  skipLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    color: theme.colors.text,
    minHeight: 80,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  stayBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  stayBtnText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default GracefulCancelFlow;
