/**
 * MediaBar - Bottom toolbar for adding media to journal entries
 *
 * Features:
 * - Photo picker (camera + gallery)
 * - Voice recorder
 * - Verse picker
 * - AI suggestions toggle
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface MediaBarProps {
  onPhotoPress: () => void;
  onVoicePress: () => void;
  onVersePress: () => void;
  onAIPress?: () => void;
  isRecording?: boolean;
  wordCount?: number;
}

export default function MediaBar({
  onPhotoPress,
  onVoicePress,
  onVersePress,
  onAIPress,
  isRecording = false,
  wordCount = 0,
}: MediaBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPhotoPress}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonRecording]}
          onPress={onVoicePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic-outline'}
            size={22}
            color={isRecording ? theme.colors.error : theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onVersePress}
          activeOpacity={0.7}
        >
          <Ionicons name="book-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>

        {onAIPress && (
          <TouchableOpacity
            style={styles.button}
            onPress={onAIPress}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles-outline" size={22} color={theme.colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.wordCount}>
        <Text style={styles.wordCountText}>{wordCount} words</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  button: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  buttonRecording: {
    backgroundColor: theme.colors.error + '20',
  },
  wordCount: {
    paddingHorizontal: theme.spacing.sm,
  },
  wordCountText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
