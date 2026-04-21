/**
 * prayerStore tests — verify prayer CRUD and analytics hooks.
 */

import { usePrayerStore } from '../../store/prayerStore';
import { trackPrayerAdded, trackPrayerAnswered } from '../../services/analytics';
import { PrayerRequest } from '../../types';

jest.mock('../../store/trialStore', () => ({
  useTrialStore: {
    getState: jest.fn(() => ({
      incrementStat: jest.fn(),
    })),
  },
}));

const buildPrayer = (overrides: Partial<PrayerRequest> = {}): PrayerRequest => ({
  id: `prayer-${Math.random()}`,
  userId: 'user-1',
  request: 'Grant peace',
  status: 'active',
  createdAt: new Date(),
  ...overrides,
});

describe('prayerStore', () => {
  beforeEach(() => {
    usePrayerStore.getState().clearPrayers();
    jest.clearAllMocks();
  });

  it('adds a prayer to the front of the list', () => {
    const prayer = buildPrayer();
    usePrayerStore.getState().addPrayer(prayer);

    const prayers = usePrayerStore.getState().prayers;
    expect(prayers).toHaveLength(1);
    expect(prayers[0].id).toBe(prayer.id);
  });

  it('fires trackPrayerAdded when a new prayer is created', () => {
    usePrayerStore.getState().addPrayer(buildPrayer());
    expect(trackPrayerAdded).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire trackPrayerAnswered for non-status updates', () => {
    const prayer = buildPrayer();
    usePrayerStore.getState().addPrayer(prayer);
    usePrayerStore.getState().updatePrayer(prayer.id, { request: 'Updated' });
    expect(trackPrayerAnswered).not.toHaveBeenCalled();
  });

  it('fires trackPrayerAnswered when a prayer is marked answered', () => {
    const prayer = buildPrayer();
    usePrayerStore.getState().addPrayer(prayer);
    usePrayerStore.getState().updatePrayer(prayer.id, { status: 'answered' });

    expect(trackPrayerAnswered).toHaveBeenCalledTimes(1);
    const updated = usePrayerStore.getState().prayers.find((p) => p.id === prayer.id);
    expect(updated?.status).toBe('answered');
  });

  it('removes a prayer by id', () => {
    const a = buildPrayer({ id: 'a' });
    const b = buildPrayer({ id: 'b' });
    usePrayerStore.getState().addPrayer(a);
    usePrayerStore.getState().addPrayer(b);
    usePrayerStore.getState().removePrayer('a');

    const prayers = usePrayerStore.getState().prayers;
    expect(prayers).toHaveLength(1);
    expect(prayers[0].id).toBe('b');
  });
});
