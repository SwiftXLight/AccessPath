import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/events";
import { getCategoryGradient } from "@/lib/recommendations";
import type { ScoredEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  scored: ScoredEvent;
  highlight?: boolean;
}

export function EventCard({ scored, highlight }: EventCardProps) {
  const { event, score, explanation, distanceKm } = scored;
  const gradient = getCategoryGradient(event.categoryTag);

  return (
    <Link href={`/events/${event.id}`} className="block h-full">
      <Card
        className={cn(
          "h-full overflow-hidden transition-shadow hover:shadow-md",
          highlight && "border-primary/40 ring-1 ring-primary/20"
        )}
      >
        <div
          className={cn(
            "relative flex h-32 items-center justify-center bg-gradient-to-br",
            gradient
          )}
        >
          <span className="text-5xl drop-shadow-sm" aria-hidden>
            {event.emoji}
          </span>
          <Badge
            className={cn(
              "absolute right-3 top-3 shadow-sm",
              score >= 70
                ? "bg-green-600"
                : score >= 45
                  ? "bg-amber-500 text-black"
                  : "bg-red-500"
            )}
          >
            {score}% match
          </Badge>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{event.category}</Badge>
            {highlight && <Badge>Top pick</Badge>}
          </div>
          <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{formatDate(event.date)}</span>
            <span>·</span>
            <span>{event.startTime}</span>
            <span>·</span>
            <span>{distanceKm} km</span>
            <span>·</span>
            <span className="font-medium text-foreground">
              {formatPrice(event.price)}
            </span>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-primary">Why this matches you</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {explanation}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
