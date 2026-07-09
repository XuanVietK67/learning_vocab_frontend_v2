import type { Metadata } from "next";
import { UserIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ComingSoon
      icon={UserIcon}
      title="Profile"
      description="Your learning history and activity heatmap will live here. Coming soon."
    />
  );
}
