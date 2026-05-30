import type { Locale } from "@/lib/i18n/types";
import type { LocalEvent, Place, ScoredEvent, ScoredPlace, UserProfile } from "./types";
import { getTranslations } from "@/lib/i18n";
import { interpolate, type Translations } from "@/lib/i18n/types";
import { formatPrice } from "./events";

export function buildProfileSummary(
  profile: UserProfile,
  t: Translations = getTranslations("en")
): string {
  const parts: string[] = [];
  const traits = t.ai.traits;

  if (profile.crowdPreference === "quiet") {
    parts.push(traits.calm);
  } else if (profile.crowdPreference === "lively") {
    parts.push(traits.lively);
  } else if (profile.crowdPreference === "moderate") {
    parts.push(traits.balanced);
  }

  if (profile.maxDistanceKm <= 5) {
    parts.push(traits.lowDistance);
  } else if (profile.maxDistanceKm >= 15) {
    parts.push(traits.wideRanging);
  }

  if (profile.maxBudget === 0) {
    parts.push(traits.freeOnly);
  } else if (profile.maxBudget <= 15) {
    parts.push(traits.budgetFriendly);
  }

  if (profile.crowdPreference === "quiet") {
    parts.push(traits.minimalCrowds);
  } else if (profile.crowdPreference === "lively") {
    parts.push(traits.socialEnergy);
  }

  if (profile.interests.length > 0) {
    const interests = profile.interests
      .slice(0, 2)
      .map((i) => t.options.interests[i as keyof typeof t.options.interests] ?? i)
      .join(" & ");
    parts.push(interpolate(traits.focused, { interests }));
  }

  if (profile.socialMode === "alone") parts.push(traits.soloFriendly);
  if (profile.socialMode === "family") parts.push(traits.familyOriented);
  if (profile.socialMode === "meeting") parts.push(traits.meetingPeople);

  if (profile.mobilityPreference === "wheelchair") {
    parts.push(traits.accessibilityFirst);
  }

  if (parts.length === 0) {
    return t.ai.profileOpen;
  }

  const unique = [...new Set(parts)];
  return interpolate(t.ai.profilePrefer, {
    traits: unique.slice(0, 4).join(", "),
  });
}

export function buildAiSummary(
  recommendations: ScoredEvent[],
  profile: UserProfile,
  t: Translations = getTranslations("en")
): string {
  if (recommendations.length === 0) {
    return t.ai.noMatches;
  }

  const top = recommendations[0];
  const count = recommendations.length;

  const parts: string[] = [
    interpolate(t.ai.summaryFound, {
      count,
      matchWord: count === 1 ? t.ai.match : t.ai.matches,
    }),
  ];

  if (profile.interests.length > 0) {
    const interests = profile.interests
      .slice(0, 3)
      .map((i) => t.options.interests[i as keyof typeof t.options.interests] ?? i)
      .join(", ");
    parts.push(interpolate(t.ai.prioritizingInterests, { interests }));
  }

  parts.push(
    interpolate(t.ai.topPick, {
      title: top.event.title,
      score: top.score,
      explanation: top.explanation.toLowerCase(),
    })
  );

  return parts.join(" ");
}

export function buildEventRecommendation(scored: ScoredEvent): string {
  return scored.explanation;
}

export function buildWhatToExpect(
  event: LocalEvent,
  t: Translations = getTranslations("en")
): string {
  const crowd = t.ai.whatToExpect[event.crowdLevel];

  return interpolate(t.ai.whatToExpectEvent, {
    crowd,
    description: event.description.split(".")[0],
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
  });
}

export function buildWhoIsBestFor(
  event: LocalEvent,
  t: Translations = getTranslations("en"),
  locale: Locale = "en"
): string {
  const w = t.ai.whoBestFor;
  const modes = event.socialModes.map((m) => {
    if (m === "meeting") return w.meeting;
    if (m === "alone") return w.alone;
    return w[m as "family" | "friends"];
  });

  const orWord = locale === "pl" ? "lub" : "or";
  const interestHint =
    event.interests.length > 0
      ? interpolate(w.interestHint, {
          interests: event.interests
            .slice(0, 2)
            .map((i) => t.options.interests[i as keyof typeof t.options.interests] ?? i)
            .join(` ${orWord} `),
        })
      : "";

  const priceHint = interpolate(w.entryHint, {
    price: formatPrice(event.price, t),
    budgetHint:
      event.price <= 10 ? w.accessibleBudget : w.worthwhileSplurge,
  });

  return interpolate(w.bestFor, {
    modes: modes.join(", "),
    interestHint,
    priceHint,
  });
}

export function buildPlaceRecommendation(scored: ScoredPlace): string {
  return scored.explanation;
}

export function buildWhatToExpectAtPlace(
  place: Place,
  t: Translations = getTranslations("en")
): string {
  const crowd = t.ai.whatToExpectPlace[place.typicalCrowd];

  return interpolate(t.ai.whatToExpectPlaceFull, {
    crowd,
    description: place.description.split(".")[0],
    hours: place.openingHours.toLowerCase(),
    location: place.location,
  });
}

export function buildWhoIsPlaceBestFor(
  place: Place,
  t: Translations = getTranslations("en"),
  locale: Locale = "en"
): string {
  const w = t.ai.whoBestFor;
  const modes = place.socialModes.map((m) => {
    if (m === "meeting") return w.meeting;
    if (m === "alone") return w.alone;
    return w[m as "family" | "friends"];
  });

  const orWord = locale === "pl" ? "lub" : "or";
  const interestHint =
    place.interests.length > 0
      ? interpolate(w.interestHint, {
          interests: place.interests
            .slice(0, 2)
            .map((i) => t.options.interests[i as keyof typeof t.options.interests] ?? i)
            .join(` ${orWord} `),
        })
      : "";

  const priceHint =
    place.entryFee === 0
      ? w.freeEntry
      : interpolate(w.entryHint, {
          price: formatPrice(place.entryFee, t),
          budgetHint:
            place.entryFee <= 10 ? w.accessibleBudget : w.worthwhileVisit,
        });

  return interpolate(w.bestFor, {
    modes: modes.join(", "),
    interestHint,
    priceHint,
  });
}

export type ConciergePick = {
  title: string;
  explanation: string;
  score: number;
  href: string;
  kind: "event" | "place";
};

export function buildConciergeResponse(
  query: string,
  recommendations: ScoredEvent[],
  placeRecommendations: ScoredPlace[],
  profile: UserProfile,
  t: Translations = getTranslations("en"),
  locale: Locale = "en"
): { intro: string; picks: ConciergePick[] } {
  const timeHints = [
    "today",
    "tonight",
    "this morning",
    "this weekend",
    "now",
    "anytime",
    "always",
    "dziś",
    "dzisiaj",
    "dziś wieczorem",
    "rano",
    "teraz",
    "w weekend",
  ];
  const isTodayQuery = timeHints.some((h) => query.toLowerCase().includes(h));

  const intro = isTodayQuery
    ? interpolate(t.ai.conciergeToday, {
        name: profile.displayName || t.common.you,
      })
    : interpolate(t.ai.conciergeQuery, {
        query: query.trim() || (locale === "pl" ? "Twoje preferencje" : "your preferences"),
      });

  const combined: ConciergePick[] = [
    ...recommendations.map(({ event, score, explanation }) => ({
      title: event.title,
      explanation,
      score,
      href: `/events/${event.id}`,
      kind: "event" as const,
    })),
    ...placeRecommendations.map(({ place, score, explanation }) => ({
      title: place.title,
      explanation,
      score,
      href: `/places/${place.id}`,
      kind: "place" as const,
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { intro, picks: combined };
}

export function getCategoryGradient(tag: string): string {
  const gradients: Record<string, string> = {
    music: "from-violet-400 to-purple-600",
    food: "from-orange-300 to-red-500",
    sports: "from-cyan-400 to-blue-600",
    culture: "from-rose-300 to-pink-600",
    tech: "from-blue-300 to-indigo-600",
    nature: "from-emerald-300 to-green-600",
    history: "from-amber-300 to-orange-600",
    family: "from-sky-300 to-blue-500",
  };
  return gradients[tag] ?? "from-slate-300 to-slate-500";
}
