import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  ChatMessage,
  DailyVerse,
  UserPreferences,
  ChatMode,
  WitLevel,
  PrayerRequest,
  MemoryVerse,
  ObedienceStep,
  SpiritualMoment,
  JournalDraft,
  JournalPrompt,
  ChatContext,
} from '../types';

const defaultPreferences: UserPreferences = {
  preferredTranslation: 'KJV',
  fontSize: 'medium',
  dailyDevotional: true,
  eveningExamen: false,
  notificationsEnabled: false,
  maturityLevel: 'growing',
};

const defaultChatContext: ChatContext = {
  screenType: 'home',
  bibleContext: undefined,
  devotionalContext: undefined,
  timestamp: new Date(),
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

// Selector for journal drafts
export const useCurrentDraft = () => useStore((state) => state.currentDraft);
export const useSavedDrafts = () => useStore((state) => state.savedDrafts);
export const useDailyPrompts = () => useStore((state) => state.dailyPrompts);

// Selectors for chat FAB
export const useChatContextState = () => useStore((state) => state.chatContext);
export const useChatSheetOpen = () => useStore((state) => state.chatSheetOpen);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],
      isQuerying: false,
      currentMode: 'auto',
      witLevel: 'medium',
      isTyping: false,
      chatContext: defaultChatContext,
      chatSheetOpen: false,
      dailyVerse: null,
      preferences: defaultPreferences,
      activePrayers: [],
      memoryVersesDue: [],
      pendingObedienceSteps: [],
      recentMoments: [],
      currentDraft: null,
      savedDrafts: [],
      dailyPrompts: [],

      // Chat actions
      addMessage: (message: ChatMessage) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateMessage: (id: string, updates: Partial<ChatMessage>) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
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

      setWitLevel: (level: WitLevel) =>
        set(() => ({
          witLevel: level,
        })),

      setIsTyping: (isTyping: boolean) =>
        set(() => ({
          isTyping,
        })),

      // Chat FAB actions
      setChatContext: (context: Partial<ChatContext>) =>
        set((state) => ({
          chatContext: {
            ...state.chatContext,
            ...context,
            timestamp: new Date(),
          },
        })),

      setChatSheetOpen: (open: boolean) =>
        set(() => ({
          chatSheetOpen: open,
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

      updateMoment: (id: string, updates: Partial<SpiritualMoment>) =>
        set((state) => ({
          recentMoments: state.recentMoments.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
          ),
        })),

      deleteMoment: (id: string) =>
        set((state) => ({
          recentMoments: state.recentMoments.filter((m) => m.id !== id),
        })),

      // Journal draft actions
      setCurrentDraft: (draft: JournalDraft | null) =>
        set(() => ({
          currentDraft: draft,
        })),

      updateDraft: (updates: Partial<JournalDraft>) =>
        set((state) => ({
          currentDraft: state.currentDraft
            ? { ...state.currentDraft, ...updates, lastSavedAt: new Date() }
            : null,
        })),

      saveDraft: (draft: JournalDraft) =>
        set((state) => ({
          savedDrafts: [
            draft,
            ...state.savedDrafts.filter((d) => d.id !== draft.id),
          ].slice(0, 10),
        })),

      deleteDraft: (draftId: string) =>
        set((state) => ({
          savedDrafts: state.savedDrafts.filter((d) => d.id !== draftId),
          currentDraft:
            state.currentDraft?.id === draftId ? null : state.currentDraft,
        })),

      clearDraft: () =>
        set(() => ({
          currentDraft: null,
        })),

      setDailyPrompts: (prompts: JournalPrompt[]) =>
        set(() => ({
          dailyPrompts: prompts,
        })),
    }),
    {
      name: 'choosegod-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        dailyVerse: state.dailyVerse,
        savedDrafts: state.savedDrafts,
        currentDraft: state.currentDraft,
        recentMoments: state.recentMoments,
        activePrayers: state.activePrayers,
        // Don't persist messages - start fresh each session
      }),
    }
  )
);
