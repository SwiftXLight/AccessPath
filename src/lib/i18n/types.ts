import type { en } from "./en";

export type Locale = "en" | "pl";

export interface LocalizedText {
  en: string;
  pl: string;
}

export type Translations = typeof en;

export function getLocalizedText(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}

export function getLocalizedSearchText(text: LocalizedText): string {
  return `${text.en} ${text.pl}`;
}

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "pl", label: "PL" },
];

export const LOCALE_STORAGE_KEY = "accesspath-locale";

export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? "")
  );
}

export function getCategoryTagLabel(
  tag: string,
  t: Translations,
  fallback?: string
): string {
  const labels = t.options.categoryTags;
  return labels[tag as keyof typeof labels] ?? fallback ?? tag;
}
