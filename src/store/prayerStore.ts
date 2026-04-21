/**
 * prayerStore — standalone store for prayer requests.
 *
 * Previously lived inside the main useStore god object. Extracted so
 * prayer-related UI doesn't re-render on chat message / journal draft updates.
 *
 * Does NOT replace the existing usePrayers selector on useStore — that stays
 * in place for backwards compatibility. New code should prefer this store.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerRequest } from '../types';
import {
  trackPrayerAdded,
  trackPrayerAnswered,
} from '../services/analytics';
import { useTrialStore } from './trialStore';

interface PrayerState {
  prayers: PrayerRequest[];
  setPrayers: (prayers: PrayerRequest[]) => void;
  addPrayer: (prayer: PrayerRequest) => void;
  updatePrayer: (id: string, updates: Partial<PrayerRequest>) => void;
  removePrayer: (id: string) => void;
  clearPrayers: () => void;
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set) => ({
      prayers: [],

      setPrayers: (prayers) => set({ prayers }),

      addPrayer: (prayer) => {
        useTrialStore.getState().incrementStat('prayersAdded');
        trackPrayerAdded();
        set((state) => ({ prayers: [prayer, ...state.prayers] }));
      },

      updatePrayer: (id, updates) => {
        if (updates.status === 'answered') {
          useTrialStore.getState().incrementStat('prayersAnswered');
          trackPrayerAnswered();
        }
        set((state) => ({
          prayers: state.prayers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      removePrayer: (id) =>
        set((state) => ({ prayers: state.prayers.filter((p) => p.id !== id) })),

      clearPrayers: () => set({ prayers: [] }),
    }),
    {
      name: 'choosegod-prayers',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
