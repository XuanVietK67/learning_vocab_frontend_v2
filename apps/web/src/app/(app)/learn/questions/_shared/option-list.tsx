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
  /** `grid` lays options out two-up; `list` stacks them. */
  variant?: "list" | "grid";
}

/**
 * Single-select answer choices with A/B/C/D key badges. Doubles as the reveal
 * surface: once `correctAnswer` is set it tints the correct option green (with a
 * check) and a wrong pick red. Powers every MCQ-family question type.
 */
export function OptionList({
  options,
  selected,
  onSelect,
  disabled,
  correctAnswer = null,
  variant = "list",
}: OptionListProps) {
  const revealed = correctAnswer !== null;

  return (
    <div
      role="radiogroup"
      className={cn(
        "lr-stagger grid gap-3",
        variant === "grid" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
      )}
    >
      {options.map((option, index) => {
        const isSelected = option === selected;
        const isCorrect = revealed && option === correctAnswer;
        const isWrongPick = revealed && isSelected && option !== correctAnswer;
        const isMuted = revealed && !isCorrect && !isWrongPick;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={cn(
              "lr-opt",
              !revealed && isSelected && "is-selected",
              isCorrect && "is-correct",
              isWrongPick && "is-wrong",
              isMuted && "is-muted",
              (revealed || disabled) && "is-disabled",
            )}
          >
            <span className="lr-opt-key">{String.fromCharCode(65 + index)}</span>
            <span className="flex-1 leading-snug">{option}</span>
            <span className="lr-opt-mark">
              <span className="grid size-6 place-items-center rounded-full bg-current">
                {isCorrect ? (
                  <CheckIcon className="size-3.5 text-white" strokeWidth={3} />
                ) : (
                  <XIcon className="size-3.5 text-white" strokeWidth={3} />
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
