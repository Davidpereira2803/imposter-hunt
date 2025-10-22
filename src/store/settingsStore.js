import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useSettingsStore = create(
  persist(
    (set) => ({
      // ...existing settings...
      soundEnabled: true,
      soundVolume: 1.0,
      musicEnabled: true,
      musicVolume: 0.7,

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setMusicVolume: (volume) => set({ musicVolume: volume }),
    }),
    {
      name: "imposter-hunt-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);