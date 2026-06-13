/**
 * Shapes for word-anchored open-production practice (`/v1/me/practice/*`).
 * Mirrors docs/api/practice_submit_sentence.md — keep in sync when the backend
 * contract changes.
 *
 * The learner writes (or dictates) a sentence using a target word; an LLM judge
 * scores it **asynchronously**: submit returns `202` with an `attemptId`, then
 * the client polls `GET …/:id` until `status` is `scored` or `failed`. The
 * Speak half of the Practice screen reuses the acoustic pronunciation contract
 * in {@link import("../pronunciation/types").PronunciationScore} instead.
 */
import type { CefrLevel } from "@/lib/auth/types";

/** How the sentence was produced. Scoring is identical for both. */
export type PracticeModality = "writing" | "speaking";

/** Lifecycle of a scoring attempt. */
export type PracticeAttemptStatus = "pending" | "scored" | "failed";

/** The four neutral 0–5 rubric axes (NOT the 0–100 band scale). */
export interface PracticeCriteria {
  grammar: number;
  wordUsage: number;
  naturalness: number;
  relevance: number;
}

/** Full LLM rubric, present only once `status === "scored"`. */
export interface PracticeRubric {
  /** Roll-up of `criteria`, 0–100. */
  overall: number;
  usesTargetWord: boolean;
  correctUsage: boolean;
  criteria: PracticeCriteria;
  /** Level this one sentence demonstrates — NOT the learner's proficiency. */
  cefr: CefrLevel;
  feedback: string;
  /** An improved version; omitted by the backend when already good. */
  correctedSentence?: string | null;
}

/** Body of `GET /v1/me/practice/attempts/:id`. */
export interface PracticeAttempt {
  id: string;
  vocabularyId: string;
  modality: PracticeModality;
  text: string;
  status: PracticeAttemptStatus;
  /** Overall 0–100 quality. `null` until scored. */
  score: number | null;
  /** CEFR the sentence demonstrates. `null` until scored. */
  cefr: CefrLevel | null;
  rubric: PracticeRubric | null;
  feedback: string | null;
  /** Failure reason when `status === "failed"`. */
  error: string | null;
  createdAt: string;
  scoredAt: string | null;
}

/** Body of a successful `POST /v1/me/practice/attempts` (`202`). */
export interface SubmitPracticeResponse {
  attemptId: string;
  status: PracticeAttemptStatus;
}

/**
 * The one target word a Practice session is anchored to — projected from a
 * catalog/owned vocabulary down to just what the screen renders. `ipa`/`audioUrl`
 * are hidden in the header when null; `transcriptPhonemes`/`phonemes` are NOT
 * carried here — they arrive in the Speak score response.
 */
export interface PracticeWord {
  vocabularyId: string;
  lemma: string;
  ipa: string | null;
  audioUrl: string | null;
  /** Part of speech, e.g. "adjective". */
  pos: string | null;
  /** One-line sense ("lasting a very short time"). */
  gloss: string | null;
}
