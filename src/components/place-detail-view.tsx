"use client";

import { LinkButton } from "@/components/link-button";
import { PlaceCard } from "@/components/place-card";
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
  calculatePlaceMatchScore,
  formatCrowdLevel,
  formatPrice,
  getSimilarPlaces,
} from "@/lib/places";
import {
  buildPlaceRecommendation,
  buildWhatToExpectAtPlace,
  buildWhoIsPlaceBestFor,
  getCategoryGradient,
} from "@/lib/recommendations";
import { PLACE_TYPE_LABELS, type Place } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlaceDetailViewProps {
  place: Place;
}

export function PlaceDetailView({ place }: PlaceDetailViewProps) {
  const { profile } = useUserPreferences();
  const scored = calculatePlaceMatchScore(profile, place);
  const similar = getSimilarPlaces(place, profile, 3);
  const gradient = getCategoryGradient(place.categoryTag);

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
            {place.emoji}
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
          <Badge
            variant="secondary"
            className="absolute left-4 top-4 bg-background/90 shadow-sm"
          >
            Always available
          </Badge>
        </div>

        <div className="px-6 py-6">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>{PLACE_TYPE_LABELS[place.placeType]}</Badge>
            <Badge variant="outline">{place.category}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{place.title}</h1>
          <p className="mt-1 text-muted-foreground">{place.managedBy}</p>
        </div>

        <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Hours</p>
            <p className="font-medium">{place.openingHours}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Where</p>
            <p className="font-medium">{place.location}</p>
            <p className="text-sm text-muted-foreground">
              {scored.distanceKm} km from {profile.searchLocation.address}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Entry</p>
            <p className="font-medium">{formatPrice(place.entryFee)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Typical crowd</p>
            <p className="font-medium">{formatCrowdLevel(place.typicalCrowd)}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4 p-6">
          <h2 className="font-semibold">About this place</h2>
          <p className="leading-relaxed text-muted-foreground">{place.description}</p>
          <div className="flex flex-wrap gap-2">
            {place.interests.map((interest) => (
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
                {buildPlaceRecommendation(scored)}
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
                {buildWhatToExpectAtPlace(place)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Who this is best for</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {buildWhoIsPlaceBestFor(place)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {place.socialModes.map((mode) => (
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
              <h2 className="mb-4 font-semibold">Similar places</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s) => (
                  <PlaceCard key={s.place.id} scored={s} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
