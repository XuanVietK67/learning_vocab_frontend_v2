/**
 * Render-safe reads of the caller's personal vocabulary (`GET /v1/me/vocabularies`).
 * Used by the home "My Words" tile (count only) and the `/words` screen (the
 * list itself). All return safe empties when unauthenticated or on error.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";
import type { MyWord, Page } from "./types";

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

const EMPTY_WORDS: Page<MyWord> = { data: [], page: 1, limit: 50, total: 0 };

/**
 * List the caller's own words, newest first (`source: "user"`). `q` is a lemma
 * prefix filter applied server-side. Returns the standard list envelope.
 */
export const getMyWords = cache(
  async (opts: { q?: string; page?: number; limit?: number } = {}): Promise<Page<MyWord>> => {
    const token = await getAccessToken();
    if (!token) return EMPTY_WORDS;

    const params = new URLSearchParams({
      page: String(opts.page ?? 1),
      limit: String(opts.limit ?? 50),
    });
    if (opts.q?.trim()) params.set("q", opts.q.trim());

    const res = await apiRequest<Page<MyWord>>(
      `/v1/me/vocabularies?${params.toString()}`,
      { method: "GET" },
      token,
    );
    return res.ok && res.data ? res.data : EMPTY_WORDS;
  },
);

/** Fetch one of the caller's words with its full sense tree, or `null`. */
export const getMyWord = cache(async (id: string): Promise<MyWord | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<MyWord>(
    `/v1/me/vocabularies/${id}`,
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data : null;
});
