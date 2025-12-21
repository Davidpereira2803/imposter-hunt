import { useCallback } from "react";
import { useLanguageStore } from "../store/languageStore";
import i18n from "./i18n";

export function useTranslation() {
  const locale = useLanguageStore((s) => s.locale);

  const t = useCallback(
    (key, fallbackOrOptions, options) => {
      const fallback = typeof fallbackOrOptions === "string" ? fallbackOrOptions : undefined;
      const opts = typeof fallbackOrOptions === "object" ? fallbackOrOptions : options;
      const finalOpts = fallback ? { ...(opts || {}), defaultValue: fallback } : opts;

      const val = i18n.t(key, finalOpts);
      const isMissing = typeof val === "string" && /^\[missing ".+?" translation\]$/.test(val);
      return isMissing ? (fallback ?? key) : val;
    },
    [locale]
  );

  return { t, locale };
}