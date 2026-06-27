import { cn } from "@/lib/utils";
import type { QuestionType } from "@/lib/me/learn/types";
import type { Accent } from "./accents";

/**
 * Per-type metadata: a human `label`, a `short` label for the stage map, the
 * difficulty-band `accent` (so each round carries its own color), and the card's
 * prompt `title`. Single source of truth — reused by the type pill, the stage
 * map, and the stage-clear interstitial. Accents follow the band table in
 * docs/design/learn_session_design_context.md §3.
 */
export const TYPE_META: Record<
  QuestionType,
  { label: string; short: string; accent: Accent; title: string }
> = {
  flashcard: { label: "Flashcard", short: "Flash", accent: "mint", title: "Recall the meaning" },
  cloze_mcq: { label: "Fill the blank", short: "Cloze", accent: "mint", title: "Pick the word that fits" },
  meaning_in_context: { label: "Meaning in context", short: "Meaning", accent: "mint", title: "Choose the meaning" },
  sense_disambiguation: { label: "Which sense?", short: "Sense", accent: "gold", title: "Choose the right sense" },
  word_from_translation: { label: "Choose the word", short: "Word", accent: "mint", title: "Pick the word" },
  translation_from_word: { label: "Choose the meaning", short: "Meaning", accent: "mint", title: "Pick the meaning" },
  listening_cloze: { label: "Listen & fill", short: "Listen", accent: "violet", title: "Hear it, then choose" },
  listening_choice: { label: "Listen & choose", short: "Listen", accent: "violet", title: "Hear it, then choose" },
  image_choice: { label: "Match the picture", short: "Picture", accent: "sky", title: "Match the picture" },
  cloze_typing: { label: "Type the word", short: "Type", accent: "amber", title: "Type the word" },
  dictation: { label: "Dictation", short: "Dictation", accent: "violet", title: "Type what you hear" },
  pronunciation: { label: "Say it", short: "Speak", accent: "amber", title: "Say it out loud" },
};

/** Maps an accent to the type-pill dot modifier class (mint is the default). */
const DOT_CLASS: Record<Accent, string> = {
  mint: "",
  violet: "violet",
  sky: "sky",
  amber: "amber",
  gold: "gold",
};

/** The current question type, as a small dotted pill in the top chrome. */
export function TypePill({ type }: { type: QuestionType }) {
  const meta = TYPE_META[type];
  return (
    <span className="lr-typepill">
      <span className={cn("dot", DOT_CLASS[meta.accent])} />
      {meta.label}
    </span>
  );
}
