import { useEffect, useState, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  requestPermissions,
  registerPushToken,
  scheduleDailyReminder,
  cancelDailyReminder,
  loadPreferences,
  savePreferences,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  ReminderPreferences,
} from '../services/notifications';

export function useNotifications() {
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    enabled: false,
    hour: 7,
    minute: 0,
  });
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences().then((prefs) => {
      setPreferences(prefs);
      setLoading(false);
    });
  }, []);

  // Set up notification listeners
  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener((_notification) => {
      // Could update badge count, analytics, etc.
    });

    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'daily_reminder') {
        // Navigate to today's devotional — handled by navigation container
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const enable = useCallback(async (hour: number, minute: number): Promise<boolean> => {
    const granted = await requestPermissions();
    setPermissionGranted(granted);

    if (!granted) return false;

    await scheduleDailyReminder(hour, minute);
    await registerPushToken();

    const newPrefs = { enabled: true, hour, minute };
    setPreferences(newPrefs);
    return true;
  }, []);

  const disable = useCallback(async () => {
    await cancelDailyReminder();
    const newPrefs = { ...preferences, enabled: false };
    await savePreferences(newPrefs);
    setPreferences(newPrefs);
  }, [preferences]);

  const reschedule = useCallback(async (hour: number, minute: number) => {
    if (!preferences.enabled) return;
    await scheduleDailyReminder(hour, minute);
    setPreferences((prev) => ({ ...prev, hour, minute }));
  }, [preferences.enabled]);

  return {
    preferences,
    permissionGranted,
    loading,
    enable,
    disable,
    reschedule,
  };
}
