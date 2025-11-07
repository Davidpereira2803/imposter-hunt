import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import topics from "../data/topics.json";

const CUSTOM_TOPICS_KEY = "imposter-hunt-custom-topics";

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
      predefinedTopics: topics,
      customTopics: [],

      setPlayers: (players) => set({ players }),
      setTopicKey: (topicKey) => set({ topicKey }),

      getTopicByKey: (key) => {
        if (!key) return null;
        
        if (key === "random") {
          const { predefinedTopics, customTopics } = get();
          const preWords = Object.values(predefinedTopics || {}).flat();
          const customWords = (customTopics || []).flatMap(t => t.words || []);
          const allWords = [...preWords, ...customWords];
          
          return {
            key: "random",
            name: "Random",
            words: allWords,
            isCustom: false
          };
        }
        
        if (key.startsWith("custom:")) {
          const slug = key.slice("custom:".length);
          const t = (get().customTopics || []).find((x) => slugify(x.name) === slug);
          return t ? { key, name: t.name, words: t.words || [], isCustom: true } : null;
        }
        const words = (get().predefinedTopics || {})[key];
        if (Array.isArray(words)) {
          return { key, name: key, words, isCustom: false };
        }
        return null;
      },
      getTopicWordsByKey: (key) => {
        const t = get().getTopicByKey(key);
        return t ? t.words : null;
      },

      startMatch: () => {
        const { players, topicKey } = get();
        if (!players || players.length < 3) return false;

        const words = get().getTopicWordsByKey(topicKey);
        if (!words || words.length === 0) {
          console.error("Invalid topic key");
          return false;
        }

        const secretWord = words[Math.floor(Math.random() * words.length)];
        const imposterIndex = Math.floor(Math.random() * players.length);

        const alive = players.map(() => true);

        set({
          secretWord,
          imposterIndex,
          alive,
          round: 1,
        });

        return true;
      },

      nextRound: () => {
        set((state) => ({ round: (state.round || 1) + 1 }));
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
        
        if (!alive || !players || index == null) return null;

        const newAlive = [...alive];
        newAlive[index] = false;

        set({ alive: newAlive });

        if (index === imposterIndex) {
          return "civilians";
        }

        const aliveCount = newAlive.filter(Boolean).length;
        
        if (aliveCount <= 2) {
          return "imposter";
        }

        return "continue";
      },

      checkGameOver: () => {
        const { alive, imposterIndex } = get();
        if (!alive) return null;

        const imposterAlive = alive[imposterIndex];
        if (!imposterAlive) {
          return "civilians";
        }

        const aliveCount = alive.filter(Boolean).length;
        
        if (aliveCount <= 2) {
          return "imposter";
        }

        return null;
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

      loadCustomTopics: async () => {
        try {
          const raw = await AsyncStorage.getItem(CUSTOM_TOPICS_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          set({ customTopics: Array.isArray(parsed) ? parsed : [] });
        } catch {}
      },
      saveCustomTopics: async () => {
        try {
          const { customTopics } = get();
          await AsyncStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(customTopics));
        } catch {}
      },
      addCustomTopic: async ({ name, words = [] }) => {
        const safeName = (name || "").trim();
        const safeWords = (words || []).map((w) => String(w).trim()).filter(Boolean);
        if (!safeName) return { ok: false, error: "Topic name required" };

        const predefinedNames = Object.keys(get().predefinedTopics || {});
        const allNamesLower = [
          ...predefinedNames,
          ...(get().customTopics || []).map((t) => t.name),
        ].map((n) => n.toLowerCase());

        if (allNamesLower.includes(safeName.toLowerCase())) {
          return { ok: false, error: "Topic name already exists" };
        }

        const next = [...(get().customTopics || []), { name: safeName, words: safeWords }];
        set({ customTopics: next });
        await get().saveCustomTopics?.();
        return { ok: true };
      },
      removeCustomTopic: async (name) => {
        const next = (get().customTopics || []).filter((t) => t.name !== name);
        set({ customTopics: next });
        await get().saveCustomTopics?.();

        const selected = get().topicKey;
        if (selected && selected.startsWith("custom:") && selected === `custom:${slugify(name)}`) {
          set({ topicKey: undefined });
        }
      },
      getAllTopics: () => {
        const pre = Object.entries(get().predefinedTopics || {}).map(([key, words]) => ({
          key, name: key, words, isCustom: false,
        }));
        const custom = (get().customTopics || []).map((t) => ({
          key: `custom:${slugify(t.name)}`, name: t.name, words: t.words || [], isCustom: true,
        }));
        
        const allWords = [
          ...pre.flatMap(t => t.words),
          ...custom.flatMap(t => t.words),
        ];
        
        const randomTopic = {
          key: "random",
          name: "Random",
          words: allWords,
          isCustom: false,
        };
        
        return [randomTopic, ...pre, ...custom];
      },
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
