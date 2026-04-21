/**
 * CrisisDisclaimer \u2014 subtle always-visible banner at the chat entry point.
 * Required per Decision #14 for legal / ethical coverage.
 *
 * Rendered inside ChatHub chrome so it's present but unobtrusive. Tapping
 * it reveals the full "not a replacement for professional care" text +
 * 988 hotline link.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

export const CrisisDisclaimer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel="Not a replacement for professional care. Tap to learn more."
        activeOpacity={0.7}
      >
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={theme.colors.textMuted}
        />
        <Text style={styles.text}>
          Not a replacement for professional care. Tap for resources.
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expanded}>
          <Text style={styles.expandedText}>
            ChooseGOD is not a substitute for professional mental health or crisis
            care. If you\u2019re in immediate danger or considering harm, call 988
            (Suicide & Crisis Lifeline) or go to your nearest emergency room.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:988')}
            style={styles.callBtn}
            accessibilityRole="button"
            accessibilityLabel="Call 988"
          >
            <Text style={styles.callBtnText}>Call 988</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 11,
    color: theme.colors.textMuted,
    flexShrink: 1,
  },
  expanded: {
    marginTop: 8,
    paddingVertical: 8,
    gap: 10,
  },
  expandedText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 17,
  },
  callBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  callBtnText: {
    color: theme.colors.background,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CrisisDisclaimer;
