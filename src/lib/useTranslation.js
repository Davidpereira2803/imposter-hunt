import { useCallback } from "react";
import { useLanguageStore } from "../store/languageStore";
import i18n from "./i18n";

export function useTranslation() {
  const locale = useLanguageStore((s) => s.locale);

  const t = useCallback(
    (key, fallbackOrOptions, options) => {
      // If second param is string, it's fallback; if object, it's options
      const fallback = typeof fallbackOrOptions === "string" ? fallbackOrOptions : undefined;
      const opts = typeof fallbackOrOptions === "object" ? fallbackOrOptions : options;
      
      const val = i18n.t(key, opts);
      return val === key ? (fallback ?? key) : val;
    },
    [locale]
  );

  return { t, locale };
}