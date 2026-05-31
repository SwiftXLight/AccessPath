"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getTranslations } from "@/lib/i18n";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
  type Translations,
} from "@/lib/i18n/types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function loadLocale(): Locale {
  if (typeof window === "undefined") return "pl";
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === "en" || saved === "pl") return saved;
  } catch {
    /* ignore */
  }
  return "pl";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pl");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(loadLocale());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
  }, [locale, mounted]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const t = useMemo(() => getTranslations(locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { t, locale, setLocale } = useLocale();
  return { t, locale, setLocale };
}
