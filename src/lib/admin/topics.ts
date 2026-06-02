/**
 * Render-safe read of the topic catalog (`GET /v1/topics`, public — no auth).
 * The set is small and unpaginated. Cached per request; used to populate the
 * topic filter on the admin vocab list and (later) the admin topics page.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import type { Topic } from "./types";

export const getTopics = cache(async (): Promise<Topic[]> => {
  const res = await apiRequest<Topic[]>("/v1/topics", { method: "GET" });
  return res.ok && res.data ? res.data : [];
});
