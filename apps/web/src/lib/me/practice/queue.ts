/**
 * Render-safe reads + raw projections for the practice **queue picker**
 * (docs/api/practice_pick_words.md). The two doors return the same lean
 * {@link PracticeItem}:
 *   - `getPracticeSuggestions(count)` — Quick start (`GET /v1/me/practice/suggestions`).
 *   - the hand-pick catalogue (`GET /v1/vocabularies`) and set validation
 *     (`POST /v1/me/practice/sets`) are driven from Server Actions; their raw
 *     projections (`toPracticeItem`, `toCatalogueWord`) live here so both the
 *     render-safe read and the actions share one mapping.
 *
 * Like {@link import("./words")}, the read uses `apiRequest` with an explicit
 * token and degrades to an empty result rather than throwing, so a cold backend
 * (or a not-yet-onboarded learner) lands on the hub's composed empty state.
 */
import type { CefrLevel } from "@/lib/auth/types";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/session";
import type { CatalogueWord, PracticeItem, PracticeSuggestions } from "./types";

/** Raw `PracticeItem` as it arrives on the wire (fields may be absent/null). */
export interface RawPracticeItem {
  vocabularyId?: string | null;
  lemma?: string | null;
  partOfSpeech?: string | null;
  ipa?: string | null;
  audioUrl?: string | null;
  glosses?: string[] | null;
}

/** Raw `GET /v1/vocabularies` row — only the fields the picker projects. */
export interface RawCatalogVocab {
  id?: string | null;
  lemma?: string | null;
  partOfSpeech?: string | null;
  cefrLevel?: CefrLevel | null;
  senses?: { gloss?: string | null; definition?: string | null }[] | null;
}

/** Project a wire item to a {@link PracticeItem}, capping glosses at 5 (most-salient first). */
export function toPracticeItem(raw: RawPracticeItem): PracticeItem {
  return {
    vocabularyId: String(raw.vocabularyId),
    lemma: String(raw.lemma),
    partOfSpeech: raw.partOfSpeech ?? null,
    ipa: raw.ipa ?? null,
    audioUrl: raw.audioUrl ?? null,
    glosses: Array.isArray(raw.glosses)
      ? raw.glosses.filter((g): g is string => Boolean(g)).slice(0, 5)
      : [],
  };
}

/** Project a catalogue row to a hand-pick {@link CatalogueWord} (display fields only). */
export function toCatalogueWord(raw: RawCatalogVocab): CatalogueWord {
  const sense = raw.senses?.[0];
  return {
    vocabularyId: String(raw.id),
    lemma: String(raw.lemma),
    partOfSpeech: raw.partOfSpeech ?? null,
    cefrLevel: raw.cefrLevel ?? null,
    gloss: sense?.gloss ?? sense?.definition ?? null,
  };
}

/** A topic tag for the hand-pick filter row (`GET /v1/topics`). */
export interface PickTopic {
  slug: string;
  name: string;
}

/** The curated topic taxonomy for the hand-pick filters. Public, unpaginated; empty on error. */
export async function getPracticeTopics(): Promise<PickTopic[]> {
  const res = await apiRequest<{ slug?: string | null; name?: string | null }[]>(
    "/v1/topics",
    { method: "GET" },
  );
  if (!res.ok || !res.data) return [];
  return res.data
    .filter((t) => Boolean(t?.slug && t?.name))
    .map((t) => ({ slug: String(t.slug), name: String(t.name) }));
}

const EMPTY_SUGGESTIONS: PracticeSuggestions = { items: [], usedFallback: false };

/**
 * Quick start: up to `count` words to practise. `count` is clamped to the
 * server's 1–20 range. Empty (never throwing) when unauthenticated, not
 * onboarded (`400`), or the backend is cold — the hub renders its composed
 * empty state from that.
 */
export async function getPracticeSuggestions(count = 8): Promise<PracticeSuggestions> {
  const token = await getAccessToken();
  if (!token) return EMPTY_SUGGESTIONS;

  const safe = Math.min(20, Math.max(1, Math.trunc(count) || 8));
  const res = await apiRequest<{ items?: RawPracticeItem[] | null; usedFallback?: boolean }>(
    `/v1/me/practice/suggestions?count=${safe}`,
    { method: "GET" },
    token,
  );
  if (!res.ok || !res.data) return EMPTY_SUGGESTIONS;

  return {
    items: (res.data.items ?? [])
      .filter((it) => Boolean(it?.vocabularyId && it?.lemma))
      .map(toPracticeItem),
    usedFallback: Boolean(res.data.usedFallback),
  };
}
