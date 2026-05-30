"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserPreferences } from "@/context/user-preferences";
import { getRecommendedEvents } from "@/lib/events";
import { getRecommendedPlaces } from "@/lib/places";
import { buildConciergeResponse } from "@/lib/recommendations";

export function AiConcierge() {
  const { profile } = useUserPreferences();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ReturnType<
    typeof buildConciergeResponse
  > | null>(null);

  const handleAsk = () => {
    const eventRecs = getRecommendedEvents(profile, 5);
    const placeRecs = getRecommendedPlaces(profile, 5);
    setResponse(buildConciergeResponse(query, eventRecs, placeRecs, profile));
  };

  return (
    <Card className="rounded-2xl border-primary/20 border-border/80 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span aria-hidden>✨</span>
          AI Concierge
        </CardTitle>
        <CardDescription>Ask what you can do today — events or places anytime</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="What can I do today?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <Button onClick={handleAsk}>Ask</Button>
        </div>

        {response && (
          <div className="space-y-3 rounded-lg bg-muted/40 p-4">
            <p className="text-sm font-medium">{response.intro}</p>
            <ul className="space-y-3">
              {response.picks.map((pick) => (
                <li
                  key={`${pick.kind}-${pick.title}`}
                  className="rounded-lg border bg-background p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={pick.href}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {pick.title}
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {pick.kind}
                      </Badge>
                      <Badge variant="secondary">{pick.score}% match</Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pick.explanation}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              href="/explore"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              See all recommendations →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
