/**
 * Journal Domain Store
 *
 * Manages journal drafts, saved entries, and daily prompts.
 * Named journalStore2 to avoid conflict with the existing journeyStore.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalDraft, JournalPrompt } from '../types';

// =====================================================
// Types
// =====================================================

export interface JournalState {
  currentDraft: JournalDraft | null;
  savedDrafts: JournalDraft[];
  dailyPrompts: JournalPrompt[];

  // Actions
  setCurrentDraft: (draft: JournalDraft | null) => void;
  updateDraft: (updates: Partial<JournalDraft>) => void;
  saveDraft: (draft: JournalDraft) => void;
  deleteDraft: (draftId: string) => void;
  clearDraft: () => void;
  setDailyPrompts: (prompts: JournalPrompt[]) => void;
}

// =====================================================
// Store
// =====================================================

export const useJournalDraftStore = create<JournalState>()(
  persist(
    (set) => ({
      currentDraft: null,
      savedDrafts: [],
      dailyPrompts: [],

      setCurrentDraft: (draft) => set(() => ({ currentDraft: draft })),

      updateDraft: (updates) =>
        set((state) => ({
          currentDraft: state.currentDraft
            ? { ...state.currentDraft, ...updates, lastSavedAt: new Date() }
            : null,
        })),

      saveDraft: (draft) =>
        set((state) => ({
          savedDrafts: [
            draft,
            ...state.savedDrafts.filter((d) => d.id !== draft.id),
          ].slice(0, 10),
        })),

      deleteDraft: (draftId) =>
        set((state) => ({
          savedDrafts: state.savedDrafts.filter((d) => d.id !== draftId),
          currentDraft:
            state.currentDraft?.id === draftId ? null : state.currentDraft,
        })),

      clearDraft: () => set(() => ({ currentDraft: null })),

      setDailyPrompts: (prompts) => set(() => ({ dailyPrompts: prompts })),
    }),
    {
      name: 'choosegod-journal',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedDrafts: state.savedDrafts,
        currentDraft: state.currentDraft,
      }),
    }
  )
);
