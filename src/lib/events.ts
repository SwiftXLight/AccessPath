import eventsData from "@/data/events.json";
import { haversineKm } from "@/lib/location";
import type {
  AccessibilityNeed,
  CrowdLevel,
  CrowdPreference,
  LocalEvent,
  MobilityPreference,
  ScoredEvent,
  UserProfile,
} from "./types";
import { ACCESSIBILITY_NEED_EVENT_TAGS, MAP_BOUNDS } from "./types";

export const events: LocalEvent[] = eventsData as LocalEvent[];

export function getEventById(id: string): LocalEvent | undefined {
  return events.find((event) => event.id === id);
}

export function getDistanceKm(profile: UserProfile, event: LocalEvent): number {
  const distance = haversineKm(
    profile.searchLocation.lat,
    profile.searchLocation.lng,
    event.lat,
    event.lng
  );
  return Math.round(distance * 10) / 10;
}

function crowdMatchScore(
  preference: CrowdPreference,
  level: CrowdLevel
): { points: number; reason?: string } {
  if (preference === "any") {
    return { points: 8 };
  }

  const matrix: Record<CrowdPreference, Record<CrowdLevel, number>> = {
    quiet: { low: 15, medium: 5, high: -15 },
    moderate: { low: 10, medium: 15, high: 0 },
    lively: { low: -5, medium: 10, high: 15 },
    any: { low: 8, medium: 8, high: 8 },
  };

  const points = matrix[preference][level];
  const crowdLabels = { low: "calm", medium: "moderate", high: "lively" };

  if (points >= 10) {
    return {
      points,
      reason: `${crowdLabels[level]} crowd fits your preference for ${preference === "quiet" ? "minimal crowds" : preference === "lively" ? "energetic atmospheres" : "balanced environments"}`,
    };
  }
  if (points < 0) {
    return {
      points,
      reason: `Crowd level may feel too ${level === "high" ? "busy" : "quiet"} for you`,
    };
  }
  return { points };
}

function mobilityMatchScore(
  preference: MobilityPreference,
  accessibility: string[]
): { points: number; reason?: string } {
  if (preference === "any") return { points: 5 };

  if (preference === "wheelchair") {
    if (accessibility.includes("wheelchair")) {
      return { points: 12, reason: "Wheelchair accessible venue" };
    }
    return { points: -20, reason: "May not meet wheelchair accessibility needs" };
  }

  if (preference === "limited") {
    if (
      accessibility.some((a) =>
        ["seating", "wheelchair", "quiet-room"].includes(a)
      )
    ) {
      return { points: 10, reason: "Comfortable for limited mobility" };
    }
    if (accessibility.includes("walking")) {
      return { points: -10, reason: "Involves extended walking" };
    }
  }

  return { points: 5 };
}

function eventMeetsAccessibilityNeed(
  need: AccessibilityNeed,
  eventAccessibility: string[]
): boolean {
  const tags = ACCESSIBILITY_NEED_EVENT_TAGS[need] ?? [];
  return tags.some((tag) => eventAccessibility.includes(tag));
}

function accessibilityNeedsMatchScore(
  needs: AccessibilityNeed[],
  eventAccessibility: string[]
): { points: number; reason?: string } {
  if (needs.length === 0) return { points: 0 };

  const matched = needs.filter((need) =>
    eventMeetsAccessibilityNeed(need, eventAccessibility)
  );

  if (matched.length === 0) {
    return { points: -8, reason: "May not meet selected accessibility needs" };
  }

  const points = Math.round((matched.length / needs.length) * 18);

  if (matched.length === needs.length) {
    return {
      points,
      reason: "Meets all your selected accessibility needs",
    };
  }

  return {
    points,
    reason: `Matches ${matched.length} of ${needs.length} accessibility needs`,
  };
}

function buildMatchExplanation(
  reasons: string[],
  profile: UserProfile,
  event: LocalEvent,
  distanceKm: number
): string {
  const positives = reasons.filter((r) => !r.startsWith("Crowd level may") && !r.includes("May not meet"));
  if (positives.length === 0) {
    return "This event is outside your usual preferences, but could still be worth exploring.";
  }

  const themes: string[] = [];
  if (event.price <= profile.maxBudget && event.price <= 10) themes.push("low-cost");
  if (event.crowdLevel === "low" && profile.crowdPreference === "quiet") themes.push("low-crowd");
  if (distanceKm <= 2) themes.push("nearby");
  if (profile.interests.some((i) => event.interests.includes(i))) themes.push("interest-aligned");

  if (themes.length >= 2) {
    return `This event matches your preference for ${themes.slice(0, 2).join(" and ")} environments.`;
  }
  if (positives[0]) {
    return `${positives[0]}.`;
  }
  return "This looks like a solid match based on your profile.";
}

/** Primary match scoring — returns absolute 0–100 score */
export function calculateMatchScore(
  profile: UserProfile,
  event: LocalEvent
): ScoredEvent {
  let score = 35;
  const reasons: string[] = [];
  const distanceKm = getDistanceKm(profile, event);

  if (distanceKm <= profile.maxDistanceKm) {
    const bonus = Math.round(25 * (1 - distanceKm / profile.maxDistanceKm));
    score += bonus;
    if (distanceKm <= 2) {
      reasons.push(`Only ${distanceKm} km away — easy to reach`);
    } else {
      reasons.push(`Within your ${profile.maxDistanceKm} km comfort zone`);
    }
  } else {
    score -= 30;
    reasons.push(`Beyond your preferred ${profile.maxDistanceKm} km radius`);
  }

  if (event.price <= profile.maxBudget) {
    score += event.price === 0 ? 18 : 12;
    if (event.price === 0) {
      reasons.push("Free entry fits your budget perfectly");
    } else {
      reasons.push(`Price (${formatPrice(event.price)}) stays within budget`);
    }
  } else {
    score -= 22;
    reasons.push(`Above your $${profile.maxBudget} budget`);
  }

  const matchingInterests = event.interests.filter((i) =>
    profile.interests.includes(i)
  );
  if (profile.interests.length === 0) {
    score += 8;
  } else if (matchingInterests.length > 0) {
    score += Math.min(matchingInterests.length * 12, 24);
    reasons.push(`Matches your interests: ${matchingInterests.join(", ")}`);
  } else {
    score -= 12;
  }

  const crowd = crowdMatchScore(profile.crowdPreference, event.crowdLevel);
  score += crowd.points;
  if (crowd.reason) reasons.push(crowd.reason);

  if (profile.socialMode === "any" || event.socialModes.includes(profile.socialMode)) {
    score += 10;
    if (profile.socialMode !== "any") {
      const label =
        profile.socialMode === "meeting" ? "meeting new people" : profile.socialMode;
      reasons.push(`Well suited for going ${label}`);
    }
  } else {
    score -= 12;
  }

  const mobility = mobilityMatchScore(profile.mobilityPreference, event.accessibility);
  score += mobility.points;
  if (mobility.reason) reasons.push(mobility.reason);

  const accessibility = accessibilityNeedsMatchScore(
    profile.accessibilityNeeds,
    event.accessibility
  );
  score += accessibility.points;
  if (accessibility.reason) reasons.push(accessibility.reason);

  if (
    profile.timeOfDay.length === 0 ||
    profile.timeOfDay.includes(event.timeOfDay)
  ) {
    score += 8;
    if (profile.timeOfDay.length > 0) {
      reasons.push(`Fits your ${event.timeOfDay} schedule`);
    }
  } else {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const explanation = buildMatchExplanation(reasons, profile, event, distanceKm);

  return { event, score, reasons, explanation, distanceKm };
}

export function scoreEvent(
  event: LocalEvent,
  profile: UserProfile
): ScoredEvent {
  return calculateMatchScore(profile, event);
}

export function getMatchTier(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export function getMatchColor(score: number): string {
  const tier = getMatchTier(score);
  if (tier === "high") return "bg-green-500";
  if (tier === "medium") return "bg-amber-400";
  return "bg-red-400";
}

export function getRecommendedEvents(
  profile: UserProfile,
  limit = 5
): ScoredEvent[] {
  return events
    .map((event) => calculateMatchScore(profile, event))
    .filter(({ score }) => score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getFilteredEvents(profile: UserProfile): ScoredEvent[] {
  return events
    .map((event) => calculateMatchScore(profile, event))
    .filter(({ event, score, distanceKm }) => {
      if (score < 25) return false;
      if (distanceKm > profile.maxDistanceKm) return false;
      if (event.price > profile.maxBudget) return false;
      if (
        profile.timeOfDay.length > 0 &&
        !profile.timeOfDay.includes(event.timeOfDay)
      ) {
        return false;
      }
      if (
        profile.interests.length > 0 &&
        !event.interests.some((i) => profile.interests.includes(i))
      ) {
        return false;
      }
      if (
        profile.socialMode !== "any" &&
        !event.socialModes.includes(profile.socialMode)
      ) {
        return false;
      }
      if (
        profile.accessibilityNeeds.length > 0 &&
        !profile.accessibilityNeeds.every((need) =>
          eventMeetsAccessibilityNeed(need, event.accessibility)
        )
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

export function getSimilarEvents(
  event: LocalEvent,
  profile: UserProfile,
  limit = 3
): ScoredEvent[] {
  return events
    .filter((e) => e.id !== event.id)
    .map((e) => {
      const scored = calculateMatchScore(profile, e);
      let bonus = 0;
      if (e.categoryTag === event.categoryTag) bonus += 15;
      if (e.interests.some((i) => event.interests.includes(i))) bonus += 10;
      if (Math.abs(scored.distanceKm - getDistanceKm(profile, event)) <= 2) bonus += 5;
      return { ...scored, score: Math.min(100, scored.score + bonus) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function latLngToPercent(lat: number, lng: number): { x: number; y: number } {
  const x =
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y =
    ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)) };
}

export function formatPrice(price: number): string {
  return price === 0 ? "Free" : `$${price}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatCrowdLevel(level: CrowdLevel): string {
  return { low: "Calm", medium: "Moderate", high: "Lively" }[level];
}
