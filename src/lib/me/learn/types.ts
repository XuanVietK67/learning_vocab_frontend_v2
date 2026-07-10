/**
 * Shapes for the guided learn-session loop (`/v1/me/learn/*`). Mirrors
 * docs/api/learn_vocabulary_flow.md and docs/api/api-endpoints.md §Learn — keep in sync
 * when the backend contract changes.
 *
 * A session returns an ordered list of signed `SessionItem`s (the lesson ladder
 * for every picked word, flattened). Each item carries an HMAC-signed envelope
 * the client echoes back when submitting an answer, plus a `prompt` whose shape
 * is discriminated by `prompt.type`.
 */

/** The twelve question types — also the discriminator of `Prompt`. */
export type QuestionType =
  | "flashcard"
  | "cloze_mcq"
  | "cloze_typing"
  | "meaning_in_context"
  | "sense_disambiguation"
  | "listening_cloze"
  | "word_from_translation"
  | "translation_from_word"
  | "listening_choice"
  | "dictation"
  | "image_choice"
  | "pronunciation";

/** Self-rating submitted as `userAnswer` for a `flashcard` question. */
export type FlashcardRating = "forgot" | "hard" | "good" | "easy";

export const FLASHCARD_RATINGS: readonly FlashcardRating[] = [
  "forgot",
  "hard",
  "good",
  "easy",
];

/** Learning modes accepted by `POST /v1/me/learn/session`. */
export type SessionMode = "daily" | "topic" | "deck" | "review";

/** Why a session came back with no items (null when `items` is non-empty). */
export type EmptyReason =
  | "no_due_cards"
  | "no_more_at_level"
  | "no_enrollment"
  | "deck_exhausted";

/** Per-card SRS lifecycle status. */
export type ProgressStatus = "new" | "learning" | "review" | "mastered";

// --- Prompt shapes (discriminated on `type`) --------------------------------

export interface FlashcardSenseExample {
  sentence: string;
  translation: string | null;
}

export interface FlashcardSense {
  gloss: string | null;
  definition: string | null;
  translation: string | null;
  example: FlashcardSenseExample | null;
  synonyms: string[];
  antonyms: string[];
}

export interface FlashcardPrompt {
  type: "flashcard";
  lemma: string;
  ipa: string | null;
  partOfSpeech: string | null;
  audioUrl: string | null;
  senses: FlashcardSense[];
}

export interface ClozeMcqPrompt {
  type: "cloze_mcq";
  sentenceWithBlank: string;
  hintTranslation: string | null;
  audioUrl: string | null;
  options: string[];
}

export interface ClozeTypingPrompt {
  type: "cloze_typing";
  sentenceWithBlank: string;
  hintTranslation: string | null;
  audioUrl: string | null;
}

/** Inclusive-start, exclusive-end character offsets into `sentence`. */
export interface HighlightSpan {
  start: number;
  end: number;
}

export interface MeaningInContextPrompt {
  type: "meaning_in_context";
  sentence: string;
  highlightedSpan: HighlightSpan;
  options: string[];
  /** Translation of `sentence`; reveal after answering. Null when none stored. */
  sentenceTranslation: string | null;
}

export interface SenseDisambiguationPrompt {
  type: "sense_disambiguation";
  sentence: string;
  /** May be null when the backend can't locate the word in the sentence. */
  highlightedSpan: HighlightSpan | null;
  options: string[];
  /** Translation of `sentence`; reveal after answering. Null when none stored. */
  sentenceTranslation: string | null;
}

export interface ListeningClozePrompt {
  type: "listening_cloze";
  audioUrl: string | null;
  sentenceWithBlank: string;
  hintTranslation: string | null;
  options: string[];
}

/** Show the translation, pick the matching word. `userAnswer` is the chosen lemma. */
export interface WordFromTranslationPrompt {
  type: "word_from_translation";
  translation: string;
  options: string[];
}

/** Show the word, pick its translation. `userAnswer` is the chosen translation. */
export interface TranslationFromWordPrompt {
  type: "translation_from_word";
  lemma: string;
  options: string[];
}

/** Play audio, pick the matching word. `userAnswer` is the chosen lemma. */
export interface ListeningChoicePrompt {
  type: "listening_choice";
  audioUrl: string | null;
  options: string[];
}

/** Play audio, type the word you heard. `userAnswer` is the typed word. */
export interface DictationPrompt {
  type: "dictation";
  audioUrl: string | null;
  hintTranslation: string | null;
}

/** Show an image, pick the matching word. `userAnswer` is the chosen lemma. */
export interface ImageChoicePrompt {
  type: "image_choice";
  imageUrl: string;
  options: string[];
}

/**
 * Show the word; the user records themselves saying it. The client scores the
 * audio via `POST /v1/pronunciation/score` and submits the returned `attemptId`
 * as `userAnswer` (with a keyboard/transcript fallback when the mic or scorer is
 * unavailable). The prompt shape is unchanged from the old STT flow. See
 * docs/api/learn_pronunciation_question.md.
 */
export interface PronunciationPrompt {
  type: "pronunciation";
  lemma: string;
  ipa: string | null;
  audioUrl: string | null;
}

export type Prompt =
  | FlashcardPrompt
  | ClozeMcqPrompt
  | ClozeTypingPrompt
  | MeaningInContextPrompt
  | SenseDisambiguationPrompt
  | ListeningClozePrompt
  | WordFromTranslationPrompt
  | TranslationFromWordPrompt
  | ListeningChoicePrompt
  | DictationPrompt
  | ImageChoicePrompt
  | PronunciationPrompt;

// --- Session item envelope --------------------------------------------------

/**
 * The studied word shown in an example sentence — attached to every session item
 * as unsigned render data. Surfaced on the answer reveal (under the
 * correct/incorrect strip) so the learner sees the word in context on every
 * question type, not just the bare lemma. Null when the word has no example.
 *
 * Built server-side by `QuestionBuilderService` from the same `example`
 * (`sentence`/`translation`) the sentence-based builders already read — this
 * just normalizes it onto the envelope for the reveal. See
 * docs/api/learn_reveal_example.md.
 */
export interface WordExample {
  /** Example sentence featuring the studied word, in the target language. */
  sentence: string;
  /** Translation of `sentence` in the learner's language; null when unavailable. */
  translation: string | null;
  /**
   * Character offsets of the studied word within `sentence` (inclusive-start,
   * exclusive-end), used to emphasize it. Null when the backend can't locate it.
   */
  highlightedSpan: HighlightSpan | null;
}

/**
 * One signed question. The fields between `vocabularyId` and `signature` are
 * HMAC-signed and expire ~30 min after `issuedAtMs`; they must be echoed
 * verbatim to `POST /answer`.
 */
export interface SessionItem {
  /** Client correlation id (not signed). */
  sessionItemId: string;
  /** Shared by every step of one word's lesson ladder. */
  groupId: string;
  /** 0-based position in the word's ladder. */
  stepIndex: number;
  /** Total steps in the word's ladder. */
  stepCount: number;
  vocabularyId: string;
  lemma: string;
  exampleId: string | null;
  type: QuestionType;
  nonce: string;
  issuedAtMs: number;
  signature: string;
  /**
   * The word in an example sentence (+ translation) — unsigned render data used
   * only for the post-answer reveal. Optional/nullable so the client renders
   * nothing until the backend populates it (forward-compatible).
   */
  example?: WordExample | null;
  prompt: Prompt;
}

// --- Session start (`POST /v1/me/learn/session`) ----------------------------

export interface SessionResponse {
  sessionId: string;
  mode: SessionMode;
  /** How many brand-new words this call auto-enrolled. */
  enrolledNewlyCount: number;
  /** Non-null only when `items` is empty. */
  emptyReason: EmptyReason | null;
  /** ISO ts; set only when `emptyReason === "no_due_cards"`. */
  nextDueAt: string | null;
  items: SessionItem[];
}

// --- Answer (`POST /v1/me/learn/answer`) ------------------------------------

/** Updated SRS schedule — only returned on the final step of a word's ladder. */
export interface ProgressRow {
  id: string;
  vocabularyId: string;
  status: ProgressStatus;
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  learningStepIndex: number | null;
  nextReviewAt: string;
  lastReviewedAt: string;
  correctCount: number;
  incorrectCount: number;
  /**
   * `false` when the answer was free practice on a card that wasn't due yet —
   * graded for feedback but the schedule/status/counters were left untouched.
   * Always present here (this row only exists on the final, rescheduling step).
   */
  counted: boolean;
}

/** The word's next-stage ladder, due again inside this session. */
export interface Requeue {
  /** Wall-clock time (ms) at which to re-show the items. */
  dueAtMs: number;
  items: SessionItem[];
}

export interface AnswerResponse {
  correct: boolean;
  /** Canonical answer — show on reveal, especially when wrong. */
  correctAnswer: string;
  /** SM-2 quality the server derived (0–5). */
  quality: number;
  /** Null on non-final steps (only the last step reschedules the card). */
  progress: ProgressRow | null;
  /** Null unless the card comes due again within this session. */
  requeue: Requeue | null;
}
