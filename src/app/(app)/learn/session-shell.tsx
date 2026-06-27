import type { ReactNode } from "react";
import { XIcon } from "lucide-react";

import type { QuestionType } from "@/lib/me/learn/types";
import { ACCENTS, accentVars } from "./_chrome/accents";
import { FeedbackFx } from "./_chrome/feedback-fx";
import { SettingsPopover } from "./_chrome/settings-popover";
import { StageMap } from "./_chrome/stage-map";
import { StepDots } from "./_chrome/step-dots";
import { StreakBadge } from "./_chrome/streak-badge";
import { TYPE_META } from "./_chrome/type-pill";
import type { LearnSettings } from "./_chrome/settings-context";
import type { StageSegment } from "./session-machine";
import { Confetti } from "./questions/_shared/confetti";

interface SessionShellProps {
  /** Current question type (drives the round pill + card accent). */
  type: QuestionType;
  /** The whole stage track (cleared / current / upcoming rounds). */
  stages: StageSegment[];
  /** Re-mounts the animated body so the entrance replays per card. */
  cardKey: string;
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

/** Persistent session chrome: top bar, stage track, and the study card. */
export function SessionShell({
  type,
  stages,
  cardKey,
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
  const accent = TYPE_META[type].accent;
  const roundCount = stages.length;
  const roundIndex = Math.max(
    0,
    stages.findIndex((s) => s.state === "current"),
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-140 flex-col px-4 py-5 sm:py-6">
      {/* top chrome */}
      <div className="mb-4">
        <div className="mb-3.5 flex items-center gap-2.5">
          <button type="button" onClick={onExit} aria-label="Exit session" className="lr-icon-btn">
            <XIcon className="size-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center">
            <span
              className="lr-roundpill"
              style={{
                background: ACCENTS[accent].soft,
                color: ACCENTS[accent].ink,
              }}
            >
              <span className="dot" style={{ background: ACCENTS[accent].main }} />
              <span className="truncate">
                Round {roundIndex + 1} · {TYPE_META[type].label}
              </span>
            </span>
          </div>
          {showStreak && <StreakBadge streak={streak} />}
          <SettingsPopover settings={settings} setSetting={setSetting} />
        </div>

        {/* stage track (tap to peek at progress) */}
        <button
          type="button"
          onClick={onPeek}
          aria-label={`Session progress — stage ${roundIndex + 1} of ${roundCount}`}
          className="lr-stagemap-card"
        >
          <StageMap stages={stages} />
        </button>
      </div>

      {/* per-word ladder (distinct from the round track) */}
      {stepCount > 1 && (
        <div className="mb-4 flex items-center justify-center gap-2.5">
          <span className="text-[12px] font-bold text-(--ink-3)">
            Step {stepIndex + 1} of {stepCount}
          </span>
          <StepDots stepIndex={stepIndex} stepCount={stepCount} accent={accent} />
        </div>
      )}

      {/* study card */}
      <div
        className="learn-card relative flex flex-1 flex-col overflow-hidden p-6 sm:p-7"
        data-screen-label={`Question · ${type}`}
        style={accentVars(accent)}
      >
        {/* per-round accent edge — keeps even the easiest round from reading plain */}
        <span aria-hidden className="lr-card-accent" />
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
