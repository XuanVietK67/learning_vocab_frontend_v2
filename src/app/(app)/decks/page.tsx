import type { Metadata } from "next";
import { LayersIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "My Lists" };

export default function DecksPage() {
  return (
    <ComingSoon
      icon={LayersIcon}
      title="My Lists"
      description="Build and organise your own vocabulary lists, set them private or public, and study them anytime. Coming soon."
    />
  );
}
