"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/explore", label: "Discover" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary shadow-sm transition-colors group-hover:bg-primary/90">
            <MapPin className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            AccessPath
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <LinkButton
                key={href}
                variant="ghost"
                size="sm"
                href={href}
                className={cn(
                  "rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                )}
              >
                {label}
              </LinkButton>
            );
          })}
          <LinkButton size="sm" href="/explore" className="ml-2 shadow-sm">
            Ask AI
          </LinkButton>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          {navItems.map(({ href, label }) => (
            <LinkButton
              key={href}
              variant="ghost"
              size="sm"
              href={href}
              className={cn(
                "px-2 text-muted-foreground",
                pathname === href && "text-primary"
              )}
            >
              {label.split(" ")[0]}
            </LinkButton>
          ))}
        </div>
      </div>
    </header>
  );
}
