/**
 * Shapes for the admin read surface (`/v1/admin/*`, plus the public `/v1/topics`
 * catalog used to populate filters). Mirrors docs/frontend_handoff.md — keep in
 * sync when the backend contract changes.
 */
import type { CefrLevel } from "@/lib/auth/types";

/** Whether a word came from the curated catalog or a user submission. */
export type VocabSource = "system" | "user";

/** Visibility scope of a vocabulary row. */
export type VocabVisibility = "system" | "private" | "public";

/** Ordered list of CEFR levels for selects/filters. */
export const CEFR_LEVELS: readonly CefrLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

/** Allowed `partOfSpeech` values (`POST /v1/admin/vocabularies` enum). */
export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "phrase",
  "other",
] as const;

export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];

/** Standard `{ data, page, limit, total }` envelope from list endpoints. */
export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

/** A topic tag — `GET /v1/topics`, also nested on vocabularies. */
export interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export interface AdminTranslation {
  id: string;
  language: string;
  translation: string;
  note: string | null;
  source?: string | null;
}

export interface AdminExample {
  id: string;
  sentence: string;
  translation: string | null;
  source: string | null;
}

export interface AdminSense {
  id: string;
  senseOrder: number;
  gloss: string | null;
  definition: string | null;
  imageUrl: string | null;
  synonyms?: string[];
  antonyms?: string[];
  translations: AdminTranslation[];
  examples: AdminExample[];
}

/** A vocabulary row with admin-only fields inlined — `GET /v1/admin/vocabularies`. */
export interface AdminVocabulary {
  id: string;
  language: string;
  lemma: string;
  partOfSpeech: string;
  ipa: string | null;
  cefrLevel: CefrLevel | null;
  frequencyRank: number | null;
  audioUrl: string | null;
  source: VocabSource;
  /** Representative thumbnail — `images[0] ?? null`. */
  imageUrl: string | null;
  /** All distinct sense images, in `senseOrder`. Empty when none. */
  images: string[];
  visibility: VocabVisibility;
  isApproved: boolean;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  senses: AdminSense[];
  topics: Topic[];
}

/** Background dictionary-enrichment state on a vocabulary, or null. */
export type EnrichmentStatus = "pending" | "enriched" | "failed" | null;

/**
 * A single vocabulary with its full sense tree — the shape returned by the
 * public `GET /v1/vocabularies/:id`. Admin-only fields (visibility, isApproved,
 * createdByUserId) are absent here; the admin editor only mutates the fields
 * below, so the public read is sufficient for `source="system"` words.
 */
export interface VocabularyDetail {
  id: string;
  language: string;
  lemma: string;
  partOfSpeech: string;
  ipa: string | null;
  cefrLevel: CefrLevel | null;
  frequencyRank: number | null;
  audioUrl: string | null;
  source: VocabSource;
  enrichmentStatus: EnrichmentStatus;
  senses: AdminSense[];
  topics: Topic[];
}

/** Result returned by admin mutation Server Actions (consumed via useActionState). */
export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Counts returned by `POST /v1/admin/vocabularies/bulk-import`. */
export interface BulkImportSummary {
  upserted: number;
  inserted: number;
  updated: number;
  sensesAdded: number;
  translationsAdded: number;
  examplesAdded: number;
  topicLinksAdded: number;
}

/** Result of the bulk-import action — carries the summary on success. */
export interface ImportResult extends ActionResult {
  summary?: BulkImportSummary;
}

// ── AI-assisted quick-create (single + bulk) ─────────────────────────────────

/** Lifecycle of a single-word enrichment job. */
export type QuickJobStatus = "pending" | "completed" | "failed";

/**
 * An async enrichment job — `POST /v1/admin/vocabularies/quick` then polled with
 * `GET …/quick/:jobId`. One submitted lemma can yield several drafts (one per
 * part of speech), so `resultVocabularyIds` is always a list.
 */
export interface QuickJob {
  id: string;
  lemma: string;
  language: string;
  status: QuickJobStatus;
  resultVocabularyIds: string[];
  error: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Counts the bulk extractor reports for a candidate list. */
export interface ExtractStats {
  /** Raw tokens/cells found. */
  extracted: number;
  /** Duplicates collapsed (case-insensitive). */
  deduped: number;
  /** Common words dropped — prose mode only. */
  removedStopwords: number;
  /** Candidates already in the catalog, removed. */
  alreadyInCatalog: number;
  /** True if the list was truncated to 1000. */
  capped: boolean;
}

/** Result of `POST …/quick/extract` — candidate lemmas + extractor stats. */
export interface ExtractResult {
  lemmas: string[];
  stats: ExtractStats;
}

/** Source-reading mode for bulk extract. */
export type ExtractMode = "list" | "prose";

/** Result of `POST …/quick/bulk` — a batch id plus accepted/skipped counts. */
export interface BulkSubmitResult {
  /** `null` when every lemma was skipped (nothing new to enrich). */
  batchId: string | null;
  accepted: number;
  skipped: number;
}

/** Progress snapshot from `GET …/quick/batch/:batchId`; drafts fill gradually. */
export interface BatchStatus {
  batchId: string;
  total: number;
  pending: number;
  completed: number;
  failed: number;
  resultVocabularyIds: string[];
}

/** Discriminated result for imperatively-invoked (non-form) Server Actions. */
export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Query params accepted by `GET /v1/admin/vocabularies` (all optional). */
export interface AdminVocabularyFilters {
  language?: string;
  cefrLevel?: CefrLevel;
  topic?: string;
  q?: string;
  source?: VocabSource;
  isApproved?: boolean | string; // support "true"/"false" for URL params
  visibility?: VocabVisibility;
  createdByUserId?: string;
  translationLang?: string;
  sortBy?: "createdAt" | "frequencyRank";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}
