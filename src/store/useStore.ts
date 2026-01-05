import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  ChatMessage,
  DailyVerse,
  UserPreferences,
  ChatMode,
  PrayerRequest,
  MemoryVerse,
  ObedienceStep,
  SpiritualMoment,
} from '../types';

const defaultPreferences: UserPreferences = {
  preferredTranslation: 'KJV',
  fontSize: 'medium',
  dailyDevotional: true,
  eveningExamen: false,
  notificationsEnabled: false,
  maturityLevel: 'growing',
};

// Selector for preferences
export const usePreferences = () => useStore((state) => state.preferences);

// Selector for chat messages
export const useMessages = () => useStore((state) => state.messages);

// Selector for prayers
export const usePrayers = () => useStore((state) => state.activePrayers);

// Selector for obedience steps
export const useObedienceSteps = () => useStore((state) => state.pendingObedienceSteps);

// Selector for memory verses due
export const useMemoryVersesDue = () => useStore((state) => state.memoryVersesDue);

// Selector for recent moments
export const useRecentMoments = () => useStore((state) => state.recentMoments);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],
      isQuerying: false,
      currentMode: 'auto',
      dailyVerse: null,
      preferences: defaultPreferences,
      activePrayers: [],
      memoryVersesDue: [],
      pendingObedienceSteps: [],
      recentMoments: [],

      // Chat actions
      addMessage: (message: ChatMessage) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      clearMessages: () =>
        set(() => ({
          messages: [],
        })),

      setIsQuerying: (isQuerying: boolean) =>
        set(() => ({
          isQuerying,
        })),

      setCurrentMode: (mode: ChatMode) =>
        set(() => ({
          currentMode: mode,
        })),

      // Daily verse actions
      setDailyVerse: (verse: DailyVerse | null) =>
        set(() => ({
          dailyVerse: verse,
        })),

      // Preferences actions
      updatePreferences: (prefs: Partial<UserPreferences>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setPreferences: (prefs: Partial<UserPreferences>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // Prayer actions
      setActivePrayers: (prayers: PrayerRequest[]) =>
        set(() => ({
          activePrayers: prayers,
        })),

      addPrayer: (prayer: PrayerRequest) =>
        set((state) => ({
          activePrayers: [prayer, ...state.activePrayers],
        })),

      updatePrayer: (id: string, updates: Partial<PrayerRequest>) =>
        set((state) => ({
          activePrayers: state.activePrayers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      // Memory verse actions
      setMemoryVersesDue: (verses: MemoryVerse[]) =>
        set(() => ({
          memoryVersesDue: verses,
        })),

      // Obedience step actions
      setPendingObedienceSteps: (steps: ObedienceStep[]) =>
        set(() => ({
          pendingObedienceSteps: steps,
        })),

      // Spiritual moments actions
      setRecentMoments: (moments: SpiritualMoment[]) =>
        set(() => ({
          recentMoments: moments,
        })),

      addMoment: (moment: SpiritualMoment) =>
        set((state) => ({
          recentMoments: [moment, ...state.recentMoments].slice(0, 50),
        })),
    }),
    {
      name: 'choosegod-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        dailyVerse: state.dailyVerse,
        // Don't persist messages - start fresh each session
        // Don't persist prayers/moments - fetch from server
      }),
    }
  )
);
