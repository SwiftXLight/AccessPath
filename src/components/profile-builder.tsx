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
import { useTranslation } from "@/context/locale";
import { useUserPreferences } from "@/context/user-preferences";
import { buildProfileSummary } from "@/lib/recommendations";
import {
  INTEREST_OPTIONS,
  type CrowdPreference,
  type MobilityPreference,
  type SocialMode,
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
  const { t } = useTranslation();
  const summary = buildProfileSummary(profile, t);

  const mobilityOptions = (
    Object.entries(t.options.mobility) as [
      MobilityPreference,
      { label: string; description: string },
    ][]
  ).map(([value, { label, description }]) => ({ value, label, description }));

  const crowdOptions = (
    Object.entries(t.options.crowd) as [
      CrowdPreference,
      { label: string; description: string },
    ][]
  ).map(([value, { label, description }]) => ({ value, label, description }));

  const socialOptions = (
    Object.entries(t.options.socialMode) as [SocialMode | "any", string][]
  ).map(([value, label]) => ({ value, label }));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            {t.profile.badge}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{t.profile.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.profile.subtitle}</p>
        </div>

        <Card className="mb-8 rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/30 to-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span aria-hidden>🤖</span>
              {t.profile.aiSummaryTitle}
            </CardTitle>
            <CardDescription>{t.profile.aiSummaryDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">&ldquo;{summary}&rdquo;</p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <section>
            <Label htmlFor="displayName" className="text-base font-semibold">
              {t.profile.yourName}
            </Label>
            <Input
              id="displayName"
              className="mt-3 max-w-sm"
              value={profile.displayName}
              onChange={(e) => updateProfile({ displayName: e.target.value })}
              placeholder={t.profile.namePlaceholder}
            />
          </section>

          <Separator />

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">{t.profile.mobilityTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.profile.mobilitySubtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {mobilityOptions.map(({ value, label, description }) => (
                <SelectableCard
                  key={value}
                  selected={profile.mobilityPreference === value}
                  onClick={() => updateProfile({ mobilityPreference: value })}
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
                <h2 className="font-semibold">{t.profile.distanceTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.profile.distanceSubtitle}</p>
              </div>
              <Badge variant="outline">
                {profile.maxDistanceKm} {t.common.km}
              </Badge>
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
              <h2 className="font-semibold">{t.profile.crowdTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.profile.crowdSubtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {crowdOptions.map(({ value, label, description }) => (
                <SelectableCard
                  key={value}
                  selected={profile.crowdPreference === value}
                  onClick={() => updateProfile({ crowdPreference: value })}
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
                <h2 className="font-semibold">{t.profile.budgetTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.profile.budgetSubtitle}</p>
              </div>
              <Badge variant="outline">
                {profile.maxBudget === 0 ? t.common.freeOnly : `$${profile.maxBudget}`}
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
              <h2 className="font-semibold">{t.profile.interestsTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.profile.interestsSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {INTEREST_OPTIONS.map((interest) => {
                const active = profile.interests.includes(interest);
                const label =
                  t.options.interests[interest as keyof typeof t.options.interests];
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
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">{t.profile.socialTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.profile.socialSubtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {socialOptions.map(({ value, label }) => (
                <SelectableCard
                  key={value}
                  selected={profile.socialMode === value}
                  onClick={() => updateProfile({ socialMode: value })}
                  title={label}
                />
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={resetProfile}>
              {t.profile.resetDefaults}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
