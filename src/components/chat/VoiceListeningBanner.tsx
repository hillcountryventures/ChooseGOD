/**
 * VoiceListeningBanner - Shows active voice recording indicator
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface VoiceListeningBannerProps {
  onCancel: () => void;
}

export function VoiceListeningBanner({ onCancel }: VoiceListeningBannerProps) {
  return (
    <View style={styles.listeningBanner}>
      <View style={styles.listeningDot} />
      <Text style={styles.listeningText}>Listening...</Text>
      <TouchableOpacity onPress={onCancel} style={styles.cancelListening}>
        <Ionicons name="close" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.errorAlpha[20],
    gap: theme.spacing.sm,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  listeningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
  },
  cancelListening: {
    padding: theme.spacing.xs,
  },
});
