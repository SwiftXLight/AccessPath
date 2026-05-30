import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { PlaceDetailView } from "@/components/place-detail-view";
import { getPlaceById } from "@/lib/places";

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = getPlaceById(id);

  if (!place) {
    notFound();
  }

  return (
    <>
      <Header />
      <PlaceDetailView place={place} />
    </>
  );
}
