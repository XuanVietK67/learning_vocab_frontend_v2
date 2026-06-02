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
  visibility: VocabVisibility;
  isApproved: boolean;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  senses: AdminSense[];
  topics: Topic[];
}

/** Query params accepted by `GET /v1/admin/vocabularies` (all optional). */
export interface AdminVocabularyFilters {
  language?: string;
  cefrLevel?: CefrLevel;
  topic?: string;
  q?: string;
  source?: VocabSource;
  isApproved?: boolean;
  visibility?: VocabVisibility;
  createdByUserId?: string;
  translationLang?: string;
  sortBy?: "createdAt" | "frequencyRank";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}
