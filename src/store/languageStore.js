import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../lib/i18n";

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (newLocale) => {
        if (i18n?.translations?.[newLocale]) {
          i18n.locale = newLocale;
          set({ locale: newLocale });
        }
      },
    }),
    {
      name: "imposter-hunt-language",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale && i18n?.translations?.[state.locale]) {
          i18n.locale = state.locale;
        }
      },
    }
  )
);