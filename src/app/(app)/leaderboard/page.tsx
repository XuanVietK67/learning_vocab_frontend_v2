import type { Metadata } from "next";
import { TrophyIcon } from "lucide-react";

import { ComingSoon } from "@/components/app/coming-soon";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <ComingSoon
      icon={TrophyIcon}
      title="Leaderboard"
      description="See how your words-mastered rank stacks up against other learners. The full board lands here soon."
    />
  );
}
