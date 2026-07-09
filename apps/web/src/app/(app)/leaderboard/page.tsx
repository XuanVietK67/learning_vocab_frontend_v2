import type { Metadata } from "next";

import { getMe } from "@/lib/auth/me";
import { getLeaderboard } from "@/lib/me/leaderboard";

import { LeaderboardScreen } from "./leaderboard-screen";

export const metadata: Metadata = { title: "Leaderboard" };

/**
 * `/leaderboard` — the words-mastered (all-time) board. The board + the caller's
 * identity (for the pinned "you" row and the opted-out prompt) load in parallel;
 * `getMe` is already cached by the (app) layout, so it's a free reuse. A null
 * board renders the screen's calm error state.
 */
export default async function LeaderboardPage() {
  const [board, user] = await Promise.all([getLeaderboard(), getMe()]);

  return <LeaderboardScreen board={board} user={user} />;
}
