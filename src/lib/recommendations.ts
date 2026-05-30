import type { LocalEvent, ScoredEvent, UserProfile } from "./types";
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
  return `You prefer ${unique.slice(0, 4).join(", ")} events.`;
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

export function buildConciergeResponse(
  query: string,
  recommendations: ScoredEvent[],
  profile: UserProfile
): { intro: string; picks: { title: string; explanation: string; score: number }[] } {
  const timeHints = ["today", "tonight", "this morning", "this weekend", "now"];
  const isTodayQuery = timeHints.some((h) => query.toLowerCase().includes(h));

  const intro = isTodayQuery
    ? `Here's what I'd suggest for ${profile.displayName || "you"} today based on your profile:`
    : `Based on "${query.trim() || "your preferences"}", here are my top picks:`;

  const picks = recommendations.slice(0, 3).map(({ event, score, explanation }) => ({
    title: event.title,
    explanation,
    score,
  }));

  return { intro, picks };
}

export function getCategoryGradient(tag: string): string {
  const gradients: Record<string, string> = {
    music: "from-violet-400 to-purple-600",
    food: "from-orange-300 to-red-500",
    sports: "from-cyan-400 to-blue-600",
    culture: "from-rose-300 to-pink-600",
    tech: "from-blue-300 to-indigo-600",
  };
  return gradients[tag] ?? "from-slate-300 to-slate-500";
}
