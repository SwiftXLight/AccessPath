"use client";

import { cn } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n/types";
import { useTranslation } from "@/context/locale";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className={cn(
        "flex items-center rounded-lg border bg-card p-0.5 shadow-sm",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ value, label }) => {
        const active = locale === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
