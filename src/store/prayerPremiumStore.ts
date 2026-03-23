/**
 * Prayer Premium Store - Reminders + Testimony Features
 *
 * Free: Basic prayer tracking
 * Premium: Reminders, testimony sharing, full answered history
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Reminder intervals
export const REMINDER_INTERVALS = [
  { id: 'daily', label: 'Daily', hours: 24 },
  { id: '3days', label: 'Every 3 Days', hours: 72 },
  { id: 'weekly', label: 'Weekly', hours: 168 },
] as const;

export type ReminderInterval = typeof REMINDER_INTERVALS[number]['id'];

export interface PrayerReminder {
  prayerId: string;
  interval: ReminderInterval;
  nextReminder: string; // ISO string
  enabled: boolean;
}

export interface TestimonyStats {
  totalPrayers: number;
  answeredPrayers: number;
  avgDaysToAnswer: number;
  longestWait: number;
  shortestWait: number;
}

interface PrayerPremiumState {
  // Reminders
  reminders: PrayerReminder[];
  
  // Testimonies shared
  sharedTestimonies: string[]; // prayer IDs that were shared
  
  // Actions
  setReminder: (prayerId: string, interval: ReminderInterval) => Promise<void>;
  removeReminder: (prayerId: string) => Promise<void>;
  getReminder: (prayerId: string) => PrayerReminder | undefined;
  hasReminder: (prayerId: string) => boolean;
  
  markTestimonyShared: (prayerId: string) => void;
  hasSharedTestimony: (prayerId: string) => boolean;
  
  calculateStats: (prayers: Array<{ 
    createdAt: Date | string; 
    answeredAt?: Date | string; 
    status: string 
  }>) => TestimonyStats;
}

const scheduleNotification = async (
  prayerId: string,
  prayerText: string,
  hours: number
): Promise<string | null> => {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Prayer Reminder',
        body: prayerText.length > 80 ? prayerText.slice(0, 77) + '...' : prayerText,
        data: { prayerId, type: 'prayer_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: hours * 60 * 60,
        repeats: true,
      },
    });
    return identifier;
  } catch {
    return null;
  }
};

const cancelNotification = async (prayerId: string): Promise<void> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(
      (n) => n.content.data?.prayerId === prayerId
    );
    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch {
    // Silently fail
  }
};

export const usePrayerPremiumStore = create<PrayerPremiumState>()(
  persist(
    (set, get) => ({
      reminders: [],
      sharedTestimonies: [],

      setReminder: async (prayerId: string, interval: ReminderInterval) => {
        const { reminders } = get();
        const intervalConfig = REMINDER_INTERVALS.find((i) => i.id === interval);
        if (!intervalConfig) return;

        // Cancel existing
        await cancelNotification(prayerId);

        // Get prayer text (we'll need to pass it in, but for now use generic)
        await scheduleNotification(prayerId, 'Continue lifting this prayer to God', intervalConfig.hours);

        const nextReminder = new Date();
        nextReminder.setHours(nextReminder.getHours() + intervalConfig.hours);

        const existing = reminders.findIndex((r) => r.prayerId === prayerId);
        if (existing >= 0) {
          set({
            reminders: reminders.map((r, i) =>
              i === existing
                ? { ...r, interval, nextReminder: nextReminder.toISOString(), enabled: true }
                : r
            ),
          });
        } else {
          set({
            reminders: [
              ...reminders,
              {
                prayerId,
                interval,
                nextReminder: nextReminder.toISOString(),
                enabled: true,
              },
            ],
          });
        }
      },

      removeReminder: async (prayerId: string) => {
        await cancelNotification(prayerId);
        set((state) => ({
          reminders: state.reminders.filter((r) => r.prayerId !== prayerId),
        }));
      },

      getReminder: (prayerId: string) => {
        return get().reminders.find((r) => r.prayerId === prayerId);
      },

      hasReminder: (prayerId: string) => {
        return get().reminders.some((r) => r.prayerId === prayerId && r.enabled);
      },

      markTestimonyShared: (prayerId: string) => {
        set((state) => ({
          sharedTestimonies: [...new Set([...state.sharedTestimonies, prayerId])],
        }));
      },

      hasSharedTestimony: (prayerId: string) => {
        return get().sharedTestimonies.includes(prayerId);
      },

      calculateStats: (prayers) => {
        const answered = prayers.filter((p) => p.status === 'answered' && p.answeredAt);
        const total = prayers.length;

        if (answered.length === 0) {
          return {
            totalPrayers: total,
            answeredPrayers: 0,
            avgDaysToAnswer: 0,
            longestWait: 0,
            shortestWait: 0,
          };
        }

        const waits = answered.map((p) => {
          const created = new Date(p.createdAt).getTime();
          const answeredTime = new Date(p.answeredAt!).getTime();
          return Math.floor((answeredTime - created) / (1000 * 60 * 60 * 24));
        });

        return {
          totalPrayers: total,
          answeredPrayers: answered.length,
          avgDaysToAnswer: Math.round(waits.reduce((a, b) => a + b, 0) / waits.length),
          longestWait: Math.max(...waits),
          shortestWait: Math.min(...waits),
        };
      },
    }),
    {
      name: 'choosegod-prayer-premium',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reminders: state.reminders,
        sharedTestimonies: state.sharedTestimonies,
      }),
    }
  )
);
