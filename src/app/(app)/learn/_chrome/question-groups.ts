/**
 * Skill-grouped question types for the session "which questions do I want?"
 * preference. The learn session is generated and signed server-side
 * (docs/api/learn_vocabulary_flow.md), so this is a *client-side* filter applied
 * to the returned queue — a stopgap until the backend accepts a type filter on
 * `POST /v1/me/learn/session`.
 *
 * Groups are a partition (each filterable type in exactly one group) and are
 * framed by what the learner's environment can support — the real motivation is
 * "no mic / no audio right now". `flashcard` is deliberately NOT a group: it's
 * the intro/browse step for new words and is always kept (filtering it out would
 * leave words never introduced).
 */
import type { QuestionType, SessionItem } from "@/lib/me/learn/types";

export type QuestionGroupId = "choosing" | "typing" | "listening" | "speaking";

export interface QuestionGroup {
  id: QuestionGroupId;
  label: string;
  /** One-line hint shown under the group label. */
  description: string;
  /** The types this group toggles together (disjoint across groups). */
  types: QuestionType[];
}

export const QUESTION_GROUPS: readonly QuestionGroup[] = [
  {
    id: "choosing",
    label: "Multiple choice",
    description: "Tap the right option",
    types: [
      "cloze_mcq",
      "meaning_in_context",
      "sense_disambiguation",
      "word_from_translation",
      "translation_from_word",
      "image_choice",
    ],
  },
  {
    id: "typing",
    label: "Typing",
    description: "Type the word from a sentence",
    types: ["cloze_typing"],
  },
  {
    id: "listening",
    label: "Listening",
    description: "Needs audio",
    types: ["listening_cloze", "listening_choice", "dictation"],
  },
  {
    id: "speaking",
    label: "Speaking",
    description: "Needs a microphone",
    types: ["pronunciation"],
  },
] as const;

/** Every question type the user can toggle. `flashcard` is always kept. */
export const FILTERABLE_TYPES: readonly QuestionType[] = QUESTION_GROUPS.flatMap(
  (group) => group.types,
);

/** The shipped default: every filterable type enabled. */
export const DEFAULT_ENABLED_TYPES: readonly QuestionType[] = [...FILTERABLE_TYPES];

/**
 * Drop questions whose type the user has turned off. `flashcard` is always
 * kept; every other type must be in `enabled`. Pure — used for both the initial
 * queue and any mid-session requeue (the next-stage ladder).
 */
export function filterItemsByType(
  items: readonly SessionItem[],
  enabled: readonly QuestionType[],
): SessionItem[] {
  const on = new Set(enabled);
  return items.filter((item) => item.type === "flashcard" || on.has(item.type));
}
