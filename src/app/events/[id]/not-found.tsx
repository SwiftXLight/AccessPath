import { Header } from "@/components/header";
import { LinkButton } from "@/components/link-button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="text-5xl" aria-hidden>
          🗺️
        </span>
        <h1 className="mt-4 text-2xl font-bold">Event not found</h1>
        <p className="mt-2 text-muted-foreground">
          This event may have ended or the link is incorrect.
        </p>
        <LinkButton className="mt-6" href="/explore">
          Browse events
        </LinkButton>
      </main>
    </>
  );
}
