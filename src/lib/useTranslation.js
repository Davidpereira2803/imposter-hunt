import { useCallback } from "react";
import { useLanguageStore } from "../store/languageStore";
import i18n from "./i18n";

export function useTranslation() {
  const locale = useLanguageStore((s) => s.locale);

  const t = useCallback(
    (key, fallback) => {
      const val = i18n.t(key);
      return val === key ? (fallback ?? key) : val;
    },
    [locale]
  );

  return { t, locale };
}