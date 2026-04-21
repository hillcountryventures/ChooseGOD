/**
 * Flow: user saves a journal entry with a linked verse.
 *
 * Verifies the analytics event captures has_verse and has_media flags correctly
 * and that the moment is prepended to the recentMoments list.
 */

import { useMomentStore } from '../../store/momentStore';
import { trackJournalEntryCreated } from '../../services/analytics';
import { SpiritualMoment } from '../../types';

const incrementStat = jest.fn();
jest.mock('../../store/trialStore', () => ({
  useTrialStore: {
    getState: () => ({ incrementStat }),
  },
}));

const makeMoment = (
  overrides: Partial<SpiritualMoment> = {}
): SpiritualMoment => ({
  id: `m-${Math.random()}`,
  userId: 'u',
  momentType: 'journal',
  content: 'Reflecting today...',
  createdAt: new Date(),
  status: 'published',
  source: 'standalone',
  ...overrides,
});

describe('flow: create journal entry', () => {
  beforeEach(() => {
    useMomentStore.setState({ recentMoments: [] });
    jest.clearAllMocks();
  });

  it('captures has_verse=false, has_media=false for a bare entry', () => {
    useMomentStore.getState().addMoment(makeMoment());
    expect(trackJournalEntryCreated).toHaveBeenCalledWith(false, false);
  });

  it('captures has_verse=true when a verse is linked', () => {
    useMomentStore.getState().addMoment(
      makeMoment({
        linkedVerses: [
          { book: 'John', chapter: 3, verse: 16, text: '...', translation: 'KJV' },
        ],
      })
    );
    expect(trackJournalEntryCreated).toHaveBeenCalledWith(true, false);
  });

  it('captures has_media=true when photos/voice are attached', () => {
    useMomentStore.getState().addMoment(
      makeMoment({
        media: [{ type: 'photo', uri: 'file://photo.jpg' }],
      })
    );
    expect(trackJournalEntryCreated).toHaveBeenCalledWith(false, true);
  });

  it('prepends the new moment to recentMoments', () => {
    const first = makeMoment({ id: 'first' });
    const second = makeMoment({ id: 'second' });
    useMomentStore.getState().addMoment(first);
    useMomentStore.getState().addMoment(second);
    const recent = useMomentStore.getState().recentMoments;
    expect(recent[0].id).toBe('second');
    expect(recent[1].id).toBe('first');
  });
});
