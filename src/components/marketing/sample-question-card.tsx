import { CheckIcon, Volume2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "studies", correct: true },
  { label: "study", correct: false },
  { label: "studied", correct: false },
  { label: "studying", correct: false },
] as const;

/**
 * A static, non-interactive mock of a `cloze_mcq` question — the core learning
 * mechanic — used as the hero's product visual. Purely decorative; no state.
 * Re-skinned onto the learn atoms with the mint correct-state.
 */
export function SampleQuestionCard() {
  return (
    <div className="lr-card w-full max-w-md p-7 shadow-(--sh-lg)">
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded-full bg-(--primary-soft) px-3 py-1.5 text-[13px] font-bold text-(--primary-ink)">
          Fill the blank · A2
        </span>
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-(--primary-soft) text-(--primary-ink) shadow-[inset_0_0_0_1px_var(--primary-soft-2)]"
        >
          <Volume2Icon className="size-5" />
        </span>
      </div>

      <p className="mb-6 font-(family-name:--serif) text-2xl leading-snug text-(--ink)">
        She{" "}
        <span className="rounded-lg bg-(--ok-soft) px-2.5 py-0.5 font-semibold text-(--ok-ink)">
          studies
        </span>{" "}
        biology at the university.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {OPTIONS.map((option) => (
          <div
            key={option.label}
            className={cn(
              "flex items-center justify-between gap-2 rounded-(--r-tile) border px-4 py-3.5 text-sm font-bold",
              option.correct
                ? "border-(--ok) bg-(--ok-soft) text-(--ok-ink)"
                : "border-(--line-2) bg-(--card-2) text-(--ink-2)",
            )}
          >
            {option.label}
            {option.correct && (
              <span className="flex size-[22px] flex-none items-center justify-center rounded-full bg-(--ok) text-white">
                <CheckIcon className="size-3.5" strokeWidth={3.4} />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-(--r-tile) bg-(--card-2) px-4 py-3.5 text-sm leading-relaxed text-(--ink-2)">
        Cô ấy <span className="font-bold text-(--primary-ink)">học</span> sinh học
        ở trường đại học.
      </div>
    </div>
  );
}
