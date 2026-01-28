import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// --- Constants ---
const STORAGE_KEY_REMINDER_TIME = '@choosegod:reminder_time';
const STORAGE_KEY_NOTIFICATIONS_ENABLED = '@choosegod:notifications_enabled';
const DAILY_REMINDER_ID = 'daily-devotional-reminder';

// --- Configure default behavior ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- Types ---
export interface ReminderPreferences {
  enabled: boolean;
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute: number;
}

const DEVOTIONAL_MESSAGES = [
  { title: 'Your devotional is ready', body: "Continue your journey with today's reading on peace and trust." },
  { title: 'Time with God awaits', body: 'A few minutes in the Word can transform your whole day.' },
  { title: 'Good morning, friend', body: "Your daily devotional is waiting. Let's grow together." },
  { title: "Don't break your streak!", body: "Keep the momentum going \u2014 open today's reading." },
  { title: 'A word for today', body: 'God has something for you. Tap to discover it.' },
];

// --- Permission ---
export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Must use physical device for push notifications');
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// --- Push Token ---
export async function registerPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminders', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90D9',
      });
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    })).data;

    // Store to Supabase if user is authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_push_tokens')
          .upsert({
            user_id: user.id,
            token,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,token' });
      }
    } catch (e) {
      // Supabase storage is best-effort; table may not exist yet
      console.warn('[Notifications] Could not store push token:', e);
    }

    return token;
  } catch (e) {
    console.warn('[Notifications] Failed to get push token:', e);
    return null;
  }
}

// --- Daily Reminder Scheduling ---
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  // Cancel any existing daily reminder first
  await cancelDailyReminder();

  const msg = DEVOTIONAL_MESSAGES[Math.floor(Math.random() * DEVOTIONAL_MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: msg.title,
      body: msg.body,
      sound: 'default',
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  // Persist preferences
  await savePreferences({ enabled: true, hour, minute });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
}

export async function rescheduleReminder(hour: number, minute: number): Promise<void> {
  await scheduleDailyReminder(hour, minute);
}

// --- Preferences Persistence ---
export async function savePreferences(prefs: ReminderPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS_ENABLED, JSON.stringify(prefs.enabled));
  await AsyncStorage.setItem(STORAGE_KEY_REMINDER_TIME, JSON.stringify({ hour: prefs.hour, minute: prefs.minute }));
}

export async function loadPreferences(): Promise<ReminderPreferences> {
  try {
    const enabledStr = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS_ENABLED);
    const timeStr = await AsyncStorage.getItem(STORAGE_KEY_REMINDER_TIME);

    const enabled = enabledStr ? JSON.parse(enabledStr) : false;
    const time = timeStr ? JSON.parse(timeStr) : { hour: 7, minute: 0 };

    return { enabled, ...time };
  } catch {
    return { enabled: false, hour: 7, minute: 0 };
  }
}

// --- Notification Response Handling ---
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
