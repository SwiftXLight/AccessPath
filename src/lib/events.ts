import eventsData from "@/data/events.json";
import { getTranslations } from "@/lib/i18n";
import { interpolate, type Translations } from "@/lib/i18n/types";
import { haversineKm } from "@/lib/location";
import type {
  AccessibilityNeed,
  CrowdLevel,
  CrowdPreference,
  LocalEvent,
  MapMarker,
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
        ? s.calmCrowdQuiet
        : level === "high" && preference === "lively"
          ? s.livelyCrowdLively
          : s.moderateCrowd;
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
      return { points: 12, reason: s.wheelchairAccessible };
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

function eventMeetsAccessibilityNeed(
  need: AccessibilityNeed,
  eventAccessibility: string[]
): boolean {
  const tags = ACCESSIBILITY_NEED_EVENT_TAGS[need] ?? [];
  return tags.some((tag) => eventAccessibility.includes(tag));
}

function accessibilityNeedsMatchScore(
  needs: AccessibilityNeed[],
  eventAccessibility: string[],
  t: Translations
): { points: number; reason?: string } {
  const s = t.ai.scoring;
  if (needs.length === 0) return { points: 0 };

  const matched = needs.filter((need) =>
    eventMeetsAccessibilityNeed(need, eventAccessibility)
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
  event: LocalEvent,
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

  if (event.price === 0) {
    highlights.push(e.freeEntry);
  } else if (event.price <= Math.max(1, profile.maxBudget * 0.5)) {
    highlights.push(interpolate(e.budgetFriendly, { price: event.price }));
  } else if (event.price <= profile.maxBudget) {
    highlights.push(interpolate(e.withinBudget, { price: event.price }));
  }

  const matchingInterests = event.interests.filter((i) =>
    profile.interests.includes(i)
  );
  if (matchingInterests.length > 0) {
    highlights.push(
      interpolate(e.alignsInterest, {
        interests: translateInterests(matchingInterests.slice(0, 2), t),
      })
    );
  }

  if (profile.crowdPreference === "quiet" && event.crowdLevel === "low") {
    highlights.push(e.calmAtmosphere);
  } else if (profile.crowdPreference === "lively" && event.crowdLevel === "high") {
    highlights.push(e.livelyVibe);
  }

  if (
    profile.mobilityPreference === "wheelchair" &&
    event.accessibility.includes("wheelchair")
  ) {
    highlights.push(e.wheelchairAccessible);
  } else if (
    profile.mobilityPreference === "limited" &&
    event.accessibility.some((a) => ["seating", "wheelchair"].includes(a))
  ) {
    highlights.push(e.limitedMobility);
  }

  if (highlights.length === 0) {
    const positives = reasons.filter(
      (r) =>
        !r.includes(t.ai.scoring.crowdTooBusy) &&
        !r.includes(t.ai.scoring.mayNotAccessibility) &&
        !r.includes(t.ai.scoring.beyondRadius.split("{")[0])
    );
    if (positives.length > 0) return `${positives[0]}.`;
    return e.surprise;
  }

  if (highlights.length === 1) {
    return interpolate(e.worthChecking, { highlight: capitalize(highlights[0]) });
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

/** Primary match scoring — returns absolute 0–100 score */
export function calculateMatchScore(
  profile: UserProfile,
  event: LocalEvent,
  t: Translations = getTranslations("en")
): ScoredEvent {
  let score = 35;
  const reasons: string[] = [];
  const distanceKm = getDistanceKm(profile, event);
  const s = t.ai.scoring;

  if (distanceKm <= profile.maxDistanceKm) {
    const bonus = Math.round(25 * (1 - distanceKm / profile.maxDistanceKm));
    score += bonus;
    if (distanceKm <= 2) {
      reasons.push(interpolate(s.onlyKmAway, { distance: distanceKm }));
    } else {
      reasons.push(interpolate(s.withinComfortZone, { max: profile.maxDistanceKm }));
    }
  } else {
    score -= 30;
    reasons.push(interpolate(s.beyondRadius, { max: profile.maxDistanceKm }));
  }

  if (event.price <= profile.maxBudget) {
    score += event.price === 0 ? 18 : 12;
    if (event.price === 0) {
      reasons.push(s.freeEntryBudget);
    } else {
      reasons.push(
        interpolate(s.priceWithinBudget, { price: formatPrice(event.price, t) })
      );
    }
  } else {
    score -= 22;
    reasons.push(interpolate(s.aboveBudget, { max: profile.maxBudget }));
  }

  const matchingInterests = event.interests.filter((i) =>
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

  const crowd = crowdMatchScore(profile.crowdPreference, event.crowdLevel, t);
  score += crowd.points;
  if (crowd.reason) reasons.push(crowd.reason);

  if (profile.socialMode === "any" || event.socialModes.includes(profile.socialMode)) {
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

  const mobility = mobilityMatchScore(profile.mobilityPreference, event.accessibility, t);
  score += mobility.points;
  if (mobility.reason) reasons.push(mobility.reason);

  const accessibility = accessibilityNeedsMatchScore(
    profile.accessibilityNeeds,
    event.accessibility,
    t
  );
  score += accessibility.points;
  if (accessibility.reason) reasons.push(accessibility.reason);

  if (
    profile.timeOfDay.length === 0 ||
    profile.timeOfDay.includes(event.timeOfDay)
  ) {
    score += 8;
    if (profile.timeOfDay.length > 0) {
      reasons.push(
        interpolate(s.fitsSchedule, {
          time: t.options.timeOfDay[event.timeOfDay].toLowerCase(),
        })
      );
    }
  } else {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const explanation = buildMatchExplanation(reasons, profile, event, distanceKm, t);

  return { event, score, reasons, explanation, distanceKm };
}

export function scoreEvent(
  event: LocalEvent,
  profile: UserProfile,
  t?: Translations
): ScoredEvent {
  return calculateMatchScore(profile, event, t);
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
  limit = 5,
  t?: Translations
): ScoredEvent[] {
  const translations = t ?? getTranslations("en");
  return events
    .map((event) => calculateMatchScore(profile, event, translations))
    .filter(({ score }) => score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getFilteredEvents(
  profile: UserProfile,
  t?: Translations
): ScoredEvent[] {
  const translations = t ?? getTranslations("en");
  return events
    .map((event) => calculateMatchScore(profile, event, translations))
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
  limit = 3,
  t?: Translations
): ScoredEvent[] {
  const translations = t ?? getTranslations("en");
  return events
    .filter((e) => e.id !== event.id)
    .map((e) => {
      const scored = calculateMatchScore(profile, e, translations);
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

export function formatPrice(price: number, t: Translations = getTranslations("en")): string {
  return price === 0 ? t.common.free : `$${price}`;
}

export function formatDate(
  dateStr: string,
  locale: "en" | "pl" = "en"
): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString(
    locale === "pl" ? "pl-PL" : "en-US",
    { weekday: "short", month: "short", day: "numeric" }
  );
}

export function formatCrowdLevel(
  level: CrowdLevel,
  t: Translations = getTranslations("en")
): string {
  return t.options.crowdLevel[level];
}

export function toMapMarker(scored: ScoredEvent): MapMarker {
  return {
    id: scored.event.id,
    kind: "event",
    lat: scored.event.lat,
    lng: scored.event.lng,
    score: scored.score,
    title: scored.event.title,
    emoji: scored.event.emoji,
    location: scored.event.location,
  };
}
