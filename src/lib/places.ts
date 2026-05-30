import placesData from "@/data/places.json";
import { getTranslations } from "@/lib/i18n";
import { interpolate, type Translations } from "@/lib/i18n/types";
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
  return places.find((p) => p.id === id);
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
  level: CrowdLevel,
  t: Translations
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
  const s = t.ai.scoring;

  if (points >= 10) {
    const reason =
      level === "low" && preference === "quiet"
        ? s.calmAtmosphereQuiet
        : level === "high" && preference === "lively"
          ? s.livelyAtmosphereLively
          : s.moderateAtmosphere;
    return { points, reason: `${reason.charAt(0).toUpperCase()}${reason.slice(1)}` };
  }
  if (points < 0) {
    return {
      points,
      reason: level === "high" ? s.crowdTooBusy : s.crowdTooQuiet,
    };
  }
  return { points };
}

function mobilityMatchScore(
  preference: MobilityPreference,
  accessibility: string[],
  t: Translations
): { points: number; reason?: string } {
  const s = t.ai.scoring;
  if (preference === "any") return { points: 5 };

  if (preference === "wheelchair") {
    if (accessibility.includes("wheelchair")) {
      return { points: 12, reason: s.wheelchairAccessibleShort };
    }
    return { points: -20, reason: s.mayNotWheelchair };
  }

  if (preference === "limited") {
    if (
      accessibility.some((a) =>
        ["seating", "wheelchair", "quiet-room"].includes(a)
      )
    ) {
      return { points: 10, reason: s.comfortableLimited };
    }
    if (accessibility.includes("walking")) {
      return { points: -10, reason: s.extendedWalking };
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
  placeAccessibility: string[],
  t: Translations
): { points: number; reason?: string } {
  const s = t.ai.scoring;
  if (needs.length === 0) return { points: 0 };

  const matched = needs.filter((need) =>
    placeMeetsAccessibilityNeed(need, placeAccessibility)
  );

  if (matched.length === 0) {
    return { points: -8, reason: s.mayNotAccessibility };
  }

  const points = Math.round((matched.length / needs.length) * 18);

  if (matched.length === needs.length) {
    return { points, reason: s.meetsAllAccessibility };
  }

  return {
    points,
    reason: interpolate(s.matchesAccessibility, {
      matched: matched.length,
      total: needs.length,
    }),
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function translateInterests(interests: string[], t: Translations): string {
  return interests
    .map((i) => t.options.interests[i as keyof typeof t.options.interests] ?? i)
    .join(" & ");
}

function buildMatchExplanation(
  reasons: string[],
  profile: UserProfile,
  place: Place,
  distanceKm: number,
  t: Translations
): string {
  const e = t.ai.scoring.explanation;
  const highlights: string[] = [];

  if (distanceKm <= 1) {
    highlights.push(interpolate(e.justKmAway, { distance: distanceKm }));
  } else if (distanceKm <= 2) {
    highlights.push(interpolate(e.onlyKmFromYou, { distance: distanceKm }));
  } else if (distanceKm <= profile.maxDistanceKm) {
    highlights.push(interpolate(e.kmWithinRange, { distance: distanceKm }));
  }

  if (place.entryFee === 0) {
    highlights.push(e.freeToVisitAnytime);
  } else if (place.entryFee <= Math.max(1, profile.maxBudget * 0.5)) {
    highlights.push(interpolate(e.budgetFriendly, { price: place.entryFee }));
  } else if (place.entryFee <= profile.maxBudget) {
    highlights.push(interpolate(e.withinBudget, { price: place.entryFee }));
  }

  const matchingInterests = place.interests.filter((i) =>
    profile.interests.includes(i)
  );
  if (matchingInterests.length > 0) {
    highlights.push(
      interpolate(e.alignsInterest, {
        interests: translateInterests(matchingInterests.slice(0, 2), t),
      })
    );
  }

  if (profile.crowdPreference === "quiet" && place.typicalCrowd === "low") {
    highlights.push(e.calmAtmosphere);
  } else if (profile.crowdPreference === "lively" && place.typicalCrowd === "high") {
    highlights.push(e.livelyVibe);
  }

  if (
    profile.mobilityPreference === "wheelchair" &&
    place.accessibility.includes("wheelchair")
  ) {
    highlights.push(e.wheelchairAccessible);
  } else if (
    profile.mobilityPreference === "limited" &&
    place.accessibility.some((a) => ["seating", "wheelchair"].includes(a))
  ) {
    highlights.push(e.limitedMobility);
  }

  highlights.push(e.openAnytime);

  if (highlights.length <= 1) {
    const positives = reasons.filter(
      (r) =>
        !r.includes(t.ai.scoring.crowdTooBusy) &&
        !r.includes(t.ai.scoring.mayNotAccessibility) &&
        !r.includes(t.ai.scoring.beyondRadius.split("{")[0])
    );
    if (positives.length > 0) return `${positives[0]}.`;
    return e.placeSurprise;
  }

  if (highlights.length === 2) {
    return interpolate(e.strongMatchTwo, {
      first: capitalize(highlights[0]),
      second: highlights[1],
    });
  }

  const [first, second, ...rest] = highlights;
  if (rest.length === 0) {
    return interpolate(e.strongMatchTwo, {
      first: capitalize(first),
      second,
    });
  }
  return interpolate(e.strongMatchMany, {
    first: capitalize(first),
    second,
    third: rest[0],
  });
}

export function calculatePlaceMatchScore(
  profile: UserProfile,
  place: Place,
  t: Translations = getTranslations("en")
): ScoredPlace {
  let score = 38;
  const reasons: string[] = [];
  const distanceKm = getDistanceKm(profile, place);
  const s = t.ai.scoring;

  if (distanceKm <= profile.maxDistanceKm) {
    const bonus = Math.round(25 * (1 - distanceKm / profile.maxDistanceKm));
    score += bonus;
    if (distanceKm <= 2) {
      reasons.push(interpolate(s.onlyKmAwayAnytime, { distance: distanceKm }));
    } else {
      reasons.push(interpolate(s.withinComfortZone, { max: profile.maxDistanceKm }));
    }
  } else {
    score -= 30;
    reasons.push(interpolate(s.beyondRadius, { max: profile.maxDistanceKm }));
  }

  if (place.entryFee <= profile.maxBudget) {
    score += place.entryFee === 0 ? 18 : 12;
    if (place.entryFee === 0) {
      reasons.push(s.freeToVisit);
    } else {
      reasons.push(
        interpolate(s.entryWithinBudget, { price: formatPrice(place.entryFee, t) })
      );
    }
  } else {
    score -= 22;
    reasons.push(interpolate(s.entryAboveBudget, { max: profile.maxBudget }));
  }

  const matchingInterests = place.interests.filter((i) =>
    profile.interests.includes(i)
  );
  if (profile.interests.length === 0) {
    score += 8;
  } else if (matchingInterests.length > 0) {
    score += Math.min(matchingInterests.length * 12, 24);
    reasons.push(
      interpolate(s.matchesInterests, {
        interests: translateInterests(matchingInterests, t),
      })
    );
  } else {
    score -= 12;
  }

  const crowd = crowdMatchScore(profile.crowdPreference, place.typicalCrowd, t);
  score += crowd.points;
  if (crowd.reason) reasons.push(crowd.reason);

  if (profile.socialMode === "any" || place.socialModes.includes(profile.socialMode)) {
    score += 10;
    if (profile.socialMode !== "any") {
      const mode =
        profile.socialMode === "meeting"
          ? s.meetingNewPeople
          : t.options.socialMode[profile.socialMode].toLowerCase();
      reasons.push(interpolate(s.wellSuitedGoing, { mode }));
    }
  } else {
    score -= 12;
  }

  const mobility = mobilityMatchScore(profile.mobilityPreference, place.accessibility, t);
  score += mobility.points;
  if (mobility.reason) reasons.push(mobility.reason);

  const accessibility = accessibilityNeedsMatchScore(
    profile.accessibilityNeeds,
    place.accessibility,
    t
  );
  score += accessibility.points;
  if (accessibility.reason) reasons.push(accessibility.reason);

  if (profile.timeOfDay.length === 0) {
    score += 8;
  } else if (place.bestTimeOfDay.some((slot) => profile.timeOfDay.includes(slot))) {
    score += 10;
    reasons.push(s.bestTimeOfDay);
  } else {
    score -= 4;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const explanation = buildMatchExplanation(reasons, profile, place, distanceKm, t);

  return { place, score, reasons, explanation, distanceKm };
}

export function getRecommendedPlaces(
  profile: UserProfile,
  limit = 5,
  t?: Translations
): ScoredPlace[] {
  const translations = t ?? getTranslations("en");
  return places
    .map((place) => calculatePlaceMatchScore(profile, place, translations))
    .filter(({ score }) => score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getFilteredPlaces(
  profile: UserProfile,
  t?: Translations
): ScoredPlace[] {
  const translations = t ?? getTranslations("en");
  return places
    .map((place) => calculatePlaceMatchScore(profile, place, translations))
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
  limit = 3,
  t?: Translations
): ScoredPlace[] {
  const translations = t ?? getTranslations("en");
  return places
    .filter((p) => p.id !== place.id)
    .map((p) => {
      const scored = calculatePlaceMatchScore(profile, p, translations);
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

export function formatCrowdLevel(
  level: CrowdLevel,
  t: Translations = getTranslations("en")
): string {
  return t.options.crowdLevel[level];
}
