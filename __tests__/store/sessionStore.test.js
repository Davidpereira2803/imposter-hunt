import { useSessionStore } from '../../src/store/sessionStore';

const resetSessionStore = () => useSessionStore.setState({
  _hasHydrated: true,
  activeSession: null,
  sessionHistory: [],
  allTimeScores: {},
  recordedMatchIds: [],
});

beforeEach(resetSessionStore);

test('awards match participation and civilian-team bonuses once per finished match', () => {
  const store = useSessionStore.getState();
  expect(store.startSession()).toBe(true);
  const record = useSessionStore.getState().recordMatchResult;
  const result = { matchId: 'match-1', winner: 'civilians', players: ['Alice', 'Bob', 'Casey', 'Drew'], roles: ['civilian', 'imposter', 'sheriff', 'jester'], imposterIndex: 1 };

  expect(record(result)).toBe(true);
  expect(record(result)).toBe(false);

  const { activeSession, allTimeScores } = useSessionStore.getState();
  expect(activeSession.matches).toHaveLength(1);
  expect(activeSession.scores.Alice.points).toBe(3);
  expect(activeSession.scores.Casey.points).toBe(3);
  expect(activeSession.scores.Casey.sheriffWins).toBe(1);
  expect(activeSession.scores.Bob.points).toBe(1);
  expect(activeSession.scores.Drew.points).toBe(1);
  expect(allTimeScores.Alice.points).toBe(3);
});

test('awards solo bonuses for imposter and jester wins', () => {
  const store = useSessionStore.getState();
  store.startSession();
  const record = useSessionStore.getState().recordMatchResult;
  record({ matchId: 'imposter-win', winner: 'imposter', players: ['A', 'B', 'C'], roles: ['imposter', 'civilian', 'civilian'], imposterIndex: 0 });
  record({ matchId: 'jester-win', winner: 'jester', players: ['A', 'B', 'C'], roles: ['civilian', 'jester', 'imposter'], imposterIndex: 2 });

  const scores = useSessionStore.getState().activeSession.scores;
  expect(scores.A.points).toBe(5);
  expect(scores.A.imposterWins).toBe(1);
  expect(scores.B.points).toBe(6);
  expect(scores.B.jesterWins).toBe(1);
});

test('finishes a session and preserves lifetime standings and session history', () => {
  const store = useSessionStore.getState();
  store.startSession();
  useSessionStore.getState().recordMatchResult({ matchId: 'match-1', winner: 'civilians', players: ['Alice', 'Bob', 'Casey'], roles: ['civilian', 'imposter', 'civilian'], imposterIndex: 1 });

  const finished = useSessionStore.getState().finishSession();
  expect(finished.matches).toHaveLength(1);
  expect(useSessionStore.getState().activeSession).toBeNull();
  expect(useSessionStore.getState().sessionHistory[0].id).toBe(finished.id);
  expect(useSessionStore.getState().allTimeScores.Alice.points).toBe(3);
});

test('does not start a second session or award matches outside a session', () => {
  const store = useSessionStore.getState();
  expect(store.startSession()).toBe(true);
  expect(useSessionStore.getState().startSession()).toBe(false);
  const finish = useSessionStore.getState().finishSession;
  finish();
  expect(useSessionStore.getState().recordMatchResult({ matchId: 'outside', winner: 'imposter', players: ['A'], roles: ['imposter'], imposterIndex: 0 })).toBe(false);
});
