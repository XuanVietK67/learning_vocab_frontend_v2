/**
 * Render-safe read of decks suggested for the caller (matched to their
 * onboarding `targetLanguage` + `proficiencyLevel`). Returns `[]` when
 * unauthenticated, on error, or when the backend has no suggestions.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";
import type { DeckDetail, DeckSummary } from "./types";

export const getSuggestedDecks = cache(async (): Promise<DeckSummary[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await apiRequest<DeckSummary[]>(
    "/v1/me/decks/suggested",
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data : [];
});

/**
 * Render-safe read of the caller's own decks (`GET /v1/me/decks`, newest
 * first). Returns the first page's summaries — enough to populate the deck
 * picker on the learn screen. Returns `[]` when unauthenticated or on error.
 */
export const getMyDecks = cache(async (): Promise<DeckSummary[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await apiRequest<{ data: DeckSummary[] }>(
    "/v1/me/decks?limit=100",
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data.data : [];
});

/**
 * Render-safe read of one of the caller's own decks with its ordered words
 * (`GET /v1/me/decks/:id`). Returns `null` when unauthenticated, not found, or
 * not owned by the caller (403) — the page maps that to `notFound()`.
 */
export const getDeck = cache(async (id: string): Promise<DeckDetail | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<DeckDetail>(
    `/v1/me/decks/${id}`,
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data : null;
});

/**
 * Render-safe read of community-published decks (`GET /v1/decks/public`, no
 * auth required) for the home's "Trending shared lists" rail. Returns the first
 * page; `[]` on error.
 */
export const getPublicDecks = cache(async (): Promise<DeckSummary[]> => {
  const token = await getAccessToken();

  const res = await apiRequest<{ data: DeckSummary[] }>(
    "/v1/decks/public?limit=20",
    { method: "GET" },
    token,
  );
  return res.ok && res.data ? res.data.data : [];
});
