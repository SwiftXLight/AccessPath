import type { LocalEvent, Place, ScoredEvent, ScoredPlace, UserProfile } from "./types";
import { formatPrice } from "./events";

export function buildProfileSummary(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.crowdPreference === "quiet") {
    parts.push("calm");
  } else if (profile.crowdPreference === "lively") {
    parts.push("lively");
  } else if (profile.crowdPreference === "moderate") {
    parts.push("balanced");
  }

  if (profile.maxDistanceKm <= 5) {
    parts.push("low-distance");
  } else if (profile.maxDistanceKm >= 15) {
    parts.push("wide-ranging");
  }

  if (profile.maxBudget === 0) {
    parts.push("free-only");
  } else if (profile.maxBudget <= 15) {
    parts.push("budget-friendly");
  }

  if (profile.crowdPreference === "quiet") {
    parts.push("minimal crowds");
  } else if (profile.crowdPreference === "lively") {
    parts.push("social energy");
  }

  if (profile.interests.length > 0) {
    parts.push(`${profile.interests.slice(0, 2).join(" & ")} focused`);
  }

  if (profile.socialMode === "alone") parts.push("solo-friendly");
  if (profile.socialMode === "family") parts.push("family-oriented");
  if (profile.socialMode === "meeting") parts.push("great for meeting people");

  if (profile.mobilityPreference === "wheelchair") {
    parts.push("accessibility-first");
  }

  if (parts.length === 0) {
    return "You're open to all kinds of local experiences — the city is your playground.";
  }

  const unique = [...new Set(parts)];
  return `You prefer ${unique.slice(0, 4).join(", ")} experiences.`;
}

export function buildAiSummary(
  recommendations: ScoredEvent[],
  profile: UserProfile
): string {
  if (recommendations.length === 0) {
    return "I couldn't find strong matches right now. Try adjusting your profile or widening distance and budget.";
  }

  const top = recommendations[0];
  const count = recommendations.length;

  const parts: string[] = [
    `Based on your profile, I found ${count} strong ${count === 1 ? "match" : "matches"} for you today.`,
  ];

  if (profile.interests.length > 0) {
    parts.push(
      `Prioritizing your interest in ${profile.interests.slice(0, 3).join(", ")}.`
    );
  }

  parts.push(
    `My top pick is **${top.event.title}** (${top.score}% match) — ${top.explanation.toLowerCase()}`
  );

  return parts.join(" ");
}

export function buildEventRecommendation(scored: ScoredEvent): string {
  return scored.explanation;
}

export function buildWhatToExpect(event: LocalEvent): string {
  const crowd = {
    low: "a relaxed, intimate atmosphere with plenty of space",
    medium: "a comfortable buzz without feeling overwhelming",
    high: "an energetic crowd and lively social energy",
  }[event.crowdLevel];

  return `Expect ${crowd}. ${event.description.split(".")[0]}. Plan for ${event.startTime}–${event.endTime} at ${event.location}.`;
}

export function buildWhoIsBestFor(event: LocalEvent): string {
  const modes = event.socialModes.map((m) => {
    if (m === "meeting") return "people looking to connect";
    if (m === "alone") return "solo explorers";
    return `${m} outings`;
  });

  const interestHint =
    event.interests.length > 0
      ? ` especially if you enjoy ${event.interests.slice(0, 2).join(" or ")}`
      : "";

  return `Best for ${modes.join(", ")}${interestHint}. ${formatPrice(event.price)} entry makes it ${event.price <= 10 ? "accessible for most budgets" : "a worthwhile splurge"}.`;
}

export function buildPlaceRecommendation(scored: ScoredPlace): string {
  return scored.explanation;
}

export function buildWhatToExpectAtPlace(place: Place): string {
  const crowd = {
    low: "a relaxed, uncrowded atmosphere you can enjoy at your own pace",
    medium: "a comfortable level of activity without feeling overwhelming",
    high: "a lively, social environment with plenty of energy",
  }[place.typicalCrowd];

  return `Expect ${crowd}. ${place.description.split(".")[0]}. Open ${place.openingHours.toLowerCase()} at ${place.location} — visit whenever suits you.`;
}

export function buildWhoIsPlaceBestFor(place: Place): string {
  const modes = place.socialModes.map((m) => {
    if (m === "meeting") return "people looking to connect";
    if (m === "alone") return "solo explorers";
    return `${m} outings`;
  });

  const interestHint =
    place.interests.length > 0
      ? ` especially if you enjoy ${place.interests.slice(0, 2).join(" or ")}`
      : "";

  const feeHint =
    place.entryFee === 0
      ? "Free entry makes it easy to drop by anytime."
      : `${formatPrice(place.entryFee)} entry is ${place.entryFee <= 10 ? "accessible for most budgets" : "a worthwhile visit"}.`;

  return `Best for ${modes.join(", ")}${interestHint}. ${feeHint}`;
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
  profile: UserProfile
): { intro: string; picks: ConciergePick[] } {
  const timeHints = ["today", "tonight", "this morning", "this weekend", "now", "anytime", "always"];
  const isTodayQuery = timeHints.some((h) => query.toLowerCase().includes(h));

  const intro = isTodayQuery
    ? `Here's what I'd suggest for ${profile.displayName || "you"} — events and places you can visit anytime:`
    : `Based on "${query.trim() || "your preferences"}", here are my top picks:`;

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
