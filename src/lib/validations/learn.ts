/**
 * Zod schemas for the learn-session Server Actions — the single source of truth
 * for validating client input before it reaches the backend. Re-validated
 * server-side inside the actions. Rules mirror docs/api-endpoints.md §Learn.
 */
import { z } from "zod";

export const sessionModeSchema = z.enum(["daily", "topic", "deck", "review"]);

export const questionTypeSchema = z.enum([
  "flashcard",
  "cloze_mcq",
  "cloze_typing",
  "meaning_in_context",
  "sentence_build",
  "sense_disambiguation",
  "listening_cloze",
]);

/** Body for `POST /v1/me/learn/session`. `translationLang` is injected server-side. */
export const startSessionSchema = z
  .object({
    mode: sessionModeSchema,
    topicSlug: z
      .string()
      .min(2)
      .max(64)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    deckId: z.uuid().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  })
  .refine((v) => v.mode !== "topic" || Boolean(v.topicSlug), {
    message: "topicSlug is required for topic mode.",
    path: ["topicSlug"],
  })
  .refine((v) => v.mode !== "deck" || Boolean(v.deckId), {
    message: "deckId is required for deck mode.",
    path: ["deckId"],
  });

/**
 * Body for `POST /v1/me/learn/answer`: the echoed signed envelope plus the
 * user's answer and latency. `translationLang` is injected server-side.
 */
export const submitAnswerSchema = z.object({
  vocabularyId: z.string().min(1),
  type: questionTypeSchema,
  exampleId: z.string().min(1).nullable(),
  stepIndex: z.number().int().min(0),
  stepCount: z.number().int().min(1),
  userAnswer: z.string().max(1000),
  latencyMs: z.number().int().min(0),
  nonce: z.string().min(1),
  issuedAtMs: z.number().int().nonnegative(),
  signature: z.string().min(1),
  /** Client-side correlation only; the server ignores it for grading. */
  sessionId: z.string().optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
