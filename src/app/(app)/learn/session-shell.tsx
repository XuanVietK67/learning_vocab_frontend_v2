import type { ReactNode } from "react";
import { XIcon } from "lucide-react";

import type { QuestionType } from "@/lib/me/learn/types";
import { FeedbackFx } from "./_chrome/feedback-fx";
import { SettingsPopover } from "./_chrome/settings-popover";
import { StepDots } from "./_chrome/step-dots";
import { StreakBadge } from "./_chrome/streak-badge";
import { TypePill } from "./_chrome/type-pill";
import type { LearnSettings } from "./_chrome/settings-context";
import { Confetti } from "./questions/_shared/confetti";

interface SessionShellProps {
  /** 1-based index of the card on screen. */
  current: number;
  /** Known total (answered + remaining). */
  total: number;
  /** Re-mounts the animated body so the entrance replays per card. */
  cardKey: string;
  /** Current question type (drives the type pill). */
  type: QuestionType;
  /** Position within the current word's lesson ladder. */
  stepIndex: number;
  stepCount: number;
  streak: number;
  /** Whether to surface the streak badge (gamification on & streak > 1). */
  showStreak: boolean;
  settings: LearnSettings;
  setSetting: (key: keyof LearnSettings, value: boolean) => void;
  /** Leave the session. */
  onExit: () => void;
  /** Open the mid-session summary peek. */
  onPeek: () => void;
  /** Correct/incorrect flash trigger. */
  fx: "ok" | "bad" | null;
  /** Bumped per answer so the flash replays from the start. */
  fxKey: number;
  /** Bumped on a correct answer so confetti fires. */
  confettiKey: number;
  /** In-card action area: Check while answering, feedback + Continue once graded. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Persistent session chrome: the top bar, progress, and the study card. */
export function SessionShell({
  current,
  total,
  cardKey,
  type,
  stepIndex,
  stepCount,
  streak,
  showStreak,
  settings,
  setSetting,
  onExit,
  onPeek,
  fx,
  fxKey,
  confettiKey,
  footer,
  children,
}: SessionShellProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-140 flex-col px-4 py-5 sm:py-6">
      {/* top chrome */}
      <div className="mb-4">
        <div className="mb-3.5 flex items-center gap-2.5">
          <button type="button" onClick={onExit} aria-label="Exit session" className="lr-icon-btn">
            <XIcon className="size-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <TypePill type={type} />
            <StepDots stepIndex={stepIndex} stepCount={stepCount} />
          </div>
          {showStreak && <StreakBadge streak={streak} />}
          <SettingsPopover settings={settings} setSetting={setSetting} />
        </div>

        <button
          type="button"
          onClick={onPeek}
          aria-label="Session progress"
          className="flex w-full items-center gap-3"
        >
          <span className="lr-progress flex-1">
            <i style={{ width: `${pct}%` }} />
          </span>
          <span className="shrink-0 text-[12.5px] font-bold tabular-nums text-(--ink-3)">
            {current} / {total}
          </span>
        </button>
      </div>

      {/* study card */}
      <div
        className="learn-card relative flex flex-1 flex-col overflow-hidden p-6 sm:p-7"
        data-screen-label={`Question · ${type}`}
      >
        <Confetti fire={confettiKey} />
        <div key={cardKey} className="learn-anim-in flex flex-1 flex-col">
          {children}
        </div>
        {footer && <div className="mt-5">{footer}</div>}
        {fx && <FeedbackFx key={fxKey} kind={fx} />}
      </div>
    </div>
  );
}
