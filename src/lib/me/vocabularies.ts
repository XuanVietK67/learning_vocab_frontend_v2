/**
 * Render-safe read of the caller's personal vocabulary count for the home's
 * "My Words" tile. Asks for a single row and reads the `total` from the
 * standard paginated envelope. Returns `0` when unauthenticated or on error.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";

export const getWordsCount = cache(async (): Promise<number> => {
  const token = await getAccessToken();
  if (!token) return 0;

  const res = await apiRequest<{ total: number }>(
    "/v1/me/vocabularies?limit=1",
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data.total : 0;
});
