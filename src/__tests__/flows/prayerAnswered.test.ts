/**
 * Flow: user marks a prayer as answered.
 *
 * Verifies:
 *  - Prayer moves to "answered" state
 *  - Analytics event is fired
 *  - Trial stat is incremented
 *  - Other prayers are unaffected
 */

import { usePrayerStore } from '../../store/prayerStore';
import { trackPrayerAnswered } from '../../services/analytics';
import { PrayerRequest } from '../../types';

const incrementStat = jest.fn();
jest.mock('../../store/trialStore', () => ({
  useTrialStore: {
    getState: () => ({ incrementStat }),
  },
}));

const makePrayer = (id: string, status: PrayerRequest['status'] = 'active'): PrayerRequest => ({
  id,
  userId: 'u',
  request: `Prayer ${id}`,
  status,
  createdAt: new Date(),
});

describe('flow: mark prayer as answered', () => {
  beforeEach(() => {
    usePrayerStore.getState().clearPrayers();
    jest.clearAllMocks();
  });

  it('moves prayer to answered state and fires analytics', () => {
    const p = makePrayer('target');
    const other = makePrayer('keep-active');
    usePrayerStore.getState().addPrayer(p);
    usePrayerStore.getState().addPrayer(other);

    usePrayerStore.getState().updatePrayer('target', {
      status: 'answered',
      answeredAt: new Date(),
      answeredReflection: 'Praise God',
    });

    const prayers = usePrayerStore.getState().prayers;
    const updated = prayers.find((p) => p.id === 'target');
    const untouched = prayers.find((p) => p.id === 'keep-active');

    expect(updated?.status).toBe('answered');
    expect(updated?.answeredReflection).toBe('Praise God');
    expect(untouched?.status).toBe('active');
    expect(trackPrayerAnswered).toHaveBeenCalledTimes(1);
    expect(incrementStat).toHaveBeenCalledWith('prayersAnswered');
  });
});
