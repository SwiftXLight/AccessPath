"use client";

import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/context/user-preferences";
import { buildProfileSummary } from "@/lib/recommendations";
import {
  CROWD_PREFERENCE_OPTIONS,
  INTEREST_OPTIONS,
  MOBILITY_OPTIONS,
  SOCIAL_MODE_OPTIONS,
  type CrowdPreference,
  type MobilityPreference,
  type SocialMode,
  type TimeOfDay,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function SelectableCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left transition-all hover:shadow-sm",
        selected
          ? "border-primary bg-card ring-2 ring-primary/20 shadow-sm"
          : "bg-card hover:bg-muted/40"
      )}
    >
      <p className="font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </button>
  );
}

export function ProfileBuilder() {
  const { profile, updateProfile, resetProfile } = useUserPreferences();
  const summary = buildProfileSummary(profile);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            AI Preference Builder
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Build your local life profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tell us how you like to explore — our simulated AI uses this to
            personalize every recommendation.
          </p>
        </div>

        <Card className="mb-8 rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/30 to-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span aria-hidden>🤖</span>
              AI Summary of your profile
            </CardTitle>
            <CardDescription>Updates live as you adjust preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">&ldquo;{summary}&rdquo;</p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <section>
            <Label htmlFor="displayName" className="text-base font-semibold">
              Your name
            </Label>
            <Input
              id="displayName"
              className="mt-3 max-w-sm"
              value={profile.displayName}
              onChange={(e) => updateProfile({ displayName: e.target.value })}
              placeholder="How should we greet you?"
            />
          </section>

          <Separator />

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Mobility & accessibility</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll prioritize venues that fit your needs
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {MOBILITY_OPTIONS.map(({ value, label, description }) => (
                <SelectableCard
                  key={value}
                  selected={profile.mobilityPreference === value}
                  onClick={() =>
                    updateProfile({ mobilityPreference: value as MobilityPreference })
                  }
                  title={label}
                  description={description}
                />
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Distance tolerance</h2>
                <p className="text-sm text-muted-foreground">
                  How far are you willing to travel?
                </p>
              </div>
              <Badge variant="outline">{profile.maxDistanceKm} km</Badge>
            </div>
            <Slider
              value={[profile.maxDistanceKm]}
              min={1}
              max={20}
              step={0.5}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value;
                updateProfile({ maxDistanceKm: next });
              }}
            />
          </section>

          <Separator />

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Crowd preference</h2>
              <p className="text-sm text-muted-foreground">
                What atmosphere feels right for you?
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CROWD_PREFERENCE_OPTIONS.map(({ value, label, description }) => (
                <SelectableCard
                  key={value}
                  selected={profile.crowdPreference === value}
                  onClick={() =>
                    updateProfile({ crowdPreference: value as CrowdPreference })
                  }
                  title={label}
                  description={description}
                />
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Budget preference</h2>
                <p className="text-sm text-muted-foreground">
                  Maximum you&apos;d spend per event
                </p>
              </div>
              <Badge variant="outline">
                {profile.maxBudget === 0 ? "Free only" : `$${profile.maxBudget}`}
              </Badge>
            </div>
            <Slider
              value={[profile.maxBudget]}
              min={0}
              max={50}
              step={5}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value;
                updateProfile({ maxBudget: next });
              }}
            />
          </section>

          <Separator />

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Interests</h2>
              <p className="text-sm text-muted-foreground">
                Select all that apply
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {INTEREST_OPTIONS.map((interest) => {
                const active = profile.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? profile.interests.filter((i) => i !== interest)
                        : [...profile.interests, interest];
                      updateProfile({ interests: next });
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm capitalize transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "bg-card hover:bg-muted/50"
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Social preference</h2>
              <p className="text-sm text-muted-foreground">
                How do you usually like to go out?
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SOCIAL_MODE_OPTIONS.map(({ value, label }) => (
                <SelectableCard
                  key={value}
                  selected={profile.socialMode === value}
                  onClick={() =>
                    updateProfile({ socialMode: value as SocialMode | "any" })
                  }
                  title={label}
                />
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={resetProfile}>
              Reset to defaults
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
