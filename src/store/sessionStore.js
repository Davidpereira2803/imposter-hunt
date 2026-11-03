import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const emptyStats = (name) => ({
  name,
  points: 0,
  matchesPlayed: 0,
  wins: 0,
  civilianWins: 0,
  sheriffWins: 0,
  imposterWins: 0,
  jesterWins: 0,
});

export const sortPlayerScores = (scores = {}) =>
  Object.values(scores).sort((a, b) =>
    b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name)
  );

export const useSessionStore = create(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      activeSession: null,
      sessionHistory: [],
      allTimeScores: {},
      recordedMatchIds: [],

      startSession: () => {
        if (!get()._hasHydrated || get().activeSession) return false;
        set({
          activeSession: {
            id: makeId(),
            startedAt: Date.now(),
            hourReminderShown: false,
            players: [],
            scores: {},
            matches: [],
          },
        });
        return true;
      },

      recordMatchResult: ({ matchId, winner, players, roles, imposterIndex }) => {
        const { activeSession, allTimeScores, recordedMatchIds } = get();
        if (!activeSession || !matchId || !Array.isArray(players) || !players.length) return false;
        if (!["civilians", "imposter", "jester"].includes(winner)) return false;
        if (recordedMatchIds.includes(matchId)) return false;
        if (activeSession.matches.some((match) => match.id === matchId)) return false;

        const winnerIndices = new Set();
        if (winner === "imposter" && Number.isInteger(imposterIndex)) {
          winnerIndices.add(imposterIndex);
        } else if (winner === "civilians") {
          roles?.forEach((role, index) => {
            if (role === "civilian" || role === "sheriff") winnerIndices.add(index);
          });
        } else if (winner === "jester") {
          roles?.forEach((role, index) => {
            if (role === "jester") winnerIndices.add(index);
          });
        }

        const bonusPoints = winner === "civilians" ? 2 : winner === "imposter" ? 3 : 4;
        const sessionScores = { ...activeSession.scores };
        const lifetimeScores = { ...allTimeScores };
        const participants = [...new Set(players.map((name) => String(name || "").trim()).filter(Boolean))];
        const winningPlayers = [];

        players.forEach((rawName, index) => {
          const name = String(rawName || "").trim();
          if (!name) return;
          const role = roles?.[index] || (index === imposterIndex ? "imposter" : "civilian");
          const isWinner = winnerIndices.has(index);
          const bonus = isWinner ? bonusPoints : 0;
          const statsKey = name.normalize("NFC");

          const updateStats = (existing) => {
            const next = { ...(existing || emptyStats(name)), name };
            next.points = (next.points || 0) + 1 + bonus;
            next.matchesPlayed = (next.matchesPlayed || 0) + 1;
            if (isWinner) {
              next.wins = (next.wins || 0) + 1;
              if (role === "civilian") next.civilianWins = (next.civilianWins || 0) + 1;
              if (role === "sheriff") next.sheriffWins = (next.sheriffWins || 0) + 1;
              if (role === "imposter") next.imposterWins = (next.imposterWins || 0) + 1;
              if (role === "jester") next.jesterWins = (next.jesterWins || 0) + 1;
            }
            return next;
          };

          sessionScores[statsKey] = updateStats(sessionScores[statsKey]);
          lifetimeScores[statsKey] = updateStats(lifetimeScores[statsKey]);
          if (isWinner) winningPlayers.push({ name, role });
        });

        const completedMatch = {
          id: matchId,
          endedAt: Date.now(),
          winner,
          participantCount: participants.length,
          winners: winningPlayers,
        };
        const nextSession = {
          ...activeSession,
          players: [...new Set([...activeSession.players, ...participants])],
          scores: sessionScores,
          matches: [...activeSession.matches, completedMatch],
        };

        set({
          activeSession: nextSession,
          allTimeScores: lifetimeScores,
          recordedMatchIds: [...recordedMatchIds, matchId].slice(-5000),
        });
        return true;
      },

      markHourReminderShown: (sessionId) => {
        const session = get().activeSession;
        if (!session || session.id !== sessionId || session.hourReminderShown) return false;
        set({ activeSession: { ...session, hourReminderShown: true } });
        return true;
      },

      finishSession: (sessionId) => {
        const session = get().activeSession;
        if (!session || (sessionId && session.id !== sessionId)) return false;
        const finishedSession = { ...session, finishedAt: Date.now() };
        set({
          activeSession: null,
          sessionHistory: [finishedSession, ...get().sessionHistory].slice(0, 20),
        });
        return finishedSession;
      },

      clearSessionData: () => set({
        activeSession: null,
        sessionHistory: [],
        allTimeScores: {},
        recordedMatchIds: [],
      }),
    }),
    {
      name: "munkeler-session-scores",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useSessionStore.setState({ _hasHydrated: true });
      },
    }
  )
);
