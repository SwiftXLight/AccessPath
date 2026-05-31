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
import { getLocalizedText } from "@/lib/i18n/types";
import { buildAiSummary } from "@/lib/recommendations";
import type { ScoredEvent, UserProfile } from "@/lib/types";

interface AiRecommendationPanelProps {
  recommendations: ScoredEvent[];
  profile: UserProfile;
}

export function AiRecommendationPanel({
  recommendations,
  profile,
}: AiRecommendationPanelProps) {
  const { t, locale } = useTranslation();
  const summary = buildAiSummary(recommendations, profile, t, locale);

  return (
    <Card className="rounded-2xl border-primary/20 border-border/80 bg-gradient-to-br from-primary/5 via-card to-secondary/20 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🤖
          </span>
          <div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <CardDescription>Simulated · powered by your profile</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary.split("**").map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-medium text-foreground">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>

        {recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map(({ event, score, explanation, distanceKm }, index) => (
              <li
                key={event.id}
                className="rounded-lg border bg-background/80 p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span aria-hidden>{event.emoji}</span>
                      <span className="truncate font-medium">
                        {getLocalizedText(event.title, locale)}
                      </span>
                      {index === 0 && <Badge>Top pick</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {explanation}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      score >= 70
                        ? "bg-green-100 text-green-800"
                        : score >= 45
                          ? "bg-amber-100 text-amber-800"
                          : ""
                    }
                  >
                    {score}%
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(event.price)} · {distanceKm} km
                  </span>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Adjust your profile to get personalized picks
          </p>
        )}
      </CardContent>
    </Card>
  );
}
