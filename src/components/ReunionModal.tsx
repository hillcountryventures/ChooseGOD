/**
 * ReunionModal \u2014 "Welcome Back" moment for returning users.
 *
 * Per Decision #8. When a user opens the app after 7+ days of absence,
 * celebrate the return with something personal \u2014 their last highlighted
 * verse, their top prayer, a verse chosen for returning users. Never
 * punish the return (no "You broke your streak!" language).
 *
 * The wedge made real: grace at the moment of return.
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

interface ReunionModalProps {
  visible: boolean;
  daysAway: number;
  displayName?: string;
  lastVerse?: { reference: string; text: string } | null;
  onClose: () => void;
  onOpenVerse?: () => void;
}

const RETURN_VERSES = [
  { reference: 'Luke 15:20', text: 'While he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him.' },
  { reference: 'Psalm 34:18', text: 'The LORD is close to the brokenhearted and saves those who are crushed in spirit.' },
  { reference: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
];

export const ReunionModal: React.FC<ReunionModalProps> = ({
  visible,
  daysAway,
  displayName,
  lastVerse,
  onClose,
  onOpenVerse,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const verseToShow =
    lastVerse ?? RETURN_VERSES[Math.floor(Math.random() * RETURN_VERSES.length)];
  const daysLabel = daysAway === 1 ? '1 day' : `${daysAway} days`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="heart" size={28} color={theme.colors.primary} />
          </View>

          <Text style={styles.greeting}>
            Welcome back{displayName ? `, ${displayName}` : ''}
          </Text>
          <Text style={styles.body}>
            It\u2019s been {daysLabel}. No guilt, no streak to rebuild \u2014
            your walk with God has been waiting for you, not against you.
          </Text>

          <View style={styles.verseBox}>
            <Text style={styles.verseText}>\u201C{verseToShow.text}\u201D</Text>
            <Text style={styles.verseRef}>\u2014 {verseToShow.reference}</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (onOpenVerse) onOpenVerse();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Open this verse"
          >
            <Text style={styles.primaryBtnText}>Open this verse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={styles.secondaryBtnText}>Keep going</Text>
          </TouchableOpacity>
        </Animated.View>
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
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(201,169,98,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  verseBox: {
    backgroundColor: 'rgba(201,169,98,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  verseText: {
    fontSize: 15,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 6,
  },
  verseRef: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'right',
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
});

export default ReunionModal;
