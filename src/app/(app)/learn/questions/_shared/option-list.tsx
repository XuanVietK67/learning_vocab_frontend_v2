"use client";

import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface OptionListProps {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
  /** Lock input (submitting or already revealed). */
  disabled: boolean;
  /** Set once graded — switches buttons to correct/incorrect coloring. */
  correctAnswer?: string | null;
}

/**
 * Single-select answer choices for the MCQ-style questions. Doubles as the
 * reveal surface: once `correctAnswer` is set it tints the correct option green
 * and a wrong pick red. Used by cloze_mcq / meaning_in_context /
 * sense_disambiguation / listening_cloze.
 */
export function OptionList({
  options,
  selected,
  onSelect,
  disabled,
  correctAnswer = null,
}: OptionListProps) {
  const revealed = correctAnswer !== null;

  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {options.map((option) => {
        const isSelected = option === selected;
        const isCorrect = revealed && option === correctAnswer;
        const isWrongPick = revealed && isSelected && option !== correctAnswer;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              "disabled:cursor-default",
              !revealed && isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
              !revealed && !isSelected && "border-border hover:bg-muted",
              isCorrect && "border-green-600/40 bg-green-600/10 text-green-700 dark:text-green-400",
              isWrongPick && "border-destructive/40 bg-destructive/10 text-destructive",
              revealed && !isCorrect && !isWrongPick && "border-border opacity-60",
            )}
          >
            <span>{option}</span>
            {isCorrect && <CheckIcon className="size-4 shrink-0" />}
            {isWrongPick && <XIcon className="size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
