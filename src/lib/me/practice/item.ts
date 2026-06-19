/**
 * Pure projections between a queue {@link PracticeItem} and the word-anchored
 * runner's {@link PracticeWord}. No server imports here — both the server reads
 * and the client queue builder depend on these, so this module must stay
 * runtime-safe on either side.
 */
import type { PracticeItem, PracticeWord } from "./types";

/** Hand a queue item to the runner: collapse `glosses` to a single `gloss`. */
export function practiceItemToWord(item: PracticeItem): PracticeWord {
  return {
    vocabularyId: item.vocabularyId,
    lemma: item.lemma,
    ipa: item.ipa,
    audioUrl: item.audioUrl,
    pos: item.partOfSpeech,
    gloss: item.glosses[0] ?? null,
  };
}

/** Lift a single runner word (e.g. the `?word=` deep-link) into a one-item queue. */
export function practiceWordToItem(word: PracticeWord): PracticeItem {
  return {
    vocabularyId: word.vocabularyId,
    lemma: word.lemma,
    partOfSpeech: word.pos,
    ipa: word.ipa,
    audioUrl: word.audioUrl,
    glosses: word.gloss ? [word.gloss] : [],
  };
}
