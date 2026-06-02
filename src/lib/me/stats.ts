/**
 * Render-safe read of the caller's home-screen stats. Same single-attempt,
 * no-refresh contract as `getMe` (safe during Server Component render); returns
 * `null` when unauthenticated or the request fails. Cached per request.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";
import type { StatsResponse } from "./types";

export const getStats = cache(async (): Promise<StatsResponse | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<StatsResponse>("/v1/me/stats", { method: "GET" }, token);
  return res.ok ? res.data : null;
});
