/**
 * RedeemGiftModal
 *
 * Lets a user enter a gift code and redeem it via the redeem-gift Edge
 * Function. On success, refreshes the subscription store so the Pro
 * entitlement becomes visible immediately.
 */

import React, { useCallback, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { logger } from '../../utils/logger';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const RedeemGiftModal: React.FC<Props> = ({ visible, onClose }) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const refreshSubscription = useSubscriptionStore(
    (s) => (s as unknown as { refresh?: () => Promise<void> }).refresh,
  );

  const handleSubmit = useCallback(async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in before redeeming a gift code.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-gift', {
        body: { code: trimmed, userId: user.id },
      });

      if (error) throw error;

      if (!data?.success) {
        Alert.alert('Couldn\u2019t redeem', data?.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // Refresh subscription state so Pro unlocks visibly
      try {
        if (typeof refreshSubscription === 'function') {
          await refreshSubscription();
        }
      } catch (refreshErr) {
        logger.warn('[RedeemGift] refresh failed', refreshErr);
      }

      Alert.alert('Grace received', data.message ?? 'You now have ChooseGOD Pro.');
      setCode('');
      onClose();
    } catch (err) {
      logger.error('[RedeemGift] error', err);
      Alert.alert('Something went wrong', 'Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }, [code, onClose, refreshSubscription, user?.id]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Redeem a gift code</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Received a gift of ChooseGOD Pro? Enter the code below.
          </Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Enter code"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            spellCheck={false}
            style={styles.input}
            maxLength={32}
            editable={!submitting}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Gift code input"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || code.trim().length === 0}
            style={[
              styles.submit,
              (submitting || code.trim().length === 0) && styles.submitDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Redeem gift code"
          >
            {submitting ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.submitText}>Redeem</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footnote}>
            Gift codes are non-refundable. Your subscription renewal preferences stay
            the same.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
    }),
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
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    letterSpacing: 1,
    marginBottom: 16,
  },
  submit: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  footnote: {
    marginTop: 16,
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});

export default RedeemGiftModal;
