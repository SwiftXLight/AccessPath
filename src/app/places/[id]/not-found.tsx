"use client";

import { Header } from "@/components/header";
import { LinkButton } from "@/components/link-button";
import { useTranslation } from "@/context/locale";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="text-5xl" aria-hidden>
          🗺️
        </span>
        <h1 className="mt-4 text-2xl font-bold">{t.detail.placeNotFound}</h1>
        <p className="mt-2 text-muted-foreground">{t.detail.placeNotFoundDesc}</p>
        <LinkButton className="mt-6" href="/explore">
          {t.detail.browsePlaces}
        </LinkButton>
      </main>
    </>
  );
}
