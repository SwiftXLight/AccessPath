"use client";

import { useMemo } from "react";
import { AccessibilityNeedsFilter } from "@/components/accessibility-needs-filter";
import { LocationPicker } from "@/components/location-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/locale";
import { calculateMatchScore, events as allEvents, toMapMarker as eventToMapMarker } from "@/lib/events";
import { calculatePlaceMatchScore, places as allPlaces, toMapMarker as placeToMapMarker } from "@/lib/places";
import {
  DEFAULT_PROFILE,
  INTEREST_OPTIONS,
  type AccessibilityNeed,
  type CrowdPreference,
  type SocialMode,
  type TimeOfDay,
  type UserProfile,
} from "@/lib/types";

interface FilterSidebarProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export function FilterSidebar({ profile, onChange }: FilterSidebarProps) {
  const { t } = useTranslation();

  const update = (partial: Partial<UserProfile>) => {
    onChange({ ...profile, ...partial });
  };

  const scoredMarkers = useMemo(
    () => [
      ...allEvents.map((event) => eventToMapMarker(calculateMatchScore(profile, event, t))),
      ...allPlaces.map((place) => placeToMapMarker(calculatePlaceMatchScore(profile, place, t))),
    ],
    [profile, t]
  );

  const toggleTimeOfDay = (value: TimeOfDay) => {
    const next = profile.timeOfDay.includes(value)
      ? profile.timeOfDay.filter((slot) => slot !== value)
      : [...profile.timeOfDay, value];
    update({ timeOfDay: next });
  };

  const toggleInterest = (interest: string) => {
    const next = profile.interests.includes(interest)
      ? profile.interests.filter((i) => i !== interest)
      : [...profile.interests, interest];
    update({ interests: next });
  };

  const toggleAccessibilityNeed = (need: AccessibilityNeed) => {
    const next = profile.accessibilityNeeds.includes(need)
      ? profile.accessibilityNeeds.filter((n) => n !== need)
      : [...profile.accessibilityNeeds, need];
    update({ accessibilityNeeds: next });
  };

  const crowdOptions = Object.entries(t.options.crowd) as [
    CrowdPreference,
    { label: string; description: string },
  ][];

  const socialOptions = Object.entries(t.options.socialMode) as [
    SocialMode | "any",
    string,
  ][];

  return (
    <aside className="space-y-6 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t.filters.quickFilters}</h2>
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_PROFILE)}>
          {t.common.reset}
        </Button>
      </div>

      <LocationPicker
        value={profile.searchLocation}
        onChange={(searchLocation) => update({ searchLocation })}
        compact
        scoredMarkers={scoredMarkers}
      />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t.filters.distance}</Label>
          <span className="text-sm text-muted-foreground">
            {profile.maxDistanceKm} {t.common.km}
          </span>
        </div>
        <Slider
          value={[profile.maxDistanceKm]}
          min={0.5}
          max={5}
          step={0.5}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            update({ maxDistanceKm: next });
          }}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t.filters.budget}</Label>
          <span className="text-sm text-muted-foreground">
            {profile.maxBudget === 0 ? t.common.freeOnly : `$${profile.maxBudget}`}
          </span>
        </div>
        <Slider
          value={[profile.maxBudget]}
          min={0}
          max={50}
          step={5}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            update({ maxBudget: next });
          }}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>{t.filters.crowd}</Label>
        <Select
          value={profile.crowdPreference}
          onValueChange={(value) =>
            update({
              crowdPreference: value as UserProfile["crowdPreference"],
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {crowdOptions.map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>{t.filters.timeOfDay}</Label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(t.options.timeOfDay) as [TimeOfDay, string][]).map(
            ([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <Checkbox
                  checked={profile.timeOfDay.includes(value)}
                  onCheckedChange={() => toggleTimeOfDay(value)}
                />
                {label}
              </label>
            )
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>{t.filters.interests}</Label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const active = profile.interests.includes(interest);
            const label =
              t.options.interests[interest as keyof typeof t.options.interests];
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>{t.filters.socialMode}</Label>
        <Select
          value={profile.socialMode}
          onValueChange={(value) =>
            update({ socialMode: value as UserProfile["socialMode"] })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {socialOptions.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <AccessibilityNeedsFilter
        selected={profile.accessibilityNeeds}
        onToggle={toggleAccessibilityNeed}
      />
    </aside>
  );
}
