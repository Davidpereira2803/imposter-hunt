import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_FREE_GENERATIONS = 1;
const MAX_ADS_PER_DAY = 5;

const isNewDay = (lastDate) => {
  if (!lastDate) return true;
  const last = new Date(lastDate);
  const now = new Date();
  return (
    last.getDate() !== now.getDate() ||
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  );
};

export const useAIStore = create(
  persist(
    (set, get) => ({
      generationsToday: 0,
      watchedAdsToday: 0,
      lastGenerationDate: null,
      generatedTopics: [],
      cache: {},
      maxGenerations: MAX_FREE_GENERATIONS,
      maxAdsPerDay: MAX_ADS_PER_DAY,

      canGenerate: () => {
        const s = get();
        if (isNewDay(s.lastGenerationDate)) {
          set({
            generationsToday: 0,
            watchedAdsToday: 0,
            lastGenerationDate: new Date().toISOString(),
          });
          return true;
        }
        const maxAllowed = MAX_FREE_GENERATIONS + s.watchedAdsToday;
        return s.generationsToday < maxAllowed;
      },

      incrementGenerations: () => {
        const s = get();
        if (isNewDay(s.lastGenerationDate)) {
          set({
            generationsToday: 1,
            watchedAdsToday: 0,
            lastGenerationDate: new Date().toISOString(),
          });
        } else {
          set({ generationsToday: s.generationsToday + 1 });
        }
      },

      incrementAdsWatched: () => {
        const s = get();
        if (isNewDay(s.lastGenerationDate)) {
          set({
            watchedAdsToday: 1,
            lastGenerationDate: new Date().toISOString(),
          });
        } else {
          set({
            watchedAdsToday: Math.min(s.watchedAdsToday + 1, MAX_ADS_PER_DAY),
          });
        }
      },

      addGeneratedTopic: (topic) => {
        const s = get();
        set({
          generatedTopics: [{ ...topic, timestamp: Date.now() }, ...s.generatedTopics].slice(0, 50),
        });
      },

      getCachedResult: (hash) => {
        const entry = get().cache[hash];
        if (!entry) return null;
        const age = Date.now() - entry.timestamp;
        const week = 7 * 24 * 60 * 60 * 1000;
        return age > week ? null : entry.data;
      },

      setCachedResult: (hash, data) => {
        const s = get();
        set({
          cache: {
            ...s.cache,
            [hash]: { data, timestamp: Date.now() },
          },
        });
      },

      cleanCache: () => {
        const s = get();
        const now = Date.now();
        const week = 7 * 24 * 60 * 60 * 1000;
        const next = {};
        for (const [k, v] of Object.entries(s.cache || {})) {
          if (now - v.timestamp < week) next[k] = v;
        }
        set({ cache: next });
      },

      reset: () => {
        set({
          generationsToday: 0,
          watchedAdsToday: 0,
          lastGenerationDate: null,
          generatedTopics: [],
          cache: {},
        });
      },
    }),
    {
      name: "imposter-hunt-ai-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);