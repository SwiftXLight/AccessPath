"use client";

import { Header } from "@/components/header";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/context/locale";
import { Compass, MapPin, Sparkles } from "lucide-react";

const featureIcons = [Compass, Sparkles, MapPin];

export function HomePageContent() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-white to-secondary/60">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(199_89%_48%/0.08),transparent_50%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Badge
              variant="secondary"
              className="mb-4 border-primary/20 bg-primary/10 text-primary"
            >
              {t.landing.badge}
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t.landing.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t.landing.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LinkButton size="lg" href="/profile" className="shadow-sm">
                {t.landing.buildProfile}
              </LinkButton>
              <LinkButton size="lg" variant="outline" href="/explore">
                {t.landing.startExploring}
              </LinkButton>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {t.landing.audiences.map((audience) => (
                <Badge
                  key={audience}
                  variant="outline"
                  className="border-border bg-card/80"
                >
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight">{t.landing.whyTitle}</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              {t.landing.whyDescription}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {t.landing.features.map(({ title, description }, index) => {
              const Icon = featureIcons[index];
              return (
                <Card
                  key={title}
                  className="rounded-2xl border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="border-t bg-card/60">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight">{t.landing.ctaTitle}</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              {t.landing.ctaDescription}
            </p>
            <LinkButton className="mt-6 shadow-sm" size="lg" href="/explore">
              {t.landing.startExploring}
            </LinkButton>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-card py-6 text-center text-sm text-muted-foreground">
        {t.common.footer}
      </footer>
    </>
  );
}
