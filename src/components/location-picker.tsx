"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { events, latLngToPercent } from "@/lib/events";
import {
  geocodeAddress,
  LOCATION_SUGGESTIONS,
  percentToLatLng,
  reverseGeocode,
} from "@/lib/location";
import type { SearchLocation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LocationPickerProps {
  value: SearchLocation;
  onChange: (location: SearchLocation) => void;
  compact?: boolean;
}

export function LocationPicker({ value, onChange, compact }: LocationPickerProps) {
  const [addressInput, setAddressInput] = useState(value.address);

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

  const handleMapClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const { lat, lng } = percentToLatLng(
      Math.max(4, Math.min(96, x)),
      Math.max(4, Math.min(96, y))
    );
    const address = reverseGeocode(lat, lng);
    const next = { address, lat, lng };
    onChange(next);
    setAddressInput(address);
  };

  const userPin = latLngToPercent(value.lat, value.lng);

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
          "relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 shadow-sm dark:from-blue-950/40 dark:via-sky-950/20 dark:to-cyan-950/30",
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
          {events.map((event) => {
            const { x, y } = latLngToPercent(event.lat, event.lng);
            return (
              <span
                key={event.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="pointer-events-none absolute z-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/35"
                aria-hidden
              />
            );
          })}

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
      </div>
    </div>
  );
}
