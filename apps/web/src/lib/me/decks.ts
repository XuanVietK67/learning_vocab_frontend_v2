/**
 * Render-safe read of decks suggested for the caller (matched to their
 * onboarding `targetLanguage` + `proficiencyLevel`). Returns `[]` when
 * unauthenticated, on error, or when the backend has no suggestions.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";
import type { DeckDetail, DeckSummary, Page } from "./types";

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

/** Filters/paging for the community grid (`GET /v1/decks/public`). */
export interface CommunityDecksParams {
  language?: string;
  cefrLevel?: string;
  page?: number;
  limit?: number;
}

/** Empty page shape returned on error/no-results so callers can render an empty state. */
function emptyPage(page = 1, limit = 12): Page<DeckSummary> {
  return { data: [], page, limit, total: 0 };
}

/**
 * Render-safe read of the community catalog (`GET /v1/decks/public`, no auth
 * required) as a full `{ data, page, limit, total }` envelope so the grid can
 * drive its pager from `total`. Filters map straight to `?language=`/`?cefrLevel=`.
 */
export const getCommunityDecks = cache(
  async (params: CommunityDecksParams = {}): Promise<Page<DeckSummary>> => {
    const { language, cefrLevel, page = 1, limit = 12 } = params;
    const token = await getAccessToken();

    const qs = new URLSearchParams();
    if (language && language !== "any") qs.set("language", language);
    if (cefrLevel && cefrLevel !== "any") qs.set("cefrLevel", cefrLevel);
    qs.set("page", String(page));
    qs.set("limit", String(limit));

    const res = await apiRequest<Page<DeckSummary>>(
      `/v1/decks/public?${qs.toString()}`,
      { method: "GET" },
      token,
    );
    return res.ok && res.data ? res.data : emptyPage(page, limit);
  },
);

/**
 * Render-safe read of a single public (or seeded) deck with its ordered words
 * (`GET /v1/decks/:id`, no auth required). Pass `translationLang` to show the
 * viewer's language on each word. Returns `null` on `404` — the deck is private
 * or gone (existence is hidden on purpose), which the page maps to an
 * "unavailable" state.
 */
export const getPublicDeck = cache(
  async (id: string, translationLang?: string): Promise<DeckDetail | null> => {
    const token = await getAccessToken();

    const qs = translationLang ? `?translationLang=${translationLang}` : "";
    const res = await apiRequest<DeckDetail>(
      `/v1/decks/${id}${qs}`,
      { method: "GET" },
      token,
    );
    return res.ok && res.data ? res.data : null;
  },
);
