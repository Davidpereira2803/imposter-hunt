import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import topics from "../data/topics.json";

export const useGameStore = create(
  persist(
    (set, get) => ({
      players: [],
      topicKey: "",
      secretWord: "",
      imposterIndex: null,
      alive: [],
      round: 1,
      _hasHydrated: false,

      setPlayers: (players) => set({ players }),
      setTopicKey: (topicKey) => set({ topicKey }),

      startMatch: () => {
        const { players, topicKey } = get();
        
        if (!players || players.length < 3) {
          console.error("Need at least 3 players");
          return false;
        }

        if (!topicKey || !topics[topicKey]) {
          console.error("Invalid topic key");
          return false;
        }

        const words = topics[topicKey];
        if (!words || words.length === 0) {
          console.error("No words available for this topic");
          return false;
        }

        const randomWord = words[Math.floor(Math.random() * words.length)];
        
        const randomImposter = Math.floor(Math.random() * players.length);
        
        const aliveArray = players.map(() => true);

        set({
          secretWord: randomWord,
          imposterIndex: randomImposter,
          alive: aliveArray,
          round: 1,
        });

        console.log("Match started:", {
          word: randomWord,
          imposter: players[randomImposter],
          players: players.length,
        });

        return true;
      },

      resetMatch: () => {
        set({
          secretWord: "",
          imposterIndex: null,
          alive: [],
          round: 1,
        });
      },

      eliminatePlayer: (index) => {
        const { alive, imposterIndex, players } = get();
        
        if (!alive || !players) return null;

        const newAlive = [...alive];
        newAlive[index] = false;

        set({ alive: newAlive });

        if (index === imposterIndex) {
          return "civilians";
        }

        const aliveCount = newAlive.filter(Boolean).length;
        if (aliveCount === 2) {
          return "imposter";
        }

        return "continue";
      },

      aliveCount: () => {
        const { alive } = get();
        return alive ? alive.filter(Boolean).length : 0;
      },

      clearStorage: async () => {
        await AsyncStorage.clear();
        set({
          players: [],
          topicKey: "",
          secretWord: "",
          imposterIndex: null,
          alive: [],
          round: 1,
        });
      },

      _hydrated: false,
    }),
    {
      name: "imposter-hunt-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          state._hydrated = true;
        }
      },
    }
  )
);
