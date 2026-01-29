import { useJourneyStore } from '../../store/journeyStore';

// Mock supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
    functions: { invoke: jest.fn() },
  },
}));

jest.mock('../../constants/database', () => ({
  TABLES: { SPIRITUAL_MOMENTS: 'spiritual_moments' },
}));

describe('journeyStore', () => {
  beforeEach(() => {
    useJourneyStore.getState().clearStore();
  });

  it('has correct initial state', () => {
    const state = useJourneyStore.getState();
    expect(state.timelineItems).toEqual([]);
    expect(state.timelineLoading).toBe(false);
    expect(state.timelineError).toBeNull();
    expect(state.currentStreak).toBe(0);
    expect(state.growthData).toBeNull();
  });

  it('setSelectedMonth updates month', () => {
    const date = new Date(2025, 5, 1);
    useJourneyStore.getState().setSelectedMonth(date);
    expect(useJourneyStore.getState().selectedMonth).toEqual(date);
  });

  it('addTimelineItem prepends item', () => {
    const item = {
      id: '1',
      type: 'devotional' as const,
      title: 'Test',
      content: 'test',
      createdAt: new Date(),
    };
    useJourneyStore.getState().addTimelineItem(item);
    expect(useJourneyStore.getState().timelineItems).toHaveLength(1);
    expect(useJourneyStore.getState().timelineItems[0].id).toBe('1');
  });

  it('clearStore resets state', () => {
    useJourneyStore.getState().addTimelineItem({
      id: '1',
      type: 'prayer' as const,
      title: 'X',
      content: '',
      createdAt: new Date(),
    });
    useJourneyStore.getState().clearStore();
    expect(useJourneyStore.getState().timelineItems).toEqual([]);
    expect(useJourneyStore.getState().currentStreak).toBe(0);
  });

  it('fetchTimeline sets loading state', async () => {
    const promise = useJourneyStore.getState().fetchTimeline('user1');
    expect(useJourneyStore.getState().timelineLoading).toBe(true);
    await promise;
    expect(useJourneyStore.getState().timelineLoading).toBe(false);
  });
});
