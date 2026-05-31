"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/context/locale";
import { formatDate } from "@/lib/events";
import { getLocalizedText } from "@/lib/i18n/types";
import type { CommentSource, SourceComment } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SourceCommentsSectionProps {
  comments: SourceComment[];
}

const SOURCE_STYLES: Record<CommentSource, string> = {
  google: "bg-blue-50 text-blue-700 border-blue-200",
  tripadvisor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  facebook: "bg-indigo-50 text-indigo-700 border-indigo-200",
  yelp: "bg-red-50 text-red-700 border-red-200",
  eventbrite: "bg-orange-50 text-orange-700 border-orange-200",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function SourceCommentsSection({ comments }: SourceCommentsSectionProps) {
  const { t, locale } = useTranslation();

  if (comments.length === 0) return null;

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="font-semibold">{t.detail.sourceCommentsTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.detail.sourceCommentsSubtitle}</p>
      </div>
      <div className="space-y-3">
        {comments.map((comment, index) => (
          <article
            key={`${comment.source}-${comment.author}-${index}`}
            className="rounded-xl border bg-muted/20 p-4 shadow-sm"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <Badge
                variant="outline"
                className={cn("font-medium", SOURCE_STYLES[comment.source])}
              >
                {t.detail.commentSources[comment.source]}
              </Badge>
              {comment.rating != null && <StarRating rating={comment.rating} />}
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {getLocalizedText(comment.text, locale)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {comment.author} · {formatDate(comment.date, locale)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
