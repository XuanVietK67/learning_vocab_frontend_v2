/**
 * Zod schemas for the admin vocabulary forms — the single source of truth for
 * validation, re-checked on the server inside the actions. Rules mirror
 * docs/frontend_handoff.md (`POST /v1/admin/vocabularies`, `PATCH /:id`).
 */
import { z } from "zod";

import { PARTS_OF_SPEECH } from "@/lib/admin/types";

const LANGUAGE_RE = /^[a-z]{2}(-[A-Z]{2})?$/; // ISO 639-1, optional region
const TOPIC_SLUG_RE = /^[a-z0-9-]+$/;
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/** Treat empty/whitespace-only form values as "absent". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** A translation row inside a sense (`senses[].translations[]`). */
const senseTranslationSchema = z.object({
  language: z.string().regex(LANGUAGE_RE, "Use a valid language code."),
  translation: z.string().trim().min(1, "Translation is required.").max(255),
  note: optionalText(2000),
});

/** An example row inside a sense (`senses[].examples[]`). */
const senseExampleSchema = z.object({
  sentence: z.string().trim().min(1, "Example sentence is required.").max(1000),
  translation: optionalText(1000),
});

/**
 * One sense in the create payload, with its own image, synonyms/antonyms,
 * translations, and examples. Mirrors the `senses[]` rules in
 * docs/admin_create_vocabulary.md — notably the **2-example minimum** (the
 * extra example is held out as a hidden test sentence by the learning module).
 */
const senseDraftSchema = z.object({
  gloss: optionalText(128),
  definition: optionalText(2000),
  imageUrl: z
    .union([z.literal(""), z.url("Enter a valid image URL.").max(512)])
    .optional()
    .transform((v) => (v ? v : undefined)),
  synonyms: z.array(z.string().trim().min(1).max(64)).max(32).default([]),
  antonyms: z.array(z.string().trim().min(1).max(64)).max(32).default([]),
  translations: z.array(senseTranslationSchema).max(16).default([]),
  examples: z
    .array(senseExampleSchema)
    .min(2, "Each sense needs at least 2 examples.")
    .max(16),
});

/**
 * Create a new system vocabulary with its full sense tree in one atomic request
 * (`POST /v1/admin/vocabularies`). The client builds the nested draft, serializes
 * it to JSON, and the Server Action re-validates with this schema before sending.
 */
export const createVocabularySchema = z.object({
  language: z.string().regex(LANGUAGE_RE, "Choose a language."),
  lemma: z.string().trim().min(1, "Lemma is required.").max(128),
  partOfSpeech: z.enum(PARTS_OF_SPEECH, {
    message: "Choose a part of speech.",
  }),
  ipa: optionalText(128),
  cefrLevel: z.enum(CEFR).optional(),
  frequencyRank: z.number().int().min(0).optional(),
  topics: z
    .array(z.string().regex(TOPIC_SLUG_RE, "Invalid topic slug."))
    .max(32)
    .default([]),
  senses: z.array(senseDraftSchema).min(1, "Add at least one sense.").max(16),
});

/** Patch the top-level fields of an existing vocabulary (`PATCH /:id`). */
export const vocabularyFieldsSchema = z.object({
  language: z.string().regex(LANGUAGE_RE, "Choose a language."),
  lemma: z.string().trim().min(1, "Lemma is required.").max(128),
  partOfSpeech: z.string().trim().min(1, "Part of speech is required.").max(32),
  ipa: optionalText(64),
  cefrLevel: z.enum(CEFR).optional(),
  frequencyRank: z
    .union([z.literal(""), z.coerce.number().int().min(0)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
  audioUrl: z
    .union([z.literal(""), z.url("Enter a valid URL.").max(2048)])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

/** Add or patch a sense — gloss / definition / imageUrl (all optional). */
export const senseSchema = z.object({
  gloss: optionalText(128),
  definition: optionalText(512),
  imageUrl: z
    .union([z.literal(""), z.url("Enter a valid URL.").max(2048)])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

/** Add a translation to a sense (`POST …/translations`). */
export const translationSchema = z.object({
  language: z.string().regex(LANGUAGE_RE, "Choose a language."),
  translation: z.string().trim().min(1, "Translation is required.").max(256),
  note: optionalText(256),
});

/** Add an example to a sense (`POST …/examples`). */
export const exampleSchema = z.object({
  sentence: z.string().trim().min(1, "Sentence is required.").max(512),
  translation: optionalText(512),
  source: optionalText(32),
});

// ── Bulk import (`POST /v1/admin/vocabularies/bulk-import`) ──────────────────
// Validates the pasted/uploaded item tree before sending. The backend is the
// final authority (it rejects unknown fields), so this stays lenient but checks
// the shape that commonly trips people up: required keys and array bounds.

const importTranslation = z.object({
  language: z.string().regex(LANGUAGE_RE, "translation.language must be an ISO code"),
  translation: z.string().min(1),
  note: z.string().optional(),
  source: z.string().optional(),
});

const importExample = z.object({
  sentence: z.string().min(1),
  translation: z.string().optional(),
  source: z.string().optional(),
});

const importSense = z.object({
  gloss: z.string().optional(),
  definition: z.string().optional(),
  imageUrl: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  translations: z.array(importTranslation).optional(),
  examples: z.array(importExample).optional(),
});

const importItem = z.object({
  language: z.string().regex(LANGUAGE_RE, "language must be an ISO code"),
  lemma: z.string().min(1, "lemma is required"),
  partOfSpeech: z.string().min(1, "partOfSpeech is required"),
  ipa: z.string().optional(),
  cefrLevel: z.enum(CEFR).optional(),
  audioUrl: z.string().optional(),
  topics: z.array(z.string()).optional(),
  senses: z.array(importSense).min(1, "each item needs at least one sense").max(16),
});

export const bulkImportSchema = z.object({
  items: z
    .array(importItem)
    .min(1, "Provide at least one item")
    .max(500, "At most 500 items per import"),
});

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type VocabularyFieldsInput = z.infer<typeof vocabularyFieldsSchema>;
export type SenseInput = z.infer<typeof senseSchema>;
export type TranslationInput = z.infer<typeof translationSchema>;
export type ExampleInput = z.infer<typeof exampleSchema>;
