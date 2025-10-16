import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import topics from "../data/topics.json";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      _hasHydrated: false,

      players: [],            // ["Alice", "Bob", "Cara", ...]
      alive: [],              // [true, true, true, ...] mirrors players by index
      topicKey: null,         // "food" | "animals" | ...
      secretWord: null,
      imposterIndex: null,    // index in players
      round: 1,

      setPlayers: (players) => set({ players }),
      setTopicKey: (topicKey) => set({ topicKey }),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      startMatch: () => {
        const { players, topicKey } = get();
        if (!topicKey || (players?.length ?? 0) < 3) return false;
        const wordList = topics[topicKey] || [];
        if (!wordList.length) return false;

        const word = pickRandom(wordList);
        const imposterIndex = Math.floor(Math.random() * players.length);
        const alive = players.map(() => true);

        set({ secretWord: word, imposterIndex, round: 1, alive });
        return true;
      },

      eliminatePlayer: (idx) => {
        const { alive, imposterIndex } = get();
        if (!alive[idx]) return "continue";
        const nextAlive = alive.slice();
        nextAlive[idx] = false;
        set({ alive: nextAlive });

        if (idx === imposterIndex) {
          return "civilians";
        }
        return "continue";
      },

      aliveCount: () => {
        const { alive } = get();
        return alive.filter(Boolean).length;
      },

      nextRound: () => set((s) => ({ round: s.round + 1 })),

      resetMatch: () =>
        set({
          players: [],
          alive: [],
          topicKey: null,
          secretWord: null,
          imposterIndex: null,
          round: 1
        }),

      clearStorage: async () => {
        try {
          await AsyncStorage.removeItem("fakeout-game-storage");
          set({
            players: [],
            alive: [],
            topicKey: null,
            secretWord: null,
            imposterIndex: null,
            round: 1
          });
        } catch (error) {
          console.error("Failed to clear storage:", error);
        }
      },
    }),
    {
      name: "fakeout-game-storage",
      storage: createJSONStorage(() => AsyncStorage),
      
      partialize: (state) => ({
        players: state.players,
        topicKey: state.topicKey,
      }),

      version: 1,
      
      onRehydrateStorage: (state) => {
        console.log("Starting hydration...");
        return (state, error) => {
          if (error) {
            console.log("Error during rehydration:", error);
          } else {
            console.log("Hydration completed successfully");
          }
          useGameStore.getState().setHasHydrated(true);
        };
      },
    }
  )
);
