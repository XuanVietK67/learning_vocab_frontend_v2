/**
 * Render-safe read of decks suggested for the caller (matched to their
 * onboarding `targetLanguage` + `proficiencyLevel`). Returns `[]` when
 * unauthenticated, on error, or when the backend has no suggestions.
 */
import { cache } from "react";

import { apiRequest } from "../api";
import { getAccessToken } from "../auth/session";
import type { DeckSummary } from "./types";

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
