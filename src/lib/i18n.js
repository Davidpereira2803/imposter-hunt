import { I18n } from "i18n-js";
import * as Localization from "expo-localization";

import en from "../locales/en.json";
import pt from "../locales/pt.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import lu from "../locales/lu.json";
import it from "../locales/it.json";
import es from "../locales/es.json";

const translations = { en, pt, fr, de, lu, it, es };

const resolveLocale = () => {
  try {
    const raw = Localization?.locale ?? "en";
    const code = String(raw).toLowerCase().split("-")[0];
    return translations[code] ? code : "en";
  } catch {
    return "en";
  }
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = resolveLocale();

export default i18n;