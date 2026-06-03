"use client";

import type { AnswerResponse, SessionItem } from "@/lib/me/learn/types";
import { ClozeMcqQuestion } from "./cloze-mcq-question";
import { ClozeTypingQuestion } from "./cloze-typing-question";
import { FlashcardQuestion } from "./flashcard-question";
import { ListeningClozeQuestion } from "./listening-cloze-question";
import { MeaningInContextQuestion } from "./meaning-in-context-question";
import { SenseDisambiguationQuestion } from "./sense-disambiguation-question";
import { SentenceBuildQuestion } from "./sentence-build-question";

interface QuestionPromptProps {
  item: SessionItem;
  disabled: boolean;
  result: AnswerResponse | null;
  onSubmit: (userAnswer: string) => void;
}

/**
 * Renders the right question component for `item.prompt.type`. Switching on the
 * discriminant narrows `item.prompt`, so each branch is fully typed.
 */
export function QuestionPrompt({ item, disabled, result, onSubmit }: QuestionPromptProps) {
  const base = { lemma: item.lemma, disabled, result, onSubmit };
  const { prompt } = item;

  switch (prompt.type) {
    case "flashcard":
      return <FlashcardQuestion prompt={prompt} {...base} />;
    case "cloze_mcq":
      return <ClozeMcqQuestion prompt={prompt} {...base} />;
    case "cloze_typing":
      return <ClozeTypingQuestion prompt={prompt} {...base} />;
    case "meaning_in_context":
      return <MeaningInContextQuestion prompt={prompt} {...base} />;
    case "sentence_build":
      return <SentenceBuildQuestion prompt={prompt} {...base} />;
    case "sense_disambiguation":
      return <SenseDisambiguationQuestion prompt={prompt} {...base} />;
    case "listening_cloze":
      return <ListeningClozeQuestion prompt={prompt} {...base} />;
    default: {
      // Exhaustiveness guard — a new question type will surface here at compile time.
      const _exhaustive: never = prompt;
      return _exhaustive;
    }
  }
}
