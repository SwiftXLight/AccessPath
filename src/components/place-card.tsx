"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/context/locale";
import { formatPrice } from "@/lib/events";
import { interpolate } from "@/lib/i18n/types";
import { getCategoryGradient } from "@/lib/recommendations";
import type { PlaceType, ScoredPlace } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlaceCardProps {
  scored: ScoredPlace;
  highlight?: boolean;
}

export function PlaceCard({ scored, highlight }: PlaceCardProps) {
  const { t } = useTranslation();
  const { place, score, explanation, distanceKm } = scored;
  const gradient = getCategoryGradient(place.categoryTag);

  return (
    <Link href={`/places/${place.id}`} className="block h-full">
      <Card
        className={cn(
          "h-full overflow-hidden transition-shadow hover:shadow-md",
          highlight && "border-primary/40 ring-1 ring-primary/20"
        )}
      >
        <div
          className={cn(
            "relative flex h-32 items-center justify-center bg-gradient-to-br",
            gradient
          )}
        >
          <span className="text-5xl drop-shadow-sm" aria-hidden>
            {place.emoji}
          </span>
          <Badge
            className={cn(
              "absolute right-3 top-3 shadow-sm",
              score >= 70
                ? "bg-green-600"
                : score >= 45
                  ? "bg-amber-500 text-black"
                  : "bg-red-500"
            )}
          >
            {interpolate(t.cards.matchPercent, { score })}
          </Badge>
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/90 shadow-sm"
          >
            {t.cards.placeBadge}
          </Badge>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {t.options.placeType[place.placeType as PlaceType]}
            </Badge>
            {highlight && <Badge>{t.common.topPick}</Badge>}
          </div>
          <CardTitle className="line-clamp-2 text-lg">{place.title}</CardTitle>
          <CardDescription className="line-clamp-2">{place.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{t.common.alwaysOpen}</span>
            <span>·</span>
            <span>{place.openingHours}</span>
            <span>·</span>
            <span>
              {distanceKm} {t.common.km}
            </span>
            <span>·</span>
            <span className="font-medium text-foreground">
              {formatPrice(place.entryFee, t)}
            </span>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-primary">{t.cards.whyMatches}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{explanation}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
