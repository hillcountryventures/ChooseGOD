/**
 * Value-first notification payload generators.
 *
 * Per Decision #8: every push notification delivers a gift \u2014 a verse, a
 * prayer-circle update, an answered prayer, a short reflection. Never
 * "Don't forget to read today!" or "You haven't opened the app in X days!"
 *
 * If a user has been disengaged >14 days we stop sending daily pushes
 * entirely and fall back to the Sunday Digest + seasonal win-backs.
 */

const STOP_DAILY_PUSH_AFTER_DAYS = 14;

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string | number>;
}

export interface NotificationContext {
  userDisplayName?: string;
  daysSinceLastOpen?: number;
  recentHighlightRef?: string; // e.g. "Psalm 23:1"
  circleActivityCount?: number;
  verseOfDay?: { reference: string; text: string };
  themeThisMonth?: string;
}

/** Rotation of grace-first verse-of-day notifications. */
const VERSE_NUDGES: Array<{ title: string; body: string }> = [
  {
    title: 'A verse for today',
    body: 'Psalm 46:10 \u2014 "Be still, and know that I am God."',
  },
  {
    title: 'Grace for this moment',
    body: 'Lamentations 3:22-23 \u2014 His mercies are new every morning.',
  },
  {
    title: 'Small rest',
    body: 'Matthew 11:28 \u2014 "Come to me, all who are weary..."',
  },
  {
    title: 'A word worth sitting with',
    body: 'Romans 8:38-39 \u2014 Nothing can separate you from God\u2019s love.',
  },
  {
    title: 'For today',
    body: '2 Corinthians 12:9 \u2014 "My grace is sufficient for you."',
  },
];

/** Build the daily-open notification payload. Returns null if we should
 *  suppress daily pushes entirely for a disengaged user. */
export function buildDailyPush(
  context: NotificationContext,
): NotificationPayload | null {
  if ((context.daysSinceLastOpen ?? 0) > STOP_DAILY_PUSH_AFTER_DAYS) {
    return null;
  }

  if (context.verseOfDay) {
    return {
      title: 'Today\u2019s verse',
      body: `${context.verseOfDay.reference} \u2014 ${context.verseOfDay.text}`,
      data: { kind: 'verse_of_day', ref: context.verseOfDay.reference },
    };
  }

  const nudge = VERSE_NUDGES[Math.floor(Math.random() * VERSE_NUDGES.length)];
  return { ...nudge, data: { kind: 'verse_nudge' } };
}

/** Someone in the user's circle posted a prayer or marked one answered. */
export function buildCircleActivityPush(
  circleName: string,
  activity: 'new_prayer' | 'answered' | 'praying_for_you',
  actorName?: string,
): NotificationPayload {
  switch (activity) {
    case 'new_prayer':
      return {
        title: `New prayer in ${circleName}`,
        body: `${actorName ?? 'Someone'} shared a prayer request. Tap to pray with them.`,
        data: { kind: 'circle_new_prayer' },
      };
    case 'answered':
      return {
        title: 'Praise God',
        body: `${actorName ?? 'Someone'} just marked their prayer as answered.`,
        data: { kind: 'circle_answered' },
      };
    case 'praying_for_you':
      return {
        title: 'Someone is praying for you',
        body: `${actorName ?? 'A friend'} is standing with you right now.`,
        data: { kind: 'circle_praying' },
      };
  }
}

/** Short reflection delivered mid-day. Premium-esque but shipped to free too. */
export function buildReflectionPush(theme?: string): NotificationPayload {
  const t = theme ?? 'grace';
  return {
    title: '30 seconds with God',
    body: `A short reflection on ${t}. Tap when you have a minute.`,
    data: { kind: 'reflection_nudge', theme: t },
  };
}

/** Sunday Digest notification that pairs with the email (L4). */
export function buildSundayDigestPush(): NotificationPayload {
  return {
    title: 'Your Sunday with ChooseGOD',
    body: 'A look back at your walk this week \u2014 tap to see what we noticed.',
    data: { kind: 'sunday_digest' },
  };
}

export const _testing = { STOP_DAILY_PUSH_AFTER_DAYS };
