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

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type VocabularyFieldsInput = z.infer<typeof vocabularyFieldsSchema>;
export type SenseInput = z.infer<typeof senseSchema>;
export type TranslationInput = z.infer<typeof translationSchema>;
export type ExampleInput = z.infer<typeof exampleSchema>;
