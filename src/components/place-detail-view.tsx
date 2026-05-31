"use client";

import { LinkButton } from "@/components/link-button";
import { PlaceCard } from "@/components/place-card";
import { SourceCommentsSection } from "@/components/source-comments-section";
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
  calculatePlaceMatchScore,
  formatCrowdLevel,
  formatPrice,
  getSimilarPlaces,
} from "@/lib/places";
import { getCategoryTagLabel, getLocalizedText, interpolate } from "@/lib/i18n/types";
import {
  buildPlaceRecommendation,
  buildWhatToExpectAtPlace,
  buildWhoIsPlaceBestFor,
  getCategoryGradient,
} from "@/lib/recommendations";
import type { Place, PlaceType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlaceDetailViewProps {
  place: Place;
}

export function PlaceDetailView({ place }: PlaceDetailViewProps) {
  const { profile } = useUserPreferences();
  const { t, locale } = useTranslation();
  const scored = calculatePlaceMatchScore(profile, place, t);
  const similar = getSimilarPlaces(place, profile, 3, t);
  const gradient = getCategoryGradient(place.categoryTag);

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
            {interpolate(t.detail.matchForYou, { score: scored.score })}
          </Badge>
          <Badge
            variant="secondary"
            className="absolute left-4 top-4 bg-background/90 shadow-sm"
          >
            {t.common.alwaysAvailable}
          </Badge>
        </div>

        <div className="px-6 py-6">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>{t.options.placeType[place.placeType as PlaceType]}</Badge>
            <Badge variant="outline">
              {getCategoryTagLabel(place.categoryTag, t, place.category)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getLocalizedText(place.title, locale)}
          </h1>
          <p className="mt-1 text-muted-foreground">{place.managedBy}</p>
        </div>

        <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.hours}</p>
            <p className="font-medium">{place.openingHours}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.where}</p>
            <p className="font-medium">{place.location}</p>
            <p className="text-sm text-muted-foreground">
              {interpolate(t.detail.kmFrom, {
                distance: scored.distanceKm,
                address: addressDisplay,
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.entry}</p>
            <p className="font-medium">{formatPrice(place.entryFee, t)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t.detail.typicalCrowd}</p>
            <p className="font-medium">{formatCrowdLevel(place.typicalCrowd, t)}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4 p-6">
          <h2 className="font-semibold">{t.detail.aboutPlace}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {getLocalizedText(place.description, locale)}
          </p>
          <div className="flex flex-wrap gap-2">
            {place.interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="capitalize">
                {t.options.interests[interest as keyof typeof t.options.interests] ?? interest}
              </Badge>
            ))}
          </div>
        </div>

        {place.sourceComments.length > 0 && (
          <>
            <Separator />
            <SourceCommentsSection comments={place.sourceComments} />
          </>
        )}

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
              <p className="text-sm leading-relaxed">{buildPlaceRecommendation(scored)}</p>
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
                {buildWhatToExpectAtPlace(place, t, locale)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t.detail.whoBestFor}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {buildWhoIsPlaceBestFor(place, t, locale)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {place.socialModes.map((mode) => (
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
              <h2 className="mb-4 font-semibold">{t.detail.similarPlaces}</h2>
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
