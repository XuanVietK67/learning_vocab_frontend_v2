import type { Metadata } from "next";
import { SettingsIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={SettingsIcon}
      title="Settings"
      description="Edit your languages, level, daily goal, and leaderboard visibility. Coming soon."
    />
  );
}
