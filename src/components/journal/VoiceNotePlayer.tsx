/**
 * VoiceNotePlayer - Playback UI for voice notes
 *
 * Uses expo-av for audio playback
 * Features:
 * - Play/pause toggle
 * - Progress bar
 * - Duration display
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface VoiceNotePlayerProps {
  uri: string;
  duration?: number;
  onDelete?: () => void;
}

export default function VoiceNotePlayer({
  uri,
  duration: initialDuration,
  onDelete,
}: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      return sound;
    } catch (error) {
      console.error('Failed to load sound:', error);
      return null;
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      if (status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      }
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const togglePlayback = async () => {
    try {
      if (!soundRef.current) {
        const sound = await loadSound();
        if (!sound) return;
      }

      if (isPlaying) {
        await soundRef.current?.pauseAsync();
      } else {
        await soundRef.current?.playAsync();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={togglePlayback}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(position)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
});
