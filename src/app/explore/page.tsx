import { Header } from "@/components/header";
import { ExploreView } from "@/components/explore-view";

export default function ExplorePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ExploreView />
      </main>
    </>
  );
}
