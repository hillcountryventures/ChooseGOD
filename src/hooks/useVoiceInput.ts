/**
 * useVoiceInput Hook
 * Handles speech recognition for hands-free voice input
 *
 * Perfect for prayer, reflection, and spoken questions to the Scripture companion
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import * as Haptics from 'expo-haptics';

export interface UseVoiceInputOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onPartialResult?: (transcript: string) => void;
  continuous?: boolean;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  isAvailable: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  cancelListening: () => void;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    lang = 'en-US',
    onResult,
    onPartialResult,
    continuous = false,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const onResultRef = useRef(onResult);
  const onPartialResultRef = useRef(onPartialResult);

  // Keep refs updated
  useEffect(() => {
    onResultRef.current = onResult;
    onPartialResultRef.current = onPartialResult;
  }, [onResult, onPartialResult]);

  // Check availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
        setIsAvailable(available);

        if (available) {
          const permissions = await ExpoSpeechRecognitionModule.getPermissionsAsync();
          setHasPermission(permissions.granted);
        }
      } catch (err) {
        console.warn('Speech recognition availability check failed:', err);
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, []);

  // Event handlers
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const result = event.results[0];
    if (!result) return;

    if (event.isFinal) {
      setTranscript(result.transcript);
      setInterimTranscript('');
      onResultRef.current?.(result.transcript);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setInterimTranscript(result.transcript);
      onPartialResultRef.current?.(result.transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error, event.message);
    setError(event.message || event.error);
    setIsListening(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  });

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(result.granted);
      return result.granted;
    } catch (err) {
      console.error('Permission request failed:', err);
      return false;
    }
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isAvailable) {
      setError('Speech recognition is not available on this device');
      return;
    }

    // Check/request permissions
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        setError('Microphone permission denied');
        return;
      }
    }

    // Reset state
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    try {
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous,
        addsPunctuation: true,
        contextualStrings: [
          'Scripture', 'Bible', 'Jesus', 'Christ', 'God', 'Lord',
          'prayer', 'pray', 'amen', 'verse', 'chapter',
          'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
          'Joshua', 'Judges', 'Ruth', 'Samuel', 'Kings', 'Chronicles',
          'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
          'Ecclesiastes', 'Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
          'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah',
          'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
          'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
          'Acts', 'Romans', 'Corinthians', 'Galatians', 'Ephesians',
          'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus',
          'Philemon', 'Hebrews', 'James', 'Peter', 'Jude', 'Revelation',
        ],
        iosTaskHint: 'dictation',
      });
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start voice input');
    }
  }, [isAvailable, hasPermission, requestPermission, lang, continuous]);

  // Stop listening (allows final result)
  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  // Cancel listening (discards results)
  const cancelListening = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    setInterimTranscript('');
    setTranscript('');
    setIsListening(false);
  }, []);

  return {
    isListening,
    isAvailable,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    cancelListening,
    hasPermission,
    requestPermission,
  };
}

export default useVoiceInput;
