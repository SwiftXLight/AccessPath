"use client";

import { LinkButton } from "@/components/link-button";
import { EventCard } from "@/components/event-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/context/locale";
import { useUserPreferences } from "@/context/user-preferences";
import {
  calculateMatchScore,
  formatCrowdLevel,
  formatDate,
  formatPrice,
  getSimilarEvents,
} from "@/lib/events";
import { getCategoryTagLabel, interpolate } from "@/lib/i18n/types";
import {
  buildEventRecommendation,
  buildWhatToExpect,
  buildWhoIsBestFor,
  getCategoryGradient,
} from "@/lib/recommendations";
import type { LocalEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventDetailViewProps {
  event: LocalEvent;
}

export function EventDetailView({ event }: EventDetailViewProps) {
  const { profile } = useUserPreferences();
  const { t, locale } = useTranslation();
  const scored = calculateMatchScore(profile, event, t);
  const similar = getSimilarEvents(event, profile, 3, t);
  const gradient = getCategoryGradient(event.categoryTag);

  const addressDisplay =
    profile.searchLocation.address === "City Center"
      ? t.common.cityCenter
      : profile.searchLocation.address;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <LinkButton variant="ghost" size="sm" href="/explore" className="mb-6">
        {t.common.backToRecommendations}
      </LinkButton>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div
          className={cn(
            "relative flex h-44 items-center justify-center bg-gradient-to-br",
            gradient
          )}
        >
          <span className="text-6xl drop-shadow-md" aria-hidden>
            {event.emoji}
          </span>
          <Badge
            className={cn(
              "absolute right-4 top-4 shadow-sm",
              scored.score >= 70
                ? "bg-green-600"
                : scored.score >= 45
                  ? "bg-amber-500 text-black"
                  : "bg-red-500"
            )}
          >
            {interpolate(t.detail.matchForYou, { score: scored.score })}
          </Badge>
        </div>

        <div className="px-6 py-6">
          <Badge className="mb-2">
            {getCategoryTagLabel(event.categoryTag, t, event.category)}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="mt-1 text-muted-foreground">{event.organizer}</p>
        </div>

        <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.when}</p>
            <p className="font-medium">
              {formatDate(event.date, locale)} · {event.startTime}–{event.endTime}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.where}</p>
            <p className="font-medium">{event.location}</p>
            <p className="text-sm text-muted-foreground">
              {interpolate(t.detail.kmFrom, {
                distance: scored.distanceKm,
                address: addressDisplay,
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.price}</p>
            <p className="font-medium">{formatPrice(event.price, t)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.crowdLevel}</p>
            <p className="font-medium">{formatCrowdLevel(event.crowdLevel, t)}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4 p-6">
          <h2 className="font-semibold">{t.detail.aboutEvent}</h2>
          <p className="leading-relaxed text-muted-foreground">{event.description}</p>
          <div className="flex flex-wrap gap-2">
            {event.interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="capitalize">
                {t.options.interests[interest as keyof typeof t.options.interests] ?? interest}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 p-6">
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span aria-hidden>🤖</span>
                {t.detail.whyRecommended}
              </CardTitle>
              <CardDescription>
                {interpolate(t.detail.basedOnProfile, { name: profile.displayName })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{buildEventRecommendation(scored)}</p>
              {scored.reasons.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {scored.reasons.slice(0, 4).map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t.detail.whatToExpect}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {buildWhatToExpect(event, t)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t.detail.whoBestFor}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {buildWhoIsBestFor(event, t, locale)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {event.socialModes.map((mode) => (
                  <Badge key={mode} variant="outline" className="capitalize">
                    {mode === "meeting"
                      ? t.detail.meetPeople
                      : t.options.socialMode[mode]}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {similar.length > 0 && (
          <>
            <Separator />
            <div className="p-6">
              <h2 className="mb-4 font-semibold">{t.detail.similarEvents}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s) => (
                  <EventCard key={s.event.id} scored={s} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
