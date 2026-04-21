/**
 * Magic Moments telemetry for the First 14 Days Playbook (Decision #15).
 *
 * Every designed trigger fires an analytics event. PostHog funnel analysis
 * can then measure the "% of trial users who experienced moment N by
 * day N" \u2014 which is how we tell whether the playbook is working without
 * waiting for the D14 conversion signal.
 *
 * Usage (from screens or stores):
 *   import { trackMagicMoment } from '../services/magicMoments';
 *   trackMagicMoment('day1_tool_confirmation', { tool: 'journal' });
 */

import { trackEvent } from './analytics';

export type MagicMomentId =
  // Day 0 \u2014 onboarding
  | 'day0_welcome_seen'
  | 'day0_grace_demo_seen'
  | 'day0_grace_demo_revealed'
  | 'day0_tradition_selected'
  // Day 1 \u2014 first tool confirmation
  | 'day1_tool_confirmation'
  | 'day1_first_chat_sent'
  // Day 2-3 \u2014 Strong's reveal + Camera OCR
  | 'day23_strongs_reveal'
  | 'day23_camera_ocr_surfaced'
  | 'day23_camera_ocr_used'
  // Day 4-6 \u2014 Grace Mode catch-up
  | 'day46_grace_mode_triggered'
  | 'day46_grace_mode_completed'
  | 'day34_grace_demo_proactive' // for streaked users
  // Day 7 \u2014 Sunday Digest
  | 'day7_sunday_digest_sent'
  | 'day7_sunday_digest_opened'
  // Day 8-10 \u2014 Memory + Lectio
  | 'day810_memory_invitation_seen'
  | 'day810_memory_started'
  | 'day810_lectio_invitation_seen'
  | 'day810_lectio_started'
  // Day 11-12 \u2014 Answered prayer
  | 'day1112_answered_prayer_prompt'
  | 'day1112_celebration_shown'
  | 'day1112_shared'
  // Day 13 \u2014 Trial warning
  | 'day13_trial_warning_shown'
  // Day 14 \u2014 Conversion
  | 'day14_insights_summary_shown'
  | 'day14_conversion_paywall_shown'
  | 'day14_converted'
  | 'day14_stayed_free';

export function trackMagicMoment(
  id: MagicMomentId,
  properties?: Record<string, string | number | boolean>,
): void {
  trackEvent(`magic_moment:${id}`, properties);
}

/**
 * Returns the "day bucket" a user is currently in based on firstActivityDate.
 * Used by Home/ChatHub screens to decide which coach-mark / nudge to show.
 */
export function getDayBucket(firstActivityDate: string | null): number {
  if (!firstActivityDate) return 0;
  const start = new Date(firstActivityDate).getTime();
  if (!Number.isFinite(start)) return 0;
  const days = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(days, 30));
}

export interface MagicMomentGuard {
  seen: boolean;
  markSeen: () => Promise<void>;
}
