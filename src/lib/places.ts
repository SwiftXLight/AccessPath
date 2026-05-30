import placesData from "@/data/places.json";
import {
  formatPrice,
  getMatchColor,
  getMatchTier,
  latLngToPercent,
} from "@/lib/events";
import { haversineKm } from "@/lib/location";
import type {
  AccessibilityNeed,
  CrowdLevel,
  CrowdPreference,
  MapMarker,
  MobilityPreference,
  Place,
  ScoredPlace,
  UserProfile,
} from "./types";
import { ACCESSIBILITY_NEED_EVENT_TAGS } from "./types";

export { formatPrice, getMatchColor, getMatchTier, latLngToPercent };

export const places: Place[] = placesData as Place[];

export function getPlaceById(id: string): Place | undefined {
  return places.find((place) => place.id === id);
}

export function getDistanceKm(profile: UserProfile, place: Place): number {
  const distance = haversineKm(
    profile.searchLocation.lat,
    profile.searchLocation.lng,
    place.lat,
    place.lng
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
      reason: `${crowdLabels[level]} atmosphere fits your preference for ${preference === "quiet" ? "minimal crowds" : preference === "lively" ? "energetic spaces" : "balanced environments"}`,
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
      return { points: 12, reason: "Wheelchair accessible" };
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

function placeMeetsAccessibilityNeed(
  need: AccessibilityNeed,
  placeAccessibility: string[]
): boolean {
  const tags = ACCESSIBILITY_NEED_EVENT_TAGS[need] ?? [];
  return tags.some((tag) => placeAccessibility.includes(tag));
}

function accessibilityNeedsMatchScore(
  needs: AccessibilityNeed[],
  placeAccessibility: string[]
): { points: number; reason?: string } {
  if (needs.length === 0) return { points: 0 };

  const matched = needs.filter((need) =>
    placeMeetsAccessibilityNeed(need, placeAccessibility)
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildMatchExplanation(
  reasons: string[],
  profile: UserProfile,
  place: Place,
  distanceKm: number
): string {
  const highlights: string[] = [];

  if (distanceKm <= 1) {
    highlights.push(`just ${distanceKm} km away`);
  } else if (distanceKm <= 2) {
    highlights.push(`only ${distanceKm} km from you`);
  } else if (distanceKm <= profile.maxDistanceKm) {
    highlights.push(`${distanceKm} km away — comfortably within your range`);
  }

  if (place.entryFee === 0) {
    highlights.push("free to visit anytime");
  } else if (place.entryFee <= Math.max(1, profile.maxBudget * 0.5)) {
    highlights.push(`budget-friendly at $${place.entryFee}`);
  } else if (place.entryFee <= profile.maxBudget) {
    highlights.push(`$${place.entryFee} stays within your budget`);
  }

  const matchingInterests = place.interests.filter((i) =>
    profile.interests.includes(i)
  );
  if (matchingInterests.length > 0) {
    highlights.push(
      `aligns with your interest in ${matchingInterests.slice(0, 2).join(" & ")}`
    );
  }

  if (profile.crowdPreference === "quiet" && place.typicalCrowd === "low") {
    highlights.push("calm low-crowd atmosphere");
  } else if (profile.crowdPreference === "lively" && place.typicalCrowd === "high") {
    highlights.push("lively energetic vibe you enjoy");
  }

  if (
    profile.mobilityPreference === "wheelchair" &&
    place.accessibility.includes("wheelchair")
  ) {
    highlights.push("fully wheelchair accessible");
  } else if (
    profile.mobilityPreference === "limited" &&
    place.accessibility.some((a) => ["seating", "wheelchair"].includes(a))
  ) {
    highlights.push("well-suited for limited mobility");
  }

  highlights.push("open whenever you want to go");

  if (highlights.length <= 1) {
    const positives = reasons.filter(
      (r) =>
        !r.startsWith("Crowd level may") &&
        !r.includes("May not meet") &&
        !r.includes("Beyond")
    );
    if (positives.length > 0) return `${positives[0]}.`;
    return "A place worth discovering — always there when you need a break from the schedule.";
  }

  if (highlights.length === 2) {
    return `${capitalize(highlights[0])} and ${highlights[1]} — a strong match for your profile.`;
  }

  const [first, second, ...rest] = highlights;
  if (rest.length === 0) {
    return `${capitalize(first)} and ${second} — a strong match for your profile.`;
  }
  return `${capitalize(first)}, ${second}, and ${rest[0]} — exactly what you're looking for.`;
}

export function calculatePlaceMatchScore(
  profile: UserProfile,
  place: Place
): ScoredPlace {
  let score = 38;
  const reasons: string[] = [];
  const distanceKm = getDistanceKm(profile, place);

  if (distanceKm <= profile.maxDistanceKm) {
    const bonus = Math.round(25 * (1 - distanceKm / profile.maxDistanceKm));
    score += bonus;
    if (distanceKm <= 2) {
      reasons.push(`Only ${distanceKm} km away — easy to reach anytime`);
    } else {
      reasons.push(`Within your ${profile.maxDistanceKm} km comfort zone`);
    }
  } else {
    score -= 30;
    reasons.push(`Beyond your preferred ${profile.maxDistanceKm} km radius`);
  }

  if (place.entryFee <= profile.maxBudget) {
    score += place.entryFee === 0 ? 18 : 12;
    if (place.entryFee === 0) {
      reasons.push("Free to visit — no ticket needed");
    } else {
      reasons.push(`Entry (${formatPrice(place.entryFee)}) stays within budget`);
    }
  } else {
    score -= 22;
    reasons.push(`Entry fee above your $${profile.maxBudget} budget`);
  }

  const matchingInterests = place.interests.filter((i) =>
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

  const crowd = crowdMatchScore(profile.crowdPreference, place.typicalCrowd);
  score += crowd.points;
  if (crowd.reason) reasons.push(crowd.reason);

  if (profile.socialMode === "any" || place.socialModes.includes(profile.socialMode)) {
    score += 10;
    if (profile.socialMode !== "any") {
      const label =
        profile.socialMode === "meeting" ? "meeting new people" : profile.socialMode;
      reasons.push(`Well suited for going ${label}`);
    }
  } else {
    score -= 12;
  }

  const mobility = mobilityMatchScore(profile.mobilityPreference, place.accessibility);
  score += mobility.points;
  if (mobility.reason) reasons.push(mobility.reason);

  const accessibility = accessibilityNeedsMatchScore(
    profile.accessibilityNeeds,
    place.accessibility
  );
  score += accessibility.points;
  if (accessibility.reason) reasons.push(accessibility.reason);

  if (profile.timeOfDay.length === 0) {
    score += 8;
  } else if (
    place.bestTimeOfDay.some((t) => profile.timeOfDay.includes(t))
  ) {
    score += 10;
    reasons.push("Best visited during your preferred time of day");
  } else {
    score -= 4;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const explanation = buildMatchExplanation(reasons, profile, place, distanceKm);

  return { place, score, reasons, explanation, distanceKm };
}

export function getRecommendedPlaces(
  profile: UserProfile,
  limit = 5
): ScoredPlace[] {
  return places
    .map((place) => calculatePlaceMatchScore(profile, place))
    .filter(({ score }) => score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getFilteredPlaces(profile: UserProfile): ScoredPlace[] {
  return places
    .map((place) => calculatePlaceMatchScore(profile, place))
    .filter(({ place, score, distanceKm }) => {
      if (score < 25) return false;
      if (distanceKm > profile.maxDistanceKm) return false;
      if (place.entryFee > profile.maxBudget) return false;
      if (
        profile.interests.length > 0 &&
        !place.interests.some((i) => profile.interests.includes(i))
      ) {
        return false;
      }
      if (
        profile.socialMode !== "any" &&
        !place.socialModes.includes(profile.socialMode)
      ) {
        return false;
      }
      if (
        profile.accessibilityNeeds.length > 0 &&
        !profile.accessibilityNeeds.every((need) =>
          placeMeetsAccessibilityNeed(need, place.accessibility)
        )
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

export function getSimilarPlaces(
  place: Place,
  profile: UserProfile,
  limit = 3
): ScoredPlace[] {
  return places
    .filter((p) => p.id !== place.id)
    .map((p) => {
      const scored = calculatePlaceMatchScore(profile, p);
      let bonus = 0;
      if (p.categoryTag === place.categoryTag) bonus += 15;
      if (p.placeType === place.placeType) bonus += 10;
      if (p.interests.some((i) => place.interests.includes(i))) bonus += 10;
      if (Math.abs(scored.distanceKm - getDistanceKm(profile, place)) <= 2) bonus += 5;
      return { ...scored, score: Math.min(100, scored.score + bonus) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function toMapMarker(scored: ScoredPlace): MapMarker {
  return {
    id: scored.place.id,
    kind: "place",
    lat: scored.place.lat,
    lng: scored.place.lng,
    score: scored.score,
    title: scored.place.title,
    emoji: scored.place.emoji,
    location: scored.place.location,
  };
}

export function formatCrowdLevel(level: CrowdLevel): string {
  return { low: "Calm", medium: "Moderate", high: "Lively" }[level];
}
