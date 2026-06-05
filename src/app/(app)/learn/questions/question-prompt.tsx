"use client";

import type { AnswerResponse, SessionItem } from "@/lib/me/learn/types";
import { ClozeMcqQuestion } from "./cloze-mcq-question";
import { ClozeTypingQuestion } from "./cloze-typing-question";
import { DictationQuestion } from "./dictation-question";
import { FlashcardQuestion } from "./flashcard-question";
import { ImageChoiceQuestion } from "./image-choice-question";
import { ListeningChoiceQuestion } from "./listening-choice-question";
import { ListeningClozeQuestion } from "./listening-cloze-question";
import { MeaningInContextQuestion } from "./meaning-in-context-question";
import { PronunciationQuestion } from "./pronunciation-question";
import { SenseDisambiguationQuestion } from "./sense-disambiguation-question";
import { TranslationFromWordQuestion } from "./translation-from-word-question";
import { WordFromTranslationQuestion } from "./word-from-translation-question";

interface QuestionPromptProps {
  item: SessionItem;
  disabled: boolean;
  result: AnswerResponse | null;
  /** Report the current answer for the card footer (gradable types). */
  onAnswerChange: (answer: string | null) => void;
  /** Self-rating submit (flashcards only). */
  onSubmit: (rating: string) => void;
}

/**
 * Renders the right question component for `item.prompt.type`. Switching on the
 * discriminant narrows `item.prompt`, so each branch is fully typed. The runner
 * owns the Check/feedback footer for the gradable types via `onAnswerChange`.
 */
export function QuestionPrompt({
  item,
  disabled,
  result,
  onAnswerChange,
  onSubmit,
}: QuestionPromptProps) {
  const { prompt, lemma } = item;
  const quiz = { lemma, disabled, result, onAnswerChange };

  switch (prompt.type) {
    case "flashcard":
      return (
        <FlashcardQuestion
          prompt={prompt}
          lemma={lemma}
          disabled={disabled}
          result={result}
          onSubmit={onSubmit}
        />
      );
    case "cloze_mcq":
      return <ClozeMcqQuestion prompt={prompt} {...quiz} />;
    case "cloze_typing":
      return <ClozeTypingQuestion prompt={prompt} {...quiz} />;
    case "meaning_in_context":
      return <MeaningInContextQuestion prompt={prompt} {...quiz} />;
    case "sense_disambiguation":
      return <SenseDisambiguationQuestion prompt={prompt} {...quiz} />;
    case "listening_cloze":
      return <ListeningClozeQuestion prompt={prompt} {...quiz} />;
    case "word_from_translation":
      return <WordFromTranslationQuestion prompt={prompt} {...quiz} />;
    case "translation_from_word":
      return <TranslationFromWordQuestion prompt={prompt} {...quiz} />;
    case "listening_choice":
      return <ListeningChoiceQuestion prompt={prompt} {...quiz} />;
    case "dictation":
      return <DictationQuestion prompt={prompt} {...quiz} />;
    case "image_choice":
      return <ImageChoiceQuestion prompt={prompt} {...quiz} />;
    case "pronunciation":
      return <PronunciationQuestion prompt={prompt} {...quiz} />;
    default: {
      // Exhaustiveness guard — a new question type will surface here at compile time.
      const _exhaustive: never = prompt;
      return _exhaustive;
    }
  }
}
