import { en } from "./en";
import { pl } from "./pl";
import type { Locale, Translations } from "./types";

const translations: Record<Locale, Translations> = { en, pl };

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? en;
}

export { getCategoryTagLabel, interpolate } from "./types";
export { en, pl };
export type { Locale, Translations };
