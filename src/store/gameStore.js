import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import topicLists from "../data/topics.json";
import localizedTopicLists from "../data/localizedTopics.json";
import luxembourgishWords from "../data/luWords.json";
import { useLanguageStore } from "./languageStore";

const topics = { ...topicLists, Luxembourgish: luxembourgishWords };

const getWordsForLocale = (key, words) => {
  const locale = useLanguageStore.getState().locale || "en";
  return localizedTopicLists[locale]?.[key] || words;
};

const CUSTOM_TOPICS_KEY = "imposter-hunt-custom-topics";
let topicWrites = Promise.resolve();
const queueTopicWrite = (write) => {
  const operation = topicWrites.then(write);
  topicWrites = operation.catch(() => {});
  return operation;
};

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

      enableJester: false,
      enableSheriff: false,
      roles: [],
      sheriffUsedAbility: false,

      setPlayers: (players) => set({ players }),
      setTopicKey: (topicKey) => set({ topicKey }),

      setEnableJester: (enable) => set({ enableJester: enable }),
      setEnableSheriff: (enable) => set({ enableSheriff: enable }),
      setSheriffUsedAbility: (used) => set({ sheriffUsedAbility: used }),

      getTopicByKey: (key) => {
        if (!key) return null;
        
        if (key === "random") {
          const { customTopics } = get();
          const preWords = get().getAllTopics()
            .filter((topic) => topic.key !== "random")
            .flatMap((topic) => topic.words || []);
          const customWords = (customTopics || []).flatMap(t => t.words || []);
          const allWords = [...new Set([...preWords, ...customWords])];
          
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
          return { key, name: key, words: getWordsForLocale(key, words), isCustom: false };
        }
        return null;
      },
      getTopicWordsByKey: (key) => {
        const t = get().getTopicByKey(key);
        return t ? t.words : null;
      },

      startMatch: () => {
        const { players, topicKey, enableJester, enableSheriff } = get();
        if (!players || players.length < 3) return false;

        let words;
        if (topicKey === "random") {
          const topicLists = get().getAllTopics().filter((topic) => topic.key !== "random" && topic.words?.length);
          const selectedTopic = topicLists[Math.floor(Math.random() * topicLists.length)];
          words = selectedTopic?.words;
        } else {
          words = get().getTopicWordsByKey(topicKey);
        }
        if (!words || words.length === 0) {
          console.error("Invalid topic key");
          return false;
        }

        const secretWord = words[Math.floor(Math.random() * words.length)];

        let availableRoles = ["imposter"];

        if (players.length >= 4) {
          if (enableJester) availableRoles.push("jester");
          if (enableSheriff) availableRoles.push("sheriff");
        }

        while (availableRoles.length < players.length) {
          availableRoles.push("civilian");
        }

        for (let i = availableRoles.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableRoles[i], availableRoles[j]] = [availableRoles[j], availableRoles[i]];
        }

        const imposterIndex = availableRoles.indexOf("imposter");
        const alive = players.map(() => true);

        set({
          secretWord,
          imposterIndex,
          roles: availableRoles,
          alive,
          round: 1,
          sheriffUsedAbility: false,
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
          roles: [],
          sheriffUsedAbility: false,
        });
      },

      eliminatePlayer: (index) => {
        const { alive, imposterIndex, players, roles } = get();
        
        if (!alive || !players || index == null) return null;

        const newAlive = [...alive];
        newAlive[index] = false;

        set({ alive: newAlive });

        if (roles && roles[index] === "jester") {
          return "jester";
        }

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
          roles: [],
          enableJester: false,
          enableSheriff: false,
          sheriffUsedAbility: false,
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
      addCustomTopic: ({ name, words = [] }) => queueTopicWrite(async () => {
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

        const topic = { name: safeName, words: safeWords };
        const next = [...(get().customTopics || []), topic];
        try {
          // Only report success after the custom topic has actually been saved.
          await AsyncStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(next));
        } catch {
          return { ok: false, code: "storage", error: "Could not save topic" };
        }
        set({ customTopics: next });
        return { ok: true };
      }),
      removeCustomTopic: (name) => queueTopicWrite(async () => {
        const next = (get().customTopics || []).filter((t) => t.name !== name);
        set({ customTopics: next });
        await get().saveCustomTopics?.();

        const selected = get().topicKey;
        if (selected && selected.startsWith("custom:") && selected === `custom:${slugify(name)}`) {
          set({ topicKey: undefined });
        }
      }),
      getAllTopics: () => {
        const pre = Object.entries(get().predefinedTopics || {}).map(([key, words]) => ({
          key, name: key, words: getWordsForLocale(key, words), isCustom: false,
        }));
        const custom = (get().customTopics || []).map((t) => ({
          key: `custom:${slugify(t.name)}`, name: t.name, words: t.words || [], isCustom: true,
          isAI: t.isAI || /\s\(AI(?:\s+\d+)?\)$/i.test(t.name),
        }));
        
        const allWords = [
          ...new Set([...pre.flatMap(t => t.words), ...custom.flatMap(t => t.words)]),
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
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        // Refresh bundled lists when an older app version persisted its copy.
        predefinedTopics: {
          ...(persistedState?.predefinedTopics || {}),
          ...topics,
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          state._hydrated = true;
        }
      },
    }
  )
);
