export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type SocialMode = "alone" | "family" | "friends" | "meeting";
export type CrowdLevel = "low" | "medium" | "high";
export type CrowdPreference = "quiet" | "moderate" | "lively" | "any";
export type MobilityPreference = "full" | "limited" | "wheelchair" | "any";
export type CategoryTag = "music" | "food" | "sports" | "culture" | "tech";

export interface SearchLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface LocalEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  distanceKm: number;
  lat: number;
  lng: number;
  date: string;
  timeOfDay: TimeOfDay;
  startTime: string;
  endTime: string;
  price: number;
  crowdLevel: CrowdLevel;
  interests: string[];
  socialModes: SocialMode[];
  accessibility: string[];
  emoji: string;
  category: string;
  categoryTag: CategoryTag;
  organizer: string;
}

export type AccessibilityNeed =
  | "wheelchair_ramp"
  | "accessible_restroom"
  | "elevator"
  | "accessible_parking"
  | "wide_corridors"
  | "flat_terrain"
  | "braille_signage"
  | "audio_guide"
  | "tactile_paving"
  | "visual_alerts"
  | "sign_language_support"
  | "hearing_loop"
  | "cardiac_friendly_terrain"
  | "rest_areas"
  | "shaded_areas"
  | "low_noise"
  | "service_animal_welcome"
  | "accessible_transport_nearby";

export interface UserProfile {
  displayName: string;
  searchLocation: SearchLocation;
  maxDistanceKm: number;
  maxBudget: number;
  timeOfDay: TimeOfDay[];
  interests: string[];
  socialMode: SocialMode | "any";
  crowdPreference: CrowdPreference;
  mobilityPreference: MobilityPreference;
  accessibilityNeeds: AccessibilityNeed[];
}

/** @deprecated Use UserProfile — kept for gradual migration */
export type UserFilters = UserProfile;

export interface ScoredEvent {
  event: LocalEvent;
  score: number;
  reasons: string[];
  explanation: string;
  distanceKm: number;
}

export const INTEREST_OPTIONS = [
  "music",
  "food",
  "art",
  "nature",
  "sports",
  "tech",
  "history",
  "family",
] as const;

export const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

export const SOCIAL_MODE_OPTIONS: { value: SocialMode | "any"; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "alone", label: "Solo" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "meeting", label: "Meet new people" },
];

export const CROWD_PREFERENCE_OPTIONS: {
  value: CrowdPreference;
  label: string;
  description: string;
}[] = [
  { value: "quiet", label: "Calm & quiet", description: "Low crowds, relaxed atmosphere" },
  { value: "moderate", label: "Moderate", description: "Some buzz, not overwhelming" },
  { value: "lively", label: "Lively & social", description: "Energetic, busy events" },
  { value: "any", label: "No preference", description: "Open to any crowd size" },
];

export const MOBILITY_OPTIONS: {
  value: MobilityPreference;
  label: string;
  description: string;
}[] = [
  { value: "full", label: "Full mobility", description: "Walking tours, stairs OK" },
  { value: "limited", label: "Limited mobility", description: "Prefer seating & short walks" },
  { value: "wheelchair", label: "Wheelchair accessible", description: "Need accessible venues" },
  { value: "any", label: "No special needs", description: "Flexible on accessibility" },
];

export const ACCESSIBILITY_NEED_GROUPS: {
  title: string;
  options: { value: AccessibilityNeed; label: string }[];
}[] = [
  {
    title: "Mobility & Wheelchair",
    options: [
      { value: "wheelchair_ramp", label: "Wheelchair Ramp" },
      { value: "accessible_restroom", label: "Accessible Restroom" },
      { value: "elevator", label: "Elevator" },
      { value: "accessible_parking", label: "Accessible Parking" },
      { value: "wide_corridors", label: "Wide Corridors" },
      { value: "flat_terrain", label: "Flat Terrain" },
    ],
  },
  {
    title: "Visual Impairment",
    options: [
      { value: "braille_signage", label: "Braille Signage" },
      { value: "audio_guide", label: "Audio Guide" },
      { value: "tactile_paving", label: "Tactile Paving" },
      { value: "visual_alerts", label: "Visual Alerts" },
    ],
  },
  {
    title: "Hearing Impairment",
    options: [
      { value: "sign_language_support", label: "Sign Language" },
      { value: "hearing_loop", label: "Hearing Loop" },
      { value: "visual_alerts", label: "Visual Alerts" },
    ],
  },
  {
    title: "Cardiac & Respiratory",
    options: [
      { value: "cardiac_friendly_terrain", label: "Cardiac-Friendly" },
      { value: "rest_areas", label: "Rest Areas" },
      { value: "flat_terrain", label: "Flat Terrain" },
      { value: "shaded_areas", label: "Shaded Areas" },
      { value: "low_noise", label: "Low Noise" },
    ],
  },
  {
    title: "General Comfort",
    options: [
      { value: "rest_areas", label: "Rest Areas" },
      { value: "low_noise", label: "Low Noise" },
      { value: "shaded_areas", label: "Shaded Areas" },
      { value: "service_animal_welcome", label: "Service Animals" },
      { value: "accessible_transport_nearby", label: "Accessible Transport" },
    ],
  },
];

/** Maps profile accessibility needs to event accessibility tags in events.json */
export const ACCESSIBILITY_NEED_EVENT_TAGS: Record<AccessibilityNeed, string[]> = {
  wheelchair_ramp: ["wheelchair"],
  accessible_restroom: ["wheelchair", "seating"],
  elevator: ["wheelchair"],
  accessible_parking: ["wheelchair"],
  wide_corridors: ["wheelchair"],
  flat_terrain: ["wheelchair", "outdoor", "walking"],
  braille_signage: ["wheelchair", "subtitles"],
  audio_guide: ["subtitles"],
  tactile_paving: ["wheelchair"],
  visual_alerts: ["subtitles"],
  sign_language_support: ["subtitles"],
  hearing_loop: ["quiet-room"],
  cardiac_friendly_terrain: ["seating", "outdoor"],
  rest_areas: ["seating", "quiet-room"],
  shaded_areas: ["outdoor", "seating"],
  low_noise: ["quiet-room"],
  service_animal_welcome: ["outdoor", "stroller-friendly"],
  accessible_transport_nearby: ["wheelchair"],
};

export const MAP_BOUNDS = {
  minLat: 50.442,
  maxLat: 50.468,
  minLng: 30.502,
  maxLng: 30.545,
};

export const DEFAULT_SEARCH_LOCATION: SearchLocation = {
  address: "City Center",
  lat: (MAP_BOUNDS.minLat + MAP_BOUNDS.maxLat) / 2,
  lng: (MAP_BOUNDS.minLng + MAP_BOUNDS.maxLng) / 2,
};

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "Explorer",
  searchLocation: DEFAULT_SEARCH_LOCATION,
  maxDistanceKm: 10,
  maxBudget: 25,
  timeOfDay: [],
  interests: [],
  socialMode: "any",
  crowdPreference: "moderate",
  mobilityPreference: "any",
  accessibilityNeeds: [],
};

export const DEFAULT_FILTERS = DEFAULT_PROFILE;
