/**
 * Shapes for the authenticated `/v1/me` read surface used by the dashboard.
 * Mirrors docs/api/frontend_handoff.md — keep in sync with the backend contract.
 */
import type { CefrLevel } from "@/lib/auth/types";

/** Per-status card tallies from `GET /v1/me/stats`. */
export interface StatsCounts {
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

/** Home-screen snapshot — `GET /v1/me/stats`. */
export interface StatsResponse {
  streakDays: number;
  dueNow: number;
  reviewedToday: number;
  dailyGoalMinutes: number;
  counts: StatsCounts;
  /** ISO timestamp of the soonest future-scheduled card, or null. */
  nextDueAt: string | null;
}

/**
 * A deck's visibility. `system` = seeded catalog deck (owner-less); `private` /
 * `public` = a user deck the author keeps to themselves or has shared.
 */
export type DeckVisibility = "system" | "public" | "private";

/** Summary card for a deck — `GET /v1/me/decks/suggested`, `GET /v1/decks`. */
export interface DeckSummary {
  id: string;
  name: string;
  description: string | null;
  language: string;
  cefrLevel: CefrLevel | null;
  vocabCount: number;
  /** Drives the badge + share controls; pairs with `ownerId` to tell deck kinds apart. */
  visibility: DeckVisibility;
  /** `null` for seeded decks; the author's user id otherwise. Ownership = `ownerId === me`. */
  ownerId: string | null;
  /** Author handle on community cards, when the API exposes it. */
  author?: string | null;
}

// ── My Words (`GET /v1/me/vocabularies`) ─────────────────────────────────────
// The learner's own private words (`source: "user"`), authored via quick-create
// or the manual full form. The list inlines each word's senses; the row UI
// derives a gloss + translation from the first sense.

/** One translation under a sense. */
export interface MyTranslation {
  language: string;
  translation: string;
  note: string | null;
}

/** One example sentence under a sense. */
export interface MyExample {
  sentence: string;
  translation: string | null;
}

/** One sense of a word, with its translations and examples inlined. */
export interface MySense {
  id: string;
  senseOrder: number;
  gloss: string | null;
  definition: string | null;
  imageUrl: string | null;
  synonyms: string[];
  antonyms: string[];
  translations: MyTranslation[];
  examples: MyExample[];
}

/** Minimal topic tag as inlined on a word. */
export interface MyTopicRef {
  slug: string;
  name: string;
}

/**
 * A word the caller owns — `GET /v1/me/vocabularies` (list) and
 * `GET /v1/me/vocabularies/:id` (detail). `audioUrl` lands after creation (a
 * separate queue), so render the word immediately and light the speaker later.
 */
export interface MyWord {
  id: string;
  language: string;
  lemma: string;
  partOfSpeech: string;
  ipa: string | null;
  cefrLevel: CefrLevel | null;
  frequencyRank: number | null;
  audioUrl: string | null;
  source: "user" | "system";
  enrichmentStatus: "pending" | "enriched" | "failed" | null;
  senses: MySense[];
  topics: MyTopicRef[];
  createdAt?: string;
}

/** Standard `{ data, page, limit, total }` list envelope. */
export interface Page<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

/** One of the caller's decks with its ordered words — `GET /v1/me/decks/:id`. */
export interface DeckDetail extends DeckSummary {
  vocabularies: MyWord[];
}
