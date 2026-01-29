/**
 * AgeGateModal - COPPA-compliant age verification
 *
 * Shows on first launch. Users must confirm they are 13+.
 * Under-13 users are blocked with a parental consent message.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

const AGE_VERIFIED_KEY = '@choosegod_age_verified';
const AGE_BLOCKED_KEY = '@choosegod_age_blocked';

interface AgeGateModalProps {
  onVerified: () => void;
}

export function AgeGateModal({ onVerified }: AgeGateModalProps) {
  const [visible, setVisible] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const checkAgeVerification = async () => {
    try {
      const [verified, isBlocked] = await Promise.all([
        AsyncStorage.getItem(AGE_VERIFIED_KEY),
        AsyncStorage.getItem(AGE_BLOCKED_KEY),
      ]);

      if (isBlocked === 'true') {
        setBlocked(true);
        setVisible(true);
      } else if (verified !== 'true') {
        setVisible(true);
      } else {
        onVerified();
      }
    } catch {
      setVisible(true);
    }
  };

  useEffect(() => {
    checkAgeVerification();
  }, []);

  const handleYes = async () => {
    try {
      await AsyncStorage.setItem(AGE_VERIFIED_KEY, 'true');
      await AsyncStorage.removeItem(AGE_BLOCKED_KEY);
    } catch {
      // Continue anyway
    }
    setVisible(false);
    onVerified();
  };

  const handleNo = async () => {
    try {
      await AsyncStorage.setItem(AGE_BLOCKED_KEY, 'true');
    } catch {
      // Continue anyway
    }
    setBlocked(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
          </View>

          {blocked ? (
            <>
              <Text style={styles.title}>Parental Consent Required</Text>
              <Text style={styles.message}>
                ChooseGOD requires users to be at least 13 years old. If you are under 13, please ask a parent or guardian to set up and supervise your use of this app.
              </Text>
              <Text style={styles.subMessage}>
                This is required by the Children&apos;s Online Privacy Protection Act (COPPA).
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Age Verification</Text>
              <Text style={styles.message}>
                To use ChooseGOD, you must be at least 13 years old. Are you 13 or older?
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNo]}
                  onPress={handleNo}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonNoText}>No</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonYes]}
                  onPress={handleYes}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonYesText}>Yes, I&apos;m 13+</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  subMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  buttonNo: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonNoText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  buttonYes: {
    backgroundColor: theme.colors.primary,
  },
  buttonYesText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});
