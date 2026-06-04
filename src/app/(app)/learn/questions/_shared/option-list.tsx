"use client";

import { cn } from "@/lib/utils";

interface OptionListProps {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
  /** Lock input (submitting or already revealed). */
  disabled: boolean;
  /** Set once graded — switches buttons to correct/incorrect coloring. */
  correctAnswer?: string | null;
  /** `grid` lays options out two-up (used by cloze MCQ). */
  variant?: "list" | "grid";
}

/**
 * Single-select answer choices with A/B/C/D key badges. Doubles as the reveal
 * surface: once `correctAnswer` is set it tints the correct option green and a
 * wrong pick red. Used by cloze_mcq / meaning_in_context / sense_disambiguation
 * / listening_cloze.
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
        "gap-2.5",
        variant === "grid" ? "grid grid-cols-1 sm:grid-cols-2" : "flex flex-col",
      )}
    >
      {options.map((option, index) => {
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
              "flex items-center gap-3 rounded-[14px] border-[1.5px] bg-card px-4 py-3.5 text-left text-[15px] font-semibold transition active:scale-[0.99]",
              "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
              !revealed && isSelected && "border-primary bg-secondary",
              !revealed && !isSelected && "border-border hover:border-primary/40 hover:bg-secondary/40",
              isCorrect && "border-(--ok) bg-(--ok-bg) text-[#0c7d44]",
              isWrongPick && "border-(--bad) bg-(--bad-bg) text-[#b0223a]",
              revealed && !isCorrect && !isWrongPick && "border-border opacity-60",
              disabled && "cursor-default",
            )}
          >
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-lg text-sm font-extrabold transition-colors",
                isCorrect
                  ? "bg-(--ok) text-white"
                  : isWrongPick
                    ? "bg-(--bad) text-white"
                    : isSelected && !revealed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
              )}
            >
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1 leading-snug">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
