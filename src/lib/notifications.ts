import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { TABLES, NOTIFICATION_CHANNELS } from '../constants/database';
import { theme } from './theme';

// =====================================================
// NOTIFICATION CONFIGURATION
// =====================================================

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.devotionalReminders, {
      name: 'Devotional Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: theme.colors.primary,
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
      .from(TABLES.userProfiles)
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
 * Cancel morning devotional reminders
 */
async function cancelMorningDevotional(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === 'morning_devotional') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Cancel evening reflection reminders
 */
async function cancelEveningReflection(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === 'evening_reflection') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Schedule a morning devotional reminder (7:00 AM)
 * @param time - The time to send the reminder (hours and minutes)
 * @returns The notification identifier
 */
export async function scheduleMorningDevotional(
  time: { hours: number; minutes: number } = { hours: 7, minutes: 0 }
): Promise<string | null> {
  try {
    // Cancel any existing morning devotional reminders
    await cancelMorningDevotional();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Good Morning',
        body: 'Start your day with Scripture and reflection',
        data: { type: 'morning_devotional' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hours,
        minute: time.minutes,
      },
    });

    console.log('[Notifications] Morning devotional scheduled for', time);
    return identifier;
  } catch (error) {
    console.error('Error scheduling morning devotional:', error);
    return null;
  }
}

/**
 * Schedule an evening reflection reminder (9:00 PM)
 * @param time - The time to send the reminder (hours and minutes)
 * @returns The notification identifier
 */
export async function scheduleEveningReflection(
  time: { hours: number; minutes: number } = { hours: 21, minutes: 0 }
): Promise<string | null> {
  try {
    // Cancel any existing evening reflection reminders
    await cancelEveningReflection();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Evening Reflection',
        body: 'Take a moment to reflect on your day with God',
        data: { type: 'evening_reflection' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hours,
        minute: time.minutes,
      },
    });

    console.log('[Notifications] Evening reflection scheduled for', time);
    return identifier;
  } catch (error) {
    console.error('Error scheduling evening reflection:', error);
    return null;
  }
}

/**
 * @deprecated Use scheduleMorningDevotional or scheduleEveningReflection instead
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
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hours,
        minute: time.minutes,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling devotional reminder:', error);
    return null;
  }
}

/**
 * Schedule a daily "Ask the Bible" wisdom notification
 * Deep-links users directly into ChatHub with a pre-populated question
 * This drives engagement with the 3-Seed system
 */
export async function scheduleDailyWisdomNotification(
  time: { hours: number; minutes: number } = { hours: 8, minutes: 0 }
): Promise<string | null> {
  try {
    // Cancel any existing daily wisdom notifications
    await cancelDailyWisdomNotifications();

    const wisdomPrompts = [
      {
        title: "Your Daily Seed is Ready",
        body: "How does today's Scripture apply to your current season? Tap to ask the Bible.",
        message: "I'm ready for my morning devotion. Can you share a meaningful verse for today and help me apply it to my life?",
      },
      {
        title: "Good Morning, Seeker",
        body: "A fresh word awaits. What question is on your heart today?",
        message: "What Scripture speaks to finding peace and purpose today?",
      },
      {
        title: "Start Your Day in the Word",
        body: "Your daily seeds are refreshed. Ask anything about Scripture.",
        message: "Give me an encouraging verse to meditate on today with a brief explanation of its context.",
      },
    ];

    // Pick a random prompt for variety
    const prompt = wisdomPrompts[Math.floor(Math.random() * wisdomPrompts.length)];

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: prompt.title,
        body: prompt.body,
        data: {
          type: 'ASK_AI_DEEP_LINK',
          screen: 'ChatHub',
          params: {
            initialMessage: prompt.message,
            contextMode: 'devotional',
          },
        },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hours,
        minute: time.minutes,
      },
    });

    console.log('[Notifications] Daily wisdom notification scheduled for', time);
    return identifier;
  } catch (error) {
    console.error('Error scheduling daily wisdom notification:', error);
    return null;
  }
}

/**
 * Cancel all daily wisdom notifications
 */
export async function cancelDailyWisdomNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === 'ASK_AI_DEEP_LINK') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * @deprecated Use cancelMorningDevotional or cancelEveningReflection instead
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
    case 'ASK_AI_DEEP_LINK':
      // Deep-link directly to ChatHub with pre-populated message
      return {
        screen: (data.screen as string) || 'ChatHub',
        params: data.params as Record<string, unknown>,
      };
    case 'morning_devotional':
      return { screen: 'Devotionals' };
    case 'evening_reflection':
      return { screen: 'Home' };
    case 'devotional_reminder':
      return { screen: 'Devotionals' };
    case 'streak':
      return { screen: 'Devotionals' };
    case 'completion':
      return { screen: 'Devotionals' };
    case 'reengagement':
      return { screen: 'Devotionals' };
    // Wayfarer reading plan notifications
    case 'wayfarer_reminder':
    case 'wayfarer_streak':
    case 'wayfarer_grace':
      return { screen: 'Home' };
    // Prayer Circle notifications
    case 'prayer_circle':
    case 'circle_new_prayer':
    case 'circle_member_joined':
      return {
        screen: 'CircleDetail',
        params: { circleId: data.circleId as string },
      };
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

// =====================================================
// WAYFARER READING PLAN NOTIFICATIONS
// =====================================================

/**
 * Schedule a daily Wayfarer Bible reading reminder
 * @param time - The time to send the reminder (hours and minutes)
 * @returns The notification identifier
 */
export async function scheduleWayfarerReminder(
  time: { hours: number; minutes: number }
): Promise<string | null> {
  try {
    // Cancel any existing Wayfarer reminders
    await cancelWayfarerReminders();

    // Set up Android channel for Wayfarer if needed
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('wayfarer-reminders', {
        name: 'Wayfarer Reading Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: theme.colors.primary,
        sound: 'default',
      });
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your daily walk awaits",
        body: "Continue your journey through the Word. Your next chapter is ready.",
        data: {
          type: 'wayfarer_reminder',
          screen: 'Home',
        },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hours,
        minute: time.minutes,
      },
    });

    console.log('[Notifications] Wayfarer reminder scheduled for', time);
    return identifier;
  } catch (error) {
    console.error('Error scheduling Wayfarer reminder:', error);
    return null;
  }
}

/**
 * Cancel all Wayfarer reading reminders
 */
export async function cancelWayfarerReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === 'wayfarer_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Send an immediate Wayfarer streak celebration
 */
export async function sendWayfarerStreakNotification(streakCount: number): Promise<void> {
  const messages = [
    { title: `${streakCount} Day Reading Streak!`, body: "You're building a powerful habit. Keep going!" },
    { title: `${streakCount} Days in the Word!`, body: "Consistency is transforming your heart." },
    { title: `Day ${streakCount} Complete!`, body: "Each day in Scripture draws you closer to God." },
  ];

  const message = messages[streakCount % messages.length];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      data: { type: 'wayfarer_streak', streakCount },
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send a gentle reminder for users who missed days (Grace Path encouragement)
 */
export async function sendWayfarerGraceNotification(daysMissed: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Welcome back, friend",
      body: `We've saved your place. Pick up where you left off, or let us summarize what you missed.`,
      data: { type: 'wayfarer_grace', daysMissed },
    },
    trigger: null,
  });
}

// =====================================================
// PRAYER CIRCLE NOTIFICATIONS
// =====================================================

/**
 * Send a notification when someone prays for a user's prayer request
 * This is called by the backend (via push) - client version for testing
 */
export async function sendPrayerCircleNotification(
  prayerTitle: string,
  prayerName: string,
  circleId: string,
  requestId: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🙏 Someone is praying for you',
      body: `${prayerName} is lifting up "${prayerTitle}"`,
      data: {
        type: 'prayer_circle',
        circleId,
        requestId,
        screen: 'CircleDetail',
      },
      sound: 'default',
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send a notification when a new prayer is shared to a circle
 */
export async function sendNewCirclePrayerNotification(
  authorName: string,
  circleName: string,
  circleId: string,
  requestId: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `New prayer request in ${circleName}`,
      body: `${authorName} shared a prayer request. Join them in prayer.`,
      data: {
        type: 'circle_new_prayer',
        circleId,
        requestId,
        screen: 'CircleDetail',
      },
      sound: 'default',
    },
    trigger: null,
  });
}

/**
 * Send a notification when someone joins a prayer circle
 */
export async function sendCircleJoinNotification(
  memberName: string,
  circleName: string,
  circleId: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Welcome to ${circleName}!`,
      body: `${memberName} has joined your prayer circle.`,
      data: {
        type: 'circle_member_joined',
        circleId,
        screen: 'CircleDetail',
      },
      sound: 'default',
    },
    trigger: null,
  });
}

/**
 * Set up Android notification channel for Prayer Circles
 */
export async function setupPrayerCircleChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-circles', {
      name: 'Prayer Circle Updates',
      description: 'Notifications when someone prays for you or shares in your circle',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: theme.colors.prayer,
      sound: 'default',
    });
  }
}
