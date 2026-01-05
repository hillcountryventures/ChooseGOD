import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// =====================================================
// NOTIFICATION CONFIGURATION
// =====================================================

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// =====================================================
// PERMISSION & TOKEN FUNCTIONS
// =====================================================

/**
 * Request notification permissions from the user
 */
export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission for notifications not granted');
    return false;
  }

  // For Android, set up notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('devotional-reminders', {
      name: 'Devotional Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
    });
  }

  return true;
}

/**
 * Get the Expo push token for this device
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Save the push token to the user's profile
 */
export async function savePushToken(userId: string, token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        notification_token: token,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
}

// =====================================================
// SCHEDULING FUNCTIONS
// =====================================================

/**
 * Schedule a daily devotional reminder
 * @param time - The time to send the reminder (hours and minutes)
 * @param seriesTitle - The title of the devotional series
 * @returns The notification identifier
 */
export async function scheduleDevotionalReminder(
  time: { hours: number; minutes: number },
  seriesTitle: string
): Promise<string | null> {
  try {
    // Cancel any existing devotional reminders
    await cancelDevotionalReminders();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your devotional is ready',
        body: `Continue your journey with "${seriesTitle}"`,
        data: { type: 'devotional_reminder', seriesTitle },
        sound: 'default',
      },
      trigger: {
        hour: time.hours,
        minute: time.minutes,
        repeats: true,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling devotional reminder:', error);
    return null;
  }
}

/**
 * Cancel all devotional reminders
 */
export async function cancelDevotionalReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === 'devotional_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// =====================================================
// IMMEDIATE NOTIFICATIONS
// =====================================================

/**
 * Send an immediate streak encouragement notification
 */
export async function sendStreakNotification(streakCount: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${streakCount} Day Streak!`,
      body: 'Amazing! Keep up the great work on your spiritual journey.',
      data: { type: 'streak' },
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send a series completion celebration notification
 */
export async function sendCompletionNotification(seriesTitle: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Journey Complete!',
      body: `Congratulations on completing "${seriesTitle}"! 🎉`,
      data: { type: 'completion', seriesTitle },
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send a re-engagement notification (for users who haven't been active)
 */
export async function sendReengagementNotification(seriesTitle: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'We miss you!',
      body: `Continue your journey with "${seriesTitle}". Pick up where you left off.`,
      data: { type: 'reengagement', seriesTitle },
    },
    trigger: null, // Send immediately
  });
}

// =====================================================
// NOTIFICATION HANDLERS
// =====================================================

/**
 * Handle a notification received while app is in foreground
 */
export function handleNotificationReceived(
  notification: Notifications.Notification
): void {
  console.log('Notification received:', notification.request.content);
}

/**
 * Handle a notification response (when user taps on notification)
 * Returns navigation data based on notification type
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): { screen: string; params?: Record<string, unknown> } | null {
  const data = response.notification.request.content.data;

  switch (data?.type) {
    case 'devotional_reminder':
      return { screen: 'Devotionals' };
    case 'streak':
      return { screen: 'Devotionals' };
    case 'completion':
      return { screen: 'Devotionals' };
    case 'reengagement':
      return { screen: 'Devotionals' };
    default:
      return null;
  }
}

// =====================================================
// LISTENER SETUP
// =====================================================

/**
 * Set up notification listeners
 * Returns a cleanup function to remove listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      handleNotificationReceived(notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const navData = handleNotificationResponse(response);
      onNotificationResponse?.(response);
      // Navigation would be handled by the calling component
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Parse a time string (HH:mm:ss) to hours and minutes
 */
export function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours: hours || 7, minutes: minutes || 0 };
}

/**
 * Format hours and minutes to a time string
 */
export function formatTimeString(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}
