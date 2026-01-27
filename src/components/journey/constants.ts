/**
 * Journey Screen Constants
 * 
 * Shared constants for moment types, icons, and configurations.
 */

import { theme } from '../../lib/theme';
import { MomentType } from '../../types';

// Moment type configurations using theme colors
export const MOMENT_ICONS: Record<MomentType | string, { icon: string; color: string; label: string }> = {
  journal: { icon: 'book', color: theme.colors.primary, label: 'Journal' },
  prayer: { icon: 'heart', color: theme.colors.error, label: 'Prayer' },
  devotional: { icon: 'sunny', color: theme.colors.accent, label: 'Devotional' },
  gratitude: { icon: 'sparkles', color: theme.colors.warning, label: 'Gratitude' },
  confession: { icon: 'water', color: theme.colors.info, label: 'Confession' },
  memory_practice: { icon: 'bulb', color: theme.colors.accent, label: 'Memory' },
  obedience_step: { icon: 'checkmark-circle', color: theme.colors.success, label: 'Obedience' },
  lectio: { icon: 'leaf', color: theme.colors.success, label: 'Lectio Divina' },
  examen: { icon: 'moon', color: theme.colors.gradient.end, label: 'Examen' },
  answered_prayer: { icon: 'trophy', color: theme.colors.success, label: 'Answered!' },
};
