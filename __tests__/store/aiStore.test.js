import { act } from '@testing-library/react-native';
import { useAIStore } from '../../src/store/aiStore';

const yesterdayISO = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const resetStore = () => {
  act(() => {
    useAIStore.getState().reset();
  });
};

describe('AI Store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('resets daily counters on a new day', () => {
    useAIStore.setState({
      generationsToday: 3,
      watchedAdsToday: 2,
      lastGenerationDate: yesterdayISO(),
    });

    act(() => useAIStore.getState().ensureDailyReset());

    const s = useAIStore.getState();
    expect(s.generationsToday).toBe(0);
    expect(s.watchedAdsToday).toBe(0);
    expect(new Date(s.lastGenerationDate).getDate()).toBe(new Date().getDate());
  });

  it('caps max allowed generations to free + ads (5 max)', () => {
    useAIStore.setState({
      watchedAdsToday: 10,
      generationsToday: 0,
      lastGenerationDate: new Date().toISOString(),
    });

    expect(useAIStore.getState().getMaxAllowedToday()).toBe(6);
  });

  it('canGenerate is false when at limit, true after day reset', () => {
    useAIStore.setState({
      generationsToday: 6,
      watchedAdsToday: 5,
      lastGenerationDate: new Date().toISOString(),
    });

    expect(useAIStore.getState().canGenerate()).toBe(false);

    useAIStore.setState({
      generationsToday: 6,
      watchedAdsToday: 5,
      lastGenerationDate: yesterdayISO(),
    });

    expect(useAIStore.getState().canGenerate()).toBe(true);
    expect(useAIStore.getState().generationsToday).toBe(0);
    expect(useAIStore.getState().watchedAdsToday).toBe(0);
  });

  it('incrementGenerations resets day and starts at 1', () => {
    useAIStore.setState({
      generationsToday: 2,
      watchedAdsToday: 1,
      lastGenerationDate: yesterdayISO(),
    });

    act(() => useAIStore.getState().incrementGenerations());

    const s = useAIStore.getState();
    expect(s.generationsToday).toBe(1);
    expect(s.watchedAdsToday).toBe(0);
  });

  it('incrementAdsWatched caps at 5 and resets on new day', () => {
    useAIStore.setState({
      watchedAdsToday: 5,
      lastGenerationDate: new Date().toISOString(),
    });

    act(() => useAIStore.getState().incrementAdsWatched());
    expect(useAIStore.getState().watchedAdsToday).toBe(5);

    useAIStore.setState({
      watchedAdsToday: 2,
      lastGenerationDate: yesterdayISO(),
    });

    act(() => useAIStore.getState().incrementAdsWatched());
    expect(useAIStore.getState().watchedAdsToday).toBe(1);
  });

  it('getRemainingGenerations accounts for bonus ads', () => {
    useAIStore.setState({
      watchedAdsToday: 2,
      generationsToday: 1,
      lastGenerationDate: new Date().toISOString(),
    });

    expect(useAIStore.getState().getRemainingGenerations()).toBe(2);
  });

  it('addGeneratedTopic prepends and caps at 50', () => {
    for (let i = 0; i < 51; i += 1) {
      act(() =>
        useAIStore
          .getState()
          .addGeneratedTopic({ topicGroup: `Topic ${i}`, items: [`w${i}`] }),
      );
    }

    const { generatedTopics } = useAIStore.getState();
    expect(generatedTopics).toHaveLength(50);
    expect(generatedTopics[0].topicGroup).toBe('Topic 50');
    expect(generatedTopics[49].topicGroup).toBe('Topic 1');
    expect(generatedTopics.every((t) => typeof t.timestamp === 'number')).toBe(true);
  });

  it('cache get/set respects freshness', () => {
    act(() => useAIStore.getState().setCachedResult('key', { foo: 'bar' }));
    expect(useAIStore.getState().getCachedResult('key')).toEqual({ foo: 'bar' });

    useAIStore.setState({
      cache: {
        key: { data: { foo: 'bar' }, timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 },
      },
    });

    expect(useAIStore.getState().getCachedResult('key')).toBeNull();
  });

  it('cleanCache removes stale entries and keeps fresh ones', () => {
    useAIStore.setState({
      cache: {
        old: { data: 1, timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 },
        fresh: { data: 2, timestamp: Date.now() - 60 * 60 * 1000 },
      },
    });

    act(() => useAIStore.getState().cleanCache());

    const { cache } = useAIStore.getState();
    expect(cache.old).toBeUndefined();
    expect(cache.fresh.data).toBe(2);
  });
});