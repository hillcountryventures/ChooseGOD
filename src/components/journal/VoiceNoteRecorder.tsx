/**
 * VoiceNoteRecorder - Record voice notes for journal entries
 *
 * Uses expo-av for audio recording
 * Features:
 * - Start/stop recording
 * - Visual feedback (pulsing animation)
 * - Duration display
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { JournalMedia } from '../../types';

interface VoiceNoteRecorderProps {
  onRecordingComplete: (media: JournalMedia) => void;
  onCancel: () => void;
}

export default function VoiceNoteRecorder({
  onRecordingComplete,
  onCancel,
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pulse animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable microphone access to record voice notes.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      const status = await recording.getStatusAsync();

      if (uri) {
        const media: JournalMedia = {
          id: `voice-${Date.now()}`,
          type: 'voice',
          uri,
          duration: Math.floor((status.durationMillis || 0) / 1000),
          createdAt: new Date(),
        };

        onRecordingComplete(media);
      }

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isRecording ? 'Recording...' : 'Tap to Record'}
        </Text>

        <Animated.View
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.duration}>{formatDuration(duration)}</Text>

        {!isRecording && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: theme.colors.error,
  },
  duration: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  cancelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
