import eventsData from "@/data/events.json";
import placesData from "@/data/places.json";
import { MAP_BOUNDS, type LocalEvent, type Place, type SearchLocation } from "@/lib/types";

export type { SearchLocation };

export const CITY_CENTER: SearchLocation = {
  address: "City Center",
  lat: (MAP_BOUNDS.minLat + MAP_BOUNDS.maxLat) / 2,
  lng: (MAP_BOUNDS.minLng + MAP_BOUNDS.maxLng) / 2,
};

export const DEFAULT_SEARCH_LOCATION = CITY_CENTER;

const EVENT_LOCATIONS: SearchLocation[] = (eventsData as LocalEvent[]).map(
  (event) => ({
    address: event.location,
    lat: event.lat,
    lng: event.lng,
  })
);

const PLACE_LOCATIONS: SearchLocation[] = (placesData as Place[]).map(
  (place) => ({
    address: place.location,
    lat: place.lat,
    lng: place.lng,
  })
);

const KNOWN_LOCATIONS: SearchLocation[] = [
  CITY_CENTER,
  ...EVENT_LOCATIONS,
  ...PLACE_LOCATIONS,
];

export const LOCATION_SUGGESTIONS = [
  ...new Set(KNOWN_LOCATIONS.map((location) => location.address)),
];

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(distanceKm: number): string {
  const rounded =
    distanceKm < 10 ? Math.round(distanceKm * 10) / 10 : Math.round(distanceKm);
  return `${rounded} km`;
}

function simpleHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function geocodeAddress(address: string): SearchLocation {
  const normalized = address.trim().toLowerCase();
  if (!normalized) return CITY_CENTER;

  const exact = KNOWN_LOCATIONS.find(
    (location) => location.address.toLowerCase() === normalized
  );
  if (exact) return { ...exact };

  const partial = KNOWN_LOCATIONS.find(
    (location) =>
      normalized.includes(location.address.toLowerCase()) ||
      location.address.toLowerCase().includes(normalized)
  );
  if (partial) {
    return { address: address.trim(), lat: partial.lat, lng: partial.lng };
  }

  if (normalized.includes("center") || normalized.includes("centre")) {
    return { ...CITY_CENTER, address: address.trim() };
  }

  const hash = simpleHash(normalized);
  const lat =
    CITY_CENTER.lat + (((hash % 100) - 50) / 100) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) * 0.35;
  const lng =
    CITY_CENTER.lng + ((((hash >> 8) % 100) - 50) / 100) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng) * 0.35;

  return {
    address: address.trim(),
    lat: Math.max(MAP_BOUNDS.minLat, Math.min(MAP_BOUNDS.maxLat, lat)),
    lng: Math.max(MAP_BOUNDS.minLng, Math.min(MAP_BOUNDS.maxLng, lng)),
  };
}

export function reverseGeocode(lat: number, lng: number): string {
  let nearest = KNOWN_LOCATIONS[0];
  let nearestDistance = Infinity;

  for (const location of KNOWN_LOCATIONS) {
    const distance = haversineKm(lat, lng, location.lat, location.lng);
    if (distance < nearestDistance) {
      nearest = location;
      nearestDistance = distance;
    }
  }

  if (nearestDistance <= 0.25) {
    return nearest.address;
  }

  return `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

export function percentToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lng =
    MAP_BOUNDS.minLng + (x / 100) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
  const lat =
    MAP_BOUNDS.maxLat - (y / 100) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
  return { lat, lng };
}
