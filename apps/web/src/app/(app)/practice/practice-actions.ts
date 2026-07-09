"use server";

/**
 * Server Actions for the Practice screen. The HTTP client is server-only
 * (httpOnly-cookie tokens), so the interactive client panels reach the backend
 * through here:
 *   - `submitPracticeAttemptAction` — `POST /v1/me/practice/attempts` (async; `202`).
 *   - `pollPracticeAttemptAction`    — `GET …/:id` (client polls with backoff).
 *   - `searchPracticeWordsAction`    — `GET /v1/me/vocabularies?q=` (switch word).
 *   - `listPronunciationScoresAction`— `GET /v1/pronunciation/attempts` (history sparkline).
 *
 * Speak scoring isn't here — it reuses `scorePronunciationAction` from the learn
 * route. See docs/api/practice_submit_sentence.md + pronunciation_score.md.
 */
import { z } from "zod";

import { authedRequest, firstMessage } from "@/lib/api";
import type {
  CatalogueWord,
  PracticeAttempt,
  PracticeSetResult,
  PracticeSuggestions,
  PracticeWord,
  SubmitPracticeResponse,
} from "@/lib/me/practice/types";
import {
  asArray,
  toPracticeWord,
  type RawVocabulary,
} from "@/lib/me/practice/words";
import {
  toCatalogueWord,
  toPracticeItem,
  type RawCatalogVocab,
  type RawPracticeItem,
} from "@/lib/me/practice/queue";

/** Why a Write submission failed, mapped to how the panel should respond. */
export type SubmitFailureKind =
  /** `400`: bad text/modality/id — show the field error. */
  | "validation"
  /** `429`: daily cap reached — render the "come back tomorrow" state. */
  | "quota"
  /** `404`: the target word doesn't exist — re-pick. */
  | "notFound"
  /** `503`: scoring queue down — let them retry shortly. */
  | "serviceDown"
  /** Anything else. */
  | "error";

export type SubmitResult =
  | { ok: true; attemptId: string }
  | { ok: false; kind: SubmitFailureKind; message: string };

export type PollResult =
  | { ok: true; attempt: PracticeAttempt }
  | { ok: false; message: string };

const submitSchema = z.object({
  vocabularyId: z.string().uuid("Pick a saved word to practice."),
  text: z
    .string()
    .trim()
    .min(1, "Write a sentence first.")
    .max(280, "Keep it under 280 characters."),
  modality: z.enum(["writing", "speaking"]).default("writing"),
});

export type SubmitPracticeInput = z.input<typeof submitSchema>;

/** Submit one sentence for async LLM scoring. Returns the queued `attemptId`. */
export async function submitPracticeAttemptAction(
  input: SubmitPracticeInput,
): Promise<SubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      kind: "validation",
      message: parsed.error.issues[0]?.message ?? "Check your sentence and try again.",
    };
  }

  const res = await authedRequest<SubmitPracticeResponse>(
    "/v1/me/practice/attempts",
    { method: "POST", body: JSON.stringify(parsed.data) },
  );

  if (res.ok && res.data) {
    return { ok: true, attemptId: res.data.attemptId };
  }

  const message = firstMessage(res.error);
  switch (res.status) {
    case 400:
      return { ok: false, kind: "validation", message: message ?? "That sentence couldn’t be submitted." };
    case 404:
      return { ok: false, kind: "notFound", message: "That word isn’t available anymore — pick another." };
    case 429:
      return {
        ok: false,
        kind: "quota",
        message: message ?? "You’ve used all your practice sentences for today.",
      };
    case 503:
      return { ok: false, kind: "serviceDown", message: "Scoring is busy right now — try again shortly." };
    default:
      return { ok: false, kind: "error", message: message ?? "Couldn’t submit that sentence. Try again." };
  }
}

/** Poll one attempt for its rubric. The client drives backoff (1.5→3→5s). */
export async function pollPracticeAttemptAction(attemptId: string): Promise<PollResult> {
  if (!z.string().uuid().safeParse(attemptId).success) {
    return { ok: false, message: "That attempt couldn’t be found." };
  }
  const res = await authedRequest<PracticeAttempt>(
    `/v1/me/practice/attempts/${attemptId}`,
    { method: "GET" },
  );
  if (res.ok && res.data) {
    return { ok: true, attempt: res.data };
  }
  return { ok: false, message: firstMessage(res.error) ?? "Couldn’t check that attempt. Try again." };
}

/** Search the caller's saved words for the "Switch word" picker. Empty on error. */
export async function searchPracticeWordsAction(query: string): Promise<PracticeWord[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await authedRequest<unknown>(
    `/v1/me/vocabularies?q=${encodeURIComponent(q)}&limit=8`,
    { method: "GET" },
  );
  if (!res.ok) return [];
  return asArray<RawVocabulary>(res.data)
    .filter((v) => Boolean(v?.id && v?.lemma))
    .map(toPracticeWord);
}

// ── Queue picker (docs/api/practice_pick_words.md) ───────────────────────────

/**
 * Quick start: refetch the suggested queue when the learner changes the count.
 * (The initial set is prefetched on the server by `page.tsx`; this powers the
 * count control.) Empty on error so the hub shows its composed empty state.
 */
export async function getPracticeSuggestionsAction(count: number): Promise<PracticeSuggestions> {
  const safe = Math.min(20, Math.max(1, Math.trunc(count) || 8));
  const res = await authedRequest<{ items?: RawPracticeItem[] | null; usedFallback?: boolean }>(
    `/v1/me/practice/suggestions?count=${safe}`,
    { method: "GET" },
  );
  if (!res.ok || !res.data) return { items: [], usedFallback: false };
  return {
    items: (res.data.items ?? [])
      .filter((it) => Boolean(it?.vocabularyId && it?.lemma))
      .map(toPracticeItem),
    usedFallback: Boolean(res.data.usedFallback),
  };
}

const catalogueFilterSchema = z.object({
  q: z.string().trim().max(64).optional(),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  topic: z.string().trim().max(64).optional(),
  language: z.string().trim().max(16).optional(),
});

export type CatalogueFilter = z.input<typeof catalogueFilterSchema>;

/**
 * Hand-pick: the filterable catalogue checkbox list
 * (`GET /v1/vocabularies`, public — paginated/filterable by `language`,
 * `cefrLevel`, `topic`, `q`). One page of up to 50 rows; empty on error.
 */
export async function searchCatalogueAction(filter: CatalogueFilter): Promise<CatalogueWord[]> {
  const parsed = catalogueFilterSchema.safeParse(filter);
  if (!parsed.success) return [];

  const params = new URLSearchParams({ limit: "50" });
  const { q, cefrLevel, topic, language } = parsed.data;
  if (q) params.set("q", q);
  if (cefrLevel) params.set("cefrLevel", cefrLevel);
  if (topic) params.set("topic", topic);
  if (language) params.set("language", language);

  const res = await authedRequest<unknown>(
    `/v1/vocabularies?${params.toString()}`,
    { method: "GET" },
  );
  if (!res.ok) return [];
  return asArray<RawCatalogVocab>(res.data)
    .filter((v) => Boolean(v?.id && v?.lemma))
    .map(toCatalogueWord);
}

export type ValidateSetResult =
  | { ok: true; result: PracticeSetResult }
  | { ok: false; message: string };

const setSchema = z.object({
  vocabularyIds: z
    .array(z.string().uuid())
    .min(1, "Pick at least one word.")
    .max(50, "You can practise up to 50 words at once."),
});

/**
 * Hand-pick: validate the ticked ids (`POST /v1/me/practice/sets`). Returns the
 * practiceable `items` (in sent order) + `inaccessibleVocabularyIds` for any
 * stale/private/draft words the UI should uncheck and toast.
 */
export async function submitPracticeSetAction(vocabularyIds: string[]): Promise<ValidateSetResult> {
  const parsed = setSchema.safeParse({ vocabularyIds });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Pick 1–50 words." };
  }

  const res = await authedRequest<{
    items?: RawPracticeItem[] | null;
    inaccessibleVocabularyIds?: string[] | null;
  }>("/v1/me/practice/sets", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (res.ok && res.data) {
    return {
      ok: true,
      result: {
        items: (res.data.items ?? [])
          .filter((it) => Boolean(it?.vocabularyId && it?.lemma))
          .map(toPracticeItem),
        inaccessibleVocabularyIds: (res.data.inaccessibleVocabularyIds ?? []).filter(Boolean),
      },
    };
  }

  if (res.status === 400) {
    return { ok: false, message: firstMessage(res.error) ?? "Pick 1–50 words." };
  }
  return { ok: false, message: firstMessage(res.error) ?? "Couldn’t build that set. Try again." };
}

/** One `GET /v1/pronunciation/attempts` history row (subset used for the sparkline). */
interface PronunciationHistoryRow {
  overallScore: number;
  createdAt: string;
}

/**
 * The caller's Speak scores for one word, **oldest-first** for the header
 * sparkline. The endpoint returns newest-first, so we reverse. Empty on error.
 */
export async function listPronunciationScoresAction(vocabularyId: string): Promise<number[]> {
  if (!z.string().uuid().safeParse(vocabularyId).success) return [];
  const res = await authedRequest<{ data?: PronunciationHistoryRow[] }>(
    `/v1/pronunciation/attempts?vocabularyId=${vocabularyId}&limit=20`,
    { method: "GET" },
  );
  if (!res.ok || !res.data?.data) return [];
  return res.data.data
    .map((row) => row.overallScore)
    .filter((s) => typeof s === "number")
    .reverse();
}
