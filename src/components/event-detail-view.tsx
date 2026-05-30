"use client";

import Link from "next/link";
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
import { useUserPreferences } from "@/context/user-preferences";
import {
  calculateMatchScore,
  formatCrowdLevel,
  formatDate,
  formatPrice,
  getSimilarEvents,
} from "@/lib/events";
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
  const scored = calculateMatchScore(profile, event);
  const similar = getSimilarEvents(event, profile, 3);
  const gradient = getCategoryGradient(event.categoryTag);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <LinkButton variant="ghost" size="sm" href="/explore" className="mb-6">
        ← Back to recommendations
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
            {scored.score}% match for you
          </Badge>
        </div>

        <div className="px-6 py-6">
          <Badge className="mb-2">{event.category}</Badge>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="mt-1 text-muted-foreground">{event.organizer}</p>
        </div>

        <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">When</p>
            <p className="font-medium">
              {formatDate(event.date)} · {event.startTime}–{event.endTime}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Where</p>
            <p className="font-medium">{event.location}</p>
            <p className="text-sm text-muted-foreground">
              {scored.distanceKm} km from {profile.searchLocation.address}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">{formatPrice(event.price)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Crowd level</p>
            <p className="font-medium">{formatCrowdLevel(event.crowdLevel)}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4 p-6">
          <h2 className="font-semibold">About this event</h2>
          <p className="leading-relaxed text-muted-foreground">{event.description}</p>
          <div className="flex flex-wrap gap-2">
            {event.interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="capitalize">
                {interest}
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
                Why this is recommended for you
              </CardTitle>
              <CardDescription>
                Based on {profile.displayName}&apos;s profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {buildEventRecommendation(scored)}
              </p>
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
              <CardTitle className="text-lg">What to expect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {buildWhatToExpect(event)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Who this is best for</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {buildWhoIsBestFor(event)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {event.socialModes.map((mode) => (
                  <Badge key={mode} variant="outline" className="capitalize">
                    {mode === "meeting" ? "Meet people" : mode}
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
              <h2 className="mb-4 font-semibold">Similar events</h2>
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
