import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <ComingSoon
      icon={UsersIcon}
      title="Community"
      description="Discover and clone vocabulary lists shared by other learners. Coming soon."
    />
  );
}
