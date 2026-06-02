/**
 * Zod schemas for the admin vocabulary forms — the single source of truth for
 * validation, re-checked on the server inside the actions. Rules mirror
 * docs/frontend_handoff.md (`POST /v1/admin/vocabularies`, `PATCH /:id`).
 */
import { z } from "zod";

const LANGUAGE_RE = /^[a-z]{2}(-[A-Z]{2})?$/; // ISO 639-1, optional region
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/** Treat empty/whitespace-only form values as "absent". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/**
 * Create a new system vocabulary with a single seed sense. The richer sense
 * tree (extra senses, multiple translations/examples) is built afterwards in
 * the detail editor via the sub-resource endpoints.
 */
export const createVocabularySchema = z
  .object({
    language: z.string().regex(LANGUAGE_RE, "Choose a language."),
    lemma: z.string().trim().min(1, "Lemma is required.").max(128),
    partOfSpeech: z
      .string()
      .trim()
      .min(1, "Part of speech is required.")
      .max(32),
    ipa: optionalText(64),
    cefrLevel: z.enum(CEFR).optional(),
    gloss: optionalText(128),
    definition: optionalText(512),
    translationLang: z
      .string()
      .regex(LANGUAGE_RE, "Use a valid language code.")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    translation: optionalText(256),
    exampleSentence: optionalText(512),
  })
  .refine((v) => !v.translation || Boolean(v.translationLang), {
    path: ["translationLang"],
    message: "Pick a language for the translation.",
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
