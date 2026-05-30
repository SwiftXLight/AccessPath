import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { EventDetailView } from "@/components/event-detail-view";
import { getEventById } from "@/lib/events";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <>
      <Header />
      <EventDetailView event={event} />
    </>
  );
}
