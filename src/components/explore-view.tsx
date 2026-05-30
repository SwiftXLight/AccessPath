"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AiConcierge } from "@/components/ai-concierge";
import { EventCard } from "@/components/event-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { LinkButton } from "@/components/link-button";
import { PlaceCard } from "@/components/place-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserPreferences } from "@/context/user-preferences";
import { getFilteredEvents } from "@/lib/events";
import { getFilteredPlaces } from "@/lib/places";
import { buildProfileSummary } from "@/lib/recommendations";
import {
  DEFAULT_PROFILE,
  type AccessibilityNeed,
  type DiscoverKind,
  type UserProfile,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const DEMO_PERSONAS: { label: string; emoji: string; description: string; profile: UserProfile }[] = [
  {
    label: "Janek",
    emoji: "♿",
    description: "Wheelchair user · Quiet, nearby · Culture & music",
    profile: {
      ...DEFAULT_PROFILE,
      displayName: "Janek",
      mobilityPreference: "wheelchair",
      crowdPreference: "quiet",
      maxDistanceKm: 1.5,
      maxBudget: 15,
      interests: ["culture", "music"],
      accessibilityNeeds: [
        "wheelchair_ramp",
        "accessible_restroom",
        "elevator",
      ] as AccessibilityNeed[],
    },
  },
  {
    label: "Anna",
    emoji: "🎓",
    description: "Student · Low budget · Music & food · Meet new people",
    profile: {
      ...DEFAULT_PROFILE,
      displayName: "Anna",
      maxBudget: 10,
      crowdPreference: "moderate",
      interests: ["music", "food"],
      socialMode: "meeting",
      maxDistanceKm: 3,
    },
  },
  {
    label: "Kowalski Family",
    emoji: "👨‍👩‍👧",
    description: "Family outings · Nature & food · Comfortable budget",
    profile: {
      ...DEFAULT_PROFILE,
      displayName: "Kowalski Family",
      socialMode: "family",
      crowdPreference: "moderate",
      interests: ["family", "nature", "food"],
      maxDistanceKm: 4,
      maxBudget: 30,
    },
  },
];

type ExploreTab = "all" | DiscoverKind;

type DiscoverItem =
  | { kind: "event"; score: number; id: string; searchText: string; event: ReturnType<typeof getFilteredEvents>[number] }
  | { kind: "place"; score: number; id: string; searchText: string; place: ReturnType<typeof getFilteredPlaces>[number] };

const TAB_OPTIONS: { value: ExploreTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "event", label: "Events" },
  { value: "place", label: "Places" },
];

const ROWS_PER_PAGE = 3;

function useGridColumns() {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1280px)").matches) setColumns(3);
      else if (window.matchMedia("(min-width: 640px)").matches) setColumns(2);
      else setColumns(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columns;
}

export function ExploreView() {
  const { profile, setProfile } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreTab>("all");
  const [visibleCount, setVisibleCount] = useState(ROWS_PER_PAGE * 3);
  const gridColumns = useGridColumns();
  const pageSize = gridColumns * ROWS_PER_PAGE;

  const filteredEvents = useMemo(
    () => getFilteredEvents(profile),
    [profile]
  );

  const filteredPlaces = useMemo(
    () => getFilteredPlaces(profile),
    [profile]
  );

  const allItems = useMemo((): DiscoverItem[] => {
    const events: DiscoverItem[] = filteredEvents.map((scored) => ({
      kind: "event",
      score: scored.score,
      id: scored.event.id,
      searchText: [
        scored.event.title,
        scored.event.description,
        scored.event.category,
        ...scored.event.interests,
      ].join(" ").toLowerCase(),
      event: scored,
    }));

    const places: DiscoverItem[] = filteredPlaces.map((scored) => ({
      kind: "place",
      score: scored.score,
      id: scored.place.id,
      searchText: [
        scored.place.title,
        scored.place.description,
        scored.place.category,
        scored.place.placeType,
        ...scored.place.interests,
      ].join(" ").toLowerCase(),
      place: scored,
    }));

    return [...events, ...places].sort((a, b) => b.score - a.score);
  }, [filteredEvents, filteredPlaces]);

  const tabItems = useMemo(() => {
    if (activeTab === "all") return allItems;
    return allItems.filter((item) => item.kind === activeTab);
  }, [allItems, activeTab]);

  const displayedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabItems;
    return tabItems.filter((item) => item.searchText.includes(q));
  }, [tabItems, searchQuery]);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, activeTab, searchQuery, displayedItems.length, profile]);

  const visibleItems = displayedItems.slice(0, visibleCount);
  const hasMore = visibleCount < displayedItems.length;
  const showLoadMore = displayedItems.length > pageSize && hasMore;

  const profileSummary = buildProfileSummary(profile);

  const tabCounts = {
    all: allItems.length,
    event: filteredEvents.length,
    place: filteredPlaces.length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Recommended for You
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Events and always-open places for {profile.displayName || "you"} — {profileSummary.toLowerCase()}
          </p>
        </div>
        <LinkButton variant="outline" size="sm" href="/profile">
          Edit profile
        </LinkButton>
      </div>

      <div className="mb-6 rounded-xl border bg-card/60 px-4 py-3">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick demo profiles
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_PERSONAS.map((persona) => (
            <button
              key={persona.label}
              type="button"
              onClick={() => {
                setProfile(persona.profile);
                setSearchQuery("");
              }}
              title={persona.description}
              className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/60 hover:border-primary/40"
            >
              <span aria-hidden>{persona.emoji}</span>
              {persona.label}
            </button>
          ))}
        </div>
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
          <div className="mb-4 flex flex-wrap gap-2">
            {TAB_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  activeTab === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border bg-card hover:bg-muted/60"
                )}
              >
                {label}
                <span className="ml-1.5 opacity-80">({tabCounts[value]})</span>
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder='Search — try "park", "museum", "music", "free"…'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              {displayedItems.length} personalized match
              {displayedItems.length !== 1 ? "es" : ""}
              {searchQuery.trim() && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  for &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </h2>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {displayedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center shadow-sm">
              <p className="text-lg font-medium">
                {searchQuery.trim() ? "No results found" : "No strong matches found"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery.trim() ? (
                  <>
                    Try a different keyword or{" "}
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      clear the search
                    </button>
                    .
                  </>
                ) : (
                  <>
                    Try widening your profile settings on the{" "}
                    <Link href="/profile" className="text-primary underline-offset-4 hover:underline">
                      profile page
                    </Link>
                    {activeTab !== "all" && (
                      <>
                        {" "}
                        or switch to{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("all")}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          All
                        </button>
                      </>
                    )}
                    .
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleItems.map((item, index) =>
                  item.kind === "event" ? (
                    <EventCard
                      key={item.id}
                      scored={item.event}
                      highlight={index === 0}
                    />
                  ) : (
                    <PlaceCard
                      key={item.id}
                      scored={item.place}
                      highlight={index === 0}
                    />
                  )
                )}
              </div>

              {showLoadMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + pageSize, displayedItems.length)
                      )
                    }
                  >
                    Load more
                    <span className="ml-1.5 text-muted-foreground">
                      ({displayedItems.length - visibleCount} remaining)
                    </span>
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
