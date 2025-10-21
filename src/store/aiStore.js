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
        const state = get();
        
        if (isNewDay(state.lastGenerationDate)) {
          set({
            generationsToday: 0,
            watchedAdsToday: 0,
            lastGenerationDate: new Date().toISOString(),
          });
          return true;
        }

        const maxAllowed = MAX_FREE_GENERATIONS + state.watchedAdsToday;
        return state.generationsToday < maxAllowed;
      },

      incrementGenerations: () => {
        const state = get();
        
        if (isNewDay(state.lastGenerationDate)) {
          set({
            generationsToday: 1,
            watchedAdsToday: 0,
            lastGenerationDate: new Date().toISOString(),
          });
        } else {
          set({
            generationsToday: state.generationsToday + 1,
          });
        }
      },

      incrementAdsWatched: () => {
        const state = get();
        
        if (isNewDay(state.lastGenerationDate)) {
          set({
            watchedAdsToday: 1,
            lastGenerationDate: new Date().toISOString(),
          });
        } else {
          set({
            watchedAdsToday: Math.min(
              state.watchedAdsToday + 1,
              MAX_ADS_PER_DAY
            ),
          });
        }
      },

      addGeneratedTopic: (topic) => {
        const state = get();
        const newTopic = {
          ...topic,
          timestamp: Date.now(),
        };
        
        set({
          generatedTopics: [newTopic, ...state.generatedTopics].slice(0, 50),
        });
      },

      getCachedResult: (hash) => {
        const state = get();
        const cached = state.cache[hash];
        
        if (!cached) return null;
        
        const age = Date.now() - cached.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        
        if (age > maxAge) {
          return null;
        }
        
        return cached.data;
      },

      setCachedResult: (hash, data) => {
        const state = get();
        set({
          cache: {
            ...state.cache,
            [hash]: {
              data,
              timestamp: Date.now(),
            },
          },
        });
      },

      cleanCache: () => {
        const state = get();
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        
        const cleanedCache = Object.entries(state.cache).reduce(
          (acc, [hash, entry]) => {
            if (now - entry.timestamp < maxAge) {
              acc[hash] = entry;
            }
            return acc;
          },
          {}
        );
        
        set({ cache: cleanedCache });
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