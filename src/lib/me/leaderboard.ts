/**
 * Render-safe read of the caller's own leaderboard standing for the home's
 * rank teaser (§6.2). Reads only `me` from the words-mastered all-time board —
 * the full top-N list belongs to the `/leaderboard` screen. `rank` is `null`
 * when the user has no qualifying activity or has opted out, which hides the
 * teaser. Degrades to `{ rank: null }` on error so the hero never blocks on it.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";

export interface MyRank {
  rank: number | null;
  value: number;
}

export const getMyRank = cache(async (): Promise<MyRank> => {
  const token = await getAccessToken();
  if (!token) return { rank: null, value: 0 };

  const res = await apiRequest<{ me: MyRank }>(
    "/v1/leaderboard?metric=words_mastered&window=all&limit=1",
    { method: "GET" },
    token,
  );
  return res.ok && res.data?.me ? res.data.me : { rank: null, value: 0 };
});
