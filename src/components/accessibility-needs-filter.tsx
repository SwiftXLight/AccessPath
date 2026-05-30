"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/context/locale";
import { ACCESSIBILITY_NEED_GROUPS, type AccessibilityNeed } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AccessibilityNeedsFilterProps {
  selected: AccessibilityNeed[];
  onToggle: (need: AccessibilityNeed) => void;
}

export function AccessibilityNeedsFilter({
  selected,
  onToggle,
}: AccessibilityNeedsFilterProps) {
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.accessibility.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t.accessibility.subtitle}</p>
      </div>

      <div className="space-y-2">
        {ACCESSIBILITY_NEED_GROUPS.map((group) => {
          const expanded = expandedGroups.has(group.id);
          const selectedInGroup = group.options.filter(({ value }) =>
            selected.includes(value)
          ).length;
          const groupTitle = t.accessibility.groups[group.id];

          return (
            <div
              key={group.id}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={expanded}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  expanded
                    ? "bg-secondary/70 text-foreground"
                    : "bg-card text-foreground hover:bg-muted/40"
                )}
              >
                <span className="leading-snug">{groupTitle}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {!expanded && selectedInGroup > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {selectedInGroup}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      expanded && "rotate-180"
                    )}
                  />
                </span>
              </button>

              {expanded && (
                <div className="flex flex-wrap gap-2 border-t border-border bg-card p-3">
                  {group.options.map(({ value }) => {
                    const active = selected.includes(value);
                    const label = t.accessibility.needs[value];
                    return (
                      <button
                        key={`${group.id}-${value}`}
                        type="button"
                        onClick={() => onToggle(value)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-muted/50"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
