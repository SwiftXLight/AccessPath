export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type SocialMode = "alone" | "family" | "friends" | "meeting";
export type CrowdLevel = "low" | "medium" | "high";
export type CrowdPreference = "quiet" | "moderate" | "lively" | "any";
export type MobilityPreference = "full" | "limited" | "wheelchair" | "any";
export type CategoryTag = "music" | "food" | "sports" | "culture" | "tech";

export type PlaceType =
  | "park"
  | "riverside"
  | "lake"
  | "forest"
  | "museum"
  | "castle"
  | "garden"
  | "viewpoint";

export type PlaceCategoryTag = "nature" | "culture" | "history" | "family" | "sports";

export type CommentSource = "google" | "tripadvisor" | "facebook" | "yelp" | "eventbrite";

export interface SourceComment {
  source: CommentSource;
  author: string;
  date: string;
  rating?: number;
  text: string;
}

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
  sourceComments: SourceComment[];
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

export interface Place {
  id: string;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  placeType: PlaceType;
  openingHours: string;
  entryFee: number;
  typicalCrowd: CrowdLevel;
  interests: string[];
  socialModes: SocialMode[];
  accessibility: string[];
  bestTimeOfDay: TimeOfDay[];
  emoji: string;
  category: string;
  categoryTag: PlaceCategoryTag;
  managedBy: string;
  sourceComments: SourceComment[];
}

export interface ScoredPlace {
  place: Place;
  score: number;
  reasons: string[];
  explanation: string;
  distanceKm: number;
}

export type DiscoverKind = "event" | "place";

export interface MapMarker {
  id: string;
  kind: DiscoverKind;
  lat: number;
  lng: number;
  score: number;
  title: string;
  emoji: string;
  location: string;
}

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  park: "Park",
  riverside: "Riverside",
  lake: "Lake",
  forest: "Forest",
  museum: "Museum",
  castle: "Castle",
  garden: "Garden",
  viewpoint: "Viewpoint",
};

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
  id: "mobility" | "visual" | "hearing" | "cardiac" | "comfort";
  options: { value: AccessibilityNeed }[];
}[] = [
  {
    id: "mobility",
    options: [
      { value: "wheelchair_ramp" },
      { value: "accessible_restroom" },
      { value: "elevator" },
      { value: "accessible_parking" },
      { value: "wide_corridors" },
      { value: "flat_terrain" },
    ],
  },
  {
    id: "visual",
    options: [
      { value: "braille_signage" },
      { value: "audio_guide" },
      { value: "tactile_paving" },
    ],
  },
  {
    id: "hearing",
    options: [
      { value: "sign_language_support" },
      { value: "visual_alerts" },
    ],
  },
  {
    id: "cardiac",
    options: [
      { value: "rest_areas" },
      { value: "flat_terrain" },
      { value: "shaded_areas" },
      { value: "low_noise" },
    ],
  },
  {
    id: "comfort",
    options: [
      { value: "rest_areas" },
      { value: "low_noise" },
      { value: "shaded_areas" },
      { value: "service_animal_welcome" },
      { value: "accessible_transport_nearby" },
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
  maxDistanceKm: 2,
  maxBudget: 25,
  timeOfDay: [],
  interests: [],
  socialMode: "any",
  crowdPreference: "moderate",
  mobilityPreference: "any",
  accessibilityNeeds: [],
};

export const DEFAULT_FILTERS = DEFAULT_PROFILE;
