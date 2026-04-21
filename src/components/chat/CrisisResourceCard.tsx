/**
 * CrisisResourceCard \u2014 rendered inside chat when a response carries
 * crisis-tier metadata. Shows tap-to-call / tap-to-text hotlines so the
 * user doesn't have to copy a number out of a text message.
 *
 * Per Decision #14: life safety is the first responsibility.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface Resource {
  id: string;
  label: string;
  action: 'call' | 'text' | 'url';
  value: string;
  helper: string;
}

const TIER1_RESOURCES: Resource[] = [
  {
    id: '988',
    label: 'Call 988',
    action: 'call',
    value: '988',
    helper: 'Suicide & Crisis Lifeline \u2014 24/7',
  },
  {
    id: 'crisis-text',
    label: 'Text HOME to 741741',
    action: 'text',
    value: '741741',
    helper: 'Crisis Text Line \u2014 24/7',
  },
  {
    id: 'dv',
    label: 'Domestic Violence Hotline',
    action: 'call',
    value: '1-800-799-7233',
    helper: '1-800-799-SAFE \u2014 24/7',
  },
];

const TIER2_RESOURCES: Resource[] = [
  {
    id: 'samhsa',
    label: 'SAMHSA helpline',
    action: 'call',
    value: '1-800-662-4357',
    helper: 'Addiction + mental health \u2014 24/7',
  },
  {
    id: 'dv',
    label: 'Domestic Violence Hotline',
    action: 'call',
    value: '1-800-799-7233',
    helper: '24/7 support, confidential',
  },
];

const TIER4_RESOURCES: Resource[] = [
  {
    id: 'griefshare',
    label: 'Find a GriefShare group',
    action: 'url',
    value: 'https://www.griefshare.org/findagroup',
    helper: 'Local grief support',
  },
];

function openResource(r: Resource) {
  if (r.action === 'call') {
    Linking.openURL(`tel:${r.value.replace(/[^0-9]/g, '')}`);
  } else if (r.action === 'text') {
    const body = 'HOME';
    const url = Platform.OS === 'ios'
      ? `sms:${r.value}&body=${body}`
      : `sms:${r.value}?body=${body}`;
    Linking.openURL(url);
  } else {
    Linking.openURL(r.value);
  }
}

export interface CrisisResourceCardProps {
  tier: 1 | 2 | 3 | 4;
}

export const CrisisResourceCard: React.FC<CrisisResourceCardProps> = ({ tier }) => {
  let resources: Resource[] = [];
  let headline = '';

  if (tier === 1) {
    resources = TIER1_RESOURCES;
    headline = 'You don\u2019t have to be alone in this.';
  } else if (tier === 2) {
    resources = TIER2_RESOURCES;
    headline = 'Partners to prayer \u2014 not replacements for it.';
  } else if (tier === 4) {
    resources = TIER4_RESOURCES;
    headline = 'Grief is sacred. Support helps.';
  } else {
    // Tier 3 (faith crisis) \u2014 no hotline surfaced, just honoring the space
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="heart" size={18} color={theme.colors.primary} />
        <Text style={styles.headline}>{headline}</Text>
      </View>

      {resources.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.resource}
          onPress={() => openResource(r)}
          accessibilityRole="button"
          accessibilityLabel={`${r.label}. ${r.helper}`}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.resourceLabel}>{r.label}</Text>
            <Text style={styles.resourceHelper}>{r.helper}</Text>
          </View>
          <Ionicons
            name={
              r.action === 'call' ? 'call' : r.action === 'text' ? 'chatbubble' : 'open'
            }
            size={18}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      ))}

      <Text style={styles.footnote}>
        ChooseGOD is not a replacement for professional care.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(201,169,98,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  headline: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    flexShrink: 1,
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  resourceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  resourceHelper: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  footnote: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default CrisisResourceCard;
