/**
 * useBibleAudio Hook
 * 
 * React hook for Bible audio playback with verse synchronization.
 * Uses Bible Brain API for audio content and expo-av for playback.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { 
  bibleBrain, 
  AudioFile, 
  AudioTimestamp, 
  bookToUsfm 
} from '../services/bibleBrain';
import { logger } from '../utils/logger';

// =============================================================================
// Types
// =============================================================================

export interface AudioState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  error: string | null;
  duration: number; // Total duration in seconds
  position: number; // Current position in seconds
  currentVerse: number | null; // Current verse based on timestamps
}

export interface UseBibleAudioOptions {
  translation?: string;
  preferDrama?: boolean;
  autoHighlightVerse?: boolean;
  onVerseChange?: (verse: number) => void;
  onPlaybackComplete?: () => void;
}

export interface UseBibleAudioReturn {
  state: AudioState;
  audioFile: AudioFile | null;
  timestamps: AudioTimestamp[];
  // Controls
  loadChapter: (book: string, chapter: number) => Promise<boolean>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekToVerse: (verse: number) => Promise<void>;
  seekToPosition: (seconds: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  // Status
  isConfigured: boolean;
  hasAudioForTranslation: (translation: string) => boolean;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useBibleAudio(options: UseBibleAudioOptions = {}): UseBibleAudioReturn {
  const {
    translation = 'KJV',
    preferDrama = false,
    autoHighlightVerse = true,
    onVerseChange,
    onPlaybackComplete,
  } = options;

  // State
  const [state, setState] = useState<AudioState>({
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    isBuffering: false,
    error: null,
    duration: 0,
    position: 0,
    currentVerse: null,
  });

  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [timestamps, setTimestamps] = useState<AudioTimestamp[]>([]);

  // Refs
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentBookRef = useRef<string>('');
  const currentChapterRef = useRef<number>(0);

  // ==========================================================================
  // Audio Session Setup
  // ==========================================================================

  useEffect(() => {
    // Configure audio session for playback
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // ==========================================================================
  // Playback Status Handler
  // ==========================================================================

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      // Handle error state - error property only exists on AVPlaybackStatusError
      const errorMessage = 'error' in status ? String(status.error) : null;
      setState(prev => ({
        ...prev,
        isBuffering: false,
        error: errorMessage,
      }));
      return;
    }

    const positionSeconds = status.positionMillis / 1000;
    const durationSeconds = (status.durationMillis || 0) / 1000;

    // Find current verse based on position
    let currentVerse: number | null = null;
    if (autoHighlightVerse && timestamps.length > 0) {
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (positionSeconds >= timestamps[i].timestamp) {
          currentVerse = timestamps[i].verseStart;
          break;
        }
      }
    }

    setState(prev => {
      // Only trigger callback if verse changed
      if (currentVerse !== prev.currentVerse && currentVerse !== null && onVerseChange) {
        onVerseChange(currentVerse);
      }

      return {
        ...prev,
        isPlaying: status.isPlaying,
        isPaused: !status.isPlaying && status.positionMillis > 0,
        isBuffering: status.isBuffering,
        duration: durationSeconds,
        position: positionSeconds,
        currentVerse,
      };
    });

    // Handle playback completion
    if (status.didJustFinish && onPlaybackComplete) {
      onPlaybackComplete();
    }
  }, [timestamps, autoHighlightVerse, onVerseChange, onPlaybackComplete]);

  // ==========================================================================
  // Core Functions
  // ==========================================================================

  /**
   * Load audio for a specific chapter
   */
  const loadChapter = useCallback(async (book: string, chapter: number): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Unload previous audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const bookId = bookToUsfm(book);
      currentBookRef.current = bookId;
      currentChapterRef.current = chapter;

      // Fetch audio file URL
      const audio = await bibleBrain.getChapterAudioByTranslation(
        translation,
        bookId,
        chapter,
        preferDrama
      );

      if (!audio) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: `No audio available for ${book} ${chapter} in ${translation}`,
        }));
        return false;
      }

      setAudioFile(audio);

      // Fetch timestamps for verse sync
      const ts = await bibleBrain.getChapterTimestampsByTranslation(
        translation,
        bookId,
        chapter,
        preferDrama
      );
      setTimestamps(ts);

      // Load the audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audio.path },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;

      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        isPaused: false,
        position: 0,
        currentVerse: null,
      }));

      return true;
    } catch (error) {
      logger.error('Failed to load chapter audio:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load audio',
      }));
      return false;
    }
  }, [translation, preferDrama, onPlaybackStatusUpdate]);

  /**
   * Play audio
   */
  const play = useCallback(async (): Promise<void> => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  /**
   * Pause audio
   */
  const pause = useCallback(async (): Promise<void> => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  /**
   * Stop and reset audio
   */
  const stop = useCallback(async (): Promise<void> => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
    }
  }, []);

  /**
   * Seek to a specific verse
   */
  const seekToVerse = useCallback(async (verse: number): Promise<void> => {
    if (!soundRef.current || timestamps.length === 0) return;

    const timestamp = timestamps.find(t => t.verseStart === verse);
    if (timestamp) {
      await soundRef.current.setPositionAsync(timestamp.timestamp * 1000);
    }
  }, [timestamps]);

  /**
   * Seek to a specific position in seconds
   */
  const seekToPosition = useCallback(async (seconds: number): Promise<void> => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(seconds * 1000);
    }
  }, []);

  /**
   * Set playback rate (0.5 - 2.0)
   */
  const setPlaybackRate = useCallback(async (rate: number): Promise<void> => {
    if (soundRef.current) {
      await soundRef.current.setRateAsync(rate, true);
    }
  }, []);

  /**
   * Check if Bible Brain has audio for a translation
   */
  const hasAudioForTranslation = useCallback((trans: string): boolean => {
    return bibleBrain.getAudioFilesetId(trans) !== null;
  }, []);

  return {
    state,
    audioFile,
    timestamps,
    loadChapter,
    play,
    pause,
    stop,
    seekToVerse,
    seekToPosition,
    setPlaybackRate,
    isConfigured: bibleBrain.isConfigured(),
    hasAudioForTranslation,
  };
}

// =============================================================================
// Utility Hook: Audio Availability Check
// =============================================================================

/**
 * Simple hook to check audio availability without loading
 */
export function useAudioAvailability(translation: string): {
  isAvailable: boolean;
  hasDrama: boolean;
} {
  const audioFileset = bibleBrain.getAudioFilesetId(translation, false);
  const dramaFileset = bibleBrain.getAudioFilesetId(translation, true);

  return {
    isAvailable: audioFileset !== null,
    hasDrama: dramaFileset !== null && dramaFileset !== audioFileset,
  };
}
