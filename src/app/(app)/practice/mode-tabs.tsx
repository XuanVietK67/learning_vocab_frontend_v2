"use client";

import { MicIcon, PenLineIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type PracticeMode = "write" | "speak";

/**
 * The two mode pills that map 1:1 to the endpoints (Write → LLM judge, Speak →
 * acoustic scorer). Switching swaps only the panel below — the shared word
 * header stays mounted (see {@link ./practice-screen}).
 */
export function ModeTabs({
  mode,
  onChange,
}: {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
}) {
  return (
    <div className="mb-4 flex gap-2.5" role="tablist" aria-label="Practice mode">
      <Pill active={mode === "write"} onClick={() => onChange("write")}>
        <PenLineIcon className="size-[18px]" /> Write
      </Pill>
      <Pill active={mode === "speak"} onClick={() => onChange("speak")}>
        <MicIcon className="size-[18px]" /> Speak
      </Pill>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[15px] font-bold transition-colors",
        active
          ? "border-(--line) bg-(--surface) text-(--primary-ink) shadow-[var(--sh-md)]"
          : "border-transparent bg-(--card-2) text-(--ink-2) hover:text-(--ink)",
      )}
    >
      {children}
    </button>
  );
}
