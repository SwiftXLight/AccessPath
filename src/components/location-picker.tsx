"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { events, getMatchTier, latLngToPercent } from "@/lib/events";
import { places } from "@/lib/places";
import {
  geocodeAddress,
  LOCATION_SUGGESTIONS,
  percentToLatLng,
  reverseGeocode,
} from "@/lib/location";
import type { MapMarker, SearchLocation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LocationPickerProps {
  value: SearchLocation;
  onChange: (location: SearchLocation) => void;
  compact?: boolean;
  scoredMarkers?: MapMarker[];
}

const TIER_COLORS = {
  high: "bg-green-500",
  medium: "bg-amber-400",
  low: "bg-red-400",
} as const;

const TIER_TEXT_COLORS = {
  high: "text-green-600",
  medium: "text-amber-600",
  low: "text-red-500",
} as const;

interface HoveredMarker {
  marker: MapMarker;
  x: number;
  y: number;
}

export function LocationPicker({ value, onChange, compact, scoredMarkers }: LocationPickerProps) {
  const [addressInput, setAddressInput] = useState(value.address);
  const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(null);

  useEffect(() => {
    setAddressInput(value.address);
  }, [value.address]);

  const applyAddress = (rawAddress?: string) => {
    const nextAddress = (rawAddress ?? addressInput).trim();
    if (!nextAddress) {
      onChange(geocodeAddress("City Center"));
      setAddressInput("City Center");
      return;
    }

    const resolved = geocodeAddress(nextAddress);
    onChange(resolved);
    setAddressInput(resolved.address);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const { lat, lng } = percentToLatLng(
      Math.max(4, Math.min(96, x)),
      Math.max(4, Math.min(96, y))
    );
    const address = reverseGeocode(lat, lng);
    onChange({ address, lat, lng });
    setAddressInput(address);
  };

  const userPin = latLngToPercent(value.lat, value.lng);
  const fallbackMarkers = [...events, ...places];

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="search-location">Your location</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter an address or tap the map to set your starting point
        </p>
      </div>

      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search-location"
          list="location-suggestions"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onBlur={() => applyAddress()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyAddress();
            }
          }}
          placeholder="e.g. Central Square"
          className="pl-9"
        />
        <datalist id="location-suggestions">
          {LOCATION_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 shadow-sm",
          compact ? "min-h-[180px]" : "min-h-[220px]"
        )}
      >
        <div className="absolute inset-0 opacity-30">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="location-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-primary/20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#location-grid)" />
          </svg>
        </div>

        <button
          type="button"
          onClick={handleMapClick}
          className="relative aspect-[4/3] w-full cursor-crosshair"
          aria-label="Pick location on map"
        >
          {scoredMarkers
            ? scoredMarkers.map((marker) => {
                const { x, y } = latLngToPercent(marker.lat, marker.lng);
                const tier = getMatchTier(marker.score);
                const isPlace = marker.kind === "place";
                return (
                  <span
                    key={`${marker.kind}-${marker.id}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className={cn(
                      "pointer-events-auto absolute z-0 -translate-x-1/2 -translate-y-1/2 cursor-pointer ring-2 ring-white/80 transition-transform hover:scale-150",
                      isPlace ? "size-3 rotate-45" : "size-3 rounded-full",
                      TIER_COLORS[tier]
                    )}
                    onMouseEnter={() => setHoveredMarker({ marker, x, y })}
                    onMouseLeave={() => setHoveredMarker(null)}
                    aria-hidden
                  />
                );
              })
            : fallbackMarkers.map((item) => {
                const { x, y } = latLngToPercent(item.lat, item.lng);
                return (
                  <span
                    key={item.id}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="pointer-events-none absolute z-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/35"
                    aria-hidden
                  />
                );
              })}

          {hoveredMarker && (
            <div
              style={{ left: `${hoveredMarker.x}%`, top: `${hoveredMarker.y}%` }}
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-1"
            >
              <div className="w-max max-w-[190px] rounded-lg border bg-card px-3 py-2 shadow-lg">
                <p className="truncate text-xs font-semibold leading-tight">
                  {hoveredMarker.marker.title}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {hoveredMarker.marker.emoji} {hoveredMarker.marker.location}
                </p>
                <p className={cn(
                  "mt-1 text-[10px] font-bold",
                  TIER_TEXT_COLORS[getMatchTier(hoveredMarker.marker.score)]
                )}>
                  {hoveredMarker.marker.score}% match · {hoveredMarker.marker.kind}
                </p>
              </div>
            </div>
          )}

          <span
            style={{ left: `${userPin.x}%`, top: `${userPin.y}%` }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            aria-hidden
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20">
              <MapPin className="size-4" />
            </span>
            <span className="absolute left-1/2 top-full mt-1 w-max max-w-[140px] -translate-x-1/2 truncate rounded-md bg-card px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
              You
            </span>
          </span>
        </button>

        {scoredMarkers && (
          <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2.5 rounded-md bg-card/90 px-2.5 py-1.5 text-[10px] shadow-sm">
              <span className="flex items-center gap-1 font-medium">
                <span className="size-2.5 rounded-full bg-green-500" /> Great
              </span>
              <span className="flex items-center gap-1 font-medium">
                <span className="size-2.5 rounded-full bg-amber-400" /> OK
              </span>
              <span className="flex items-center gap-1 font-medium">
                <span className="size-2.5 rounded-full bg-red-400" /> Low
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-card/90 px-2.5 py-1 text-[10px] shadow-sm">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-muted-foreground/50" /> Event
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rotate-45 bg-muted-foreground/50" /> Place
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
