import { Header } from "@/components/header";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Compass, MapPin, Sparkles } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Discover instantly",
    description:
      "Browse local events and always-open places — parks, museums, riversides — from one feed instead of hunting across apps and websites.",
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    description:
      "Get a personalized shortlist with natural-language explanations of why each event fits you.",
  },
  {
    icon: MapPin,
    title: "Filter by lifestyle",
    description:
      "Distance, budget, time of day, interests, and social mode — tuned to how you actually live.",
  },
];

const audiences = ["Residents", "Students", "Tourists", "Families", "Seniors"];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-white to-secondary/60">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(199_89%_48%/0.08),transparent_50%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Badge
              variant="secondary"
              className="mb-4 border-primary/20 bg-primary/10 text-primary"
            >
              Inclusive local discovery
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Discover what&apos;s happening around you
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              AccessPath creates personalized, accessible recommendations
              for local events and always-open places — parks, museums, riversides, and
              more — tailored to your unique lifestyle and preferences.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LinkButton size="lg" href="/profile" className="shadow-sm">
                Build your profile
              </LinkButton>
              <LinkButton size="lg" variant="outline" href="/explore">
                Start exploring
              </LinkButton>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {audiences.map((audience) => (
                <Badge
                  key={audience}
                  variant="outline"
                  className="border-border bg-card/80"
                >
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Why it matters</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Local information is fragmented. People miss events, feel nothing is
              happening, and hidden gems stay hidden.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="rounded-2xl border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-card/60">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to explore your city?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Set your preferences, browse events and places, and let the simulated AI
              assistant explain why each recommendation matches you.
            </p>
            <LinkButton className="mt-6 shadow-sm" size="lg" href="/explore">
              Start exploring
            </LinkButton>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-card py-6 text-center text-sm text-muted-foreground">
        AccessPath · Hackathon MVP · Mock data, no backend
      </footer>
    </>
  );
}
