import type { Metadata } from "next";
import { CompassIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <ComingSoon
      icon={CompassIcon}
      title="Explore"
      description="Browse the catalog of curated vocabulary lists, topics, and words picked for your level. Coming soon."
    />
  );
}
