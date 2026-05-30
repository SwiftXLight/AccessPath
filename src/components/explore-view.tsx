"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AiConcierge } from "@/components/ai-concierge";
import { EventCard } from "@/components/event-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { LinkButton } from "@/components/link-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserPreferences } from "@/context/user-preferences";
import { getFilteredEvents } from "@/lib/events";
import { buildProfileSummary } from "@/lib/recommendations";

export function ExploreView() {
  const { profile, setProfile } = useUserPreferences();

  const filteredEvents = useMemo(
    () => getFilteredEvents(profile),
    [profile]
  );

  const profileSummary = buildProfileSummary(profile);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Recommended Events for You
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Personalized picks for {profile.displayName || "you"} — {profileSummary.toLowerCase()}
          </p>
        </div>
        <LinkButton variant="outline" size="sm" href="/profile">
          Edit profile
        </LinkButton>
      </div>

      <div className="mb-6">
        <AiConcierge />
      </div>

      <div className="mb-4 lg:hidden">
        <Sheet>
          <SheetTrigger
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            Open filters
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterSidebar profile={profile} onChange={setProfile} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar profile={profile} onChange={setProfile} />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              {filteredEvents.length} personalized match
              {filteredEvents.length !== 1 ? "es" : ""}
            </h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center shadow-sm">
              <p className="text-lg font-medium">No strong matches found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your profile settings on the{" "}
                <Link href="/profile" className="text-primary underline-offset-4 hover:underline">
                  profile page
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((scored, index) => (
                <EventCard
                  key={scored.event.id}
                  scored={scored}
                  highlight={index === 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
