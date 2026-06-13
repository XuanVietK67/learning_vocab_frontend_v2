/**
 * Render-safe reads that source the **target word(s)** a Practice session is
 * anchored to. Two entry points used by the server `page.tsx`:
 *   - `getPracticeWords()` — the hub's due-word list (`GET /v1/me/progress/due`).
 *   - `getPracticeWord(id)` — a single word for the `?word=` deep-link
 *     (`GET /v1/me/vocabularies/:id`).
 *
 * Both use `apiRequest` with an explicit token (never `authedRequest`, which is
 * Server-Action-only) and degrade to an empty result rather than throwing, so a
 * cold/erroring backend lands the user on the hub instead of a blank screen.
 */
import { apiRequest } from "../../api";
import { getAccessToken } from "../../auth/session";
import type { PracticeWord } from "./types";

/** Minimal sense subset we read a gloss from (mirrors the API sense tree). */
interface RawSense {
  gloss?: string | null;
  definition?: string | null;
  translations?: { translation?: string | null }[] | null;
}

/** Minimal vocabulary subset we project to a {@link PracticeWord}. */
export interface RawVocabulary {
  id: string;
  lemma: string;
  ipa?: string | null;
  audioUrl?: string | null;
  partOfSpeech?: string | null;
  senses?: RawSense[] | null;
}

/** One `GET /v1/me/progress/due` row: the progress fields + its full vocabulary. */
interface DueCard {
  vocabulary?: RawVocabulary | null;
}

/** Pick the most human gloss available on the first sense. */
function glossOf(vocab: RawVocabulary): string | null {
  const sense = vocab.senses?.[0];
  if (!sense) return null;
  return (
    sense.gloss ??
    sense.definition ??
    sense.translations?.[0]?.translation ??
    null
  );
}

export function toPracticeWord(vocab: RawVocabulary): PracticeWord {
  return {
    vocabularyId: vocab.id,
    lemma: vocab.lemma,
    ipa: vocab.ipa ?? null,
    audioUrl: vocab.audioUrl ?? null,
    pos: vocab.partOfSpeech ?? null,
    gloss: glossOf(vocab),
  };
}

/** Narrow an unknown list payload to its array, tolerating `{ data: [] }` or a bare array. */
export function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

/** The hub's candidate words: due cards, oldest-due first. Empty on error. */
export async function getPracticeWords(limit = 20): Promise<PracticeWord[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await apiRequest<unknown>(
    `/v1/me/progress/due?limit=${limit}`,
    { method: "GET" },
    token,
  );
  if (!res.ok) return [];

  return asArray<DueCard>(res.data)
    .map((card) => card.vocabulary)
    .filter((v): v is RawVocabulary => Boolean(v?.id && v?.lemma))
    .map(toPracticeWord);
}

/** One word by id for the deep-link entry. Null when missing/unauthorised/error. */
export async function getPracticeWord(id: string): Promise<PracticeWord | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiRequest<RawVocabulary>(
    `/v1/me/vocabularies/${encodeURIComponent(id)}`,
    { method: "GET" },
    token,
  );
  if (!res.ok || !res.data?.id) return null;
  return toPracticeWord(res.data);
}
