/**
 * momentStore — standalone store for spiritual moments (journal + related).
 *
 * Previously lived inside the main useStore god object alongside chat, prayers,
 * and verse cache. Extracted so journal-related UI doesn't re-render on unrelated
 * state changes.
 *
 * Does NOT replace the existing useRecentMoments selector on useStore — that
 * stays for backwards compatibility. New code should prefer this store.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpiritualMoment, JournalDraft, JournalPrompt } from '../types';
import { STORAGE_LIMITS } from '../constants/limits';
import { trackJournalEntryCreated } from '../services/analytics';
import { useTrialStore } from './trialStore';

interface MomentState {
  recentMoments: SpiritualMoment[];
  currentDraft: JournalDraft | null;
  savedDrafts: JournalDraft[];
  dailyPrompts: JournalPrompt[];

  setRecentMoments: (moments: SpiritualMoment[]) => void;
  addMoment: (moment: SpiritualMoment) => void;
  updateMoment: (id: string, updates: Partial<SpiritualMoment>) => void;
  deleteMoment: (id: string) => void;

  setCurrentDraft: (draft: JournalDraft | null) => void;
  updateDraft: (updates: Partial<JournalDraft>) => void;
  saveDraft: (draft: JournalDraft) => void;
  deleteDraft: (draftId: string) => void;
  clearDraft: () => void;

  setDailyPrompts: (prompts: JournalPrompt[]) => void;
}

export const useMomentStore = create<MomentState>()(
  persist(
    (set) => ({
      recentMoments: [],
      currentDraft: null,
      savedDrafts: [],
      dailyPrompts: [],

      setRecentMoments: (moments) => set({ recentMoments: moments }),

      addMoment: (moment) => {
        useTrialStore.getState().incrementStat('journalEntries');
        const hasVerse = !!(moment.linkedVerses && moment.linkedVerses.length > 0);
        const hasMedia = !!(moment.media && moment.media.length > 0);
        trackJournalEntryCreated(hasVerse, hasMedia);
        set((state) => ({
          recentMoments: [moment, ...state.recentMoments].slice(
            0,
            STORAGE_LIMITS.recentMoments
          ),
        }));
      },

      updateMoment: (id, updates) =>
        set((state) => ({
          recentMoments: state.recentMoments.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
          ),
        })),

      deleteMoment: (id) =>
        set((state) => ({
          recentMoments: state.recentMoments.filter((m) => m.id !== id),
        })),

      setCurrentDraft: (draft) => set({ currentDraft: draft }),

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
          ].slice(0, STORAGE_LIMITS.savedDrafts),
        })),

      deleteDraft: (draftId) =>
        set((state) => ({
          savedDrafts: state.savedDrafts.filter((d) => d.id !== draftId),
          currentDraft:
            state.currentDraft?.id === draftId ? null : state.currentDraft,
        })),

      clearDraft: () => set({ currentDraft: null }),

      setDailyPrompts: (prompts) => set({ dailyPrompts: prompts }),
    }),
    {
      name: 'choosegod-moments',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentMoments: state.recentMoments,
        savedDrafts: state.savedDrafts,
        currentDraft: state.currentDraft,
      }),
    }
  )
);
