import type { ReactNode } from "react";

import { Garland } from "./_chrome/garland";
import { FeedbackFx } from "./_chrome/feedback-fx";
import { SessionNav } from "./_chrome/session-nav";
import { SettingsPopover } from "./_chrome/settings-popover";
import { StreakBadge } from "./_chrome/streak-badge";
import type { LearnSettings } from "./_chrome/settings-context";

interface SessionShellProps {
  /** 1-based index of the card on screen. */
  current: number;
  /** Known total (answered + remaining). */
  total: number;
  /** Re-mounts the animated body so the entrance replays per card. */
  cardKey: string;
  /** Eyebrow label for the current question type. */
  typeLabel: string;
  streak: number;
  /** Whether to surface the streak badge (gamification on & streak > 1). */
  showStreak: boolean;
  settings: LearnSettings;
  setSetting: (key: keyof LearnSettings, value: boolean) => void;
  onProgress: () => void;
  /** Correct/incorrect celebration trigger. */
  fx: "ok" | "bad" | null;
  /** Bumped per answer so the flash/confetti replays from the start. */
  fxKey: number;
  /** In-card action area: Check while answering, feedback + Continue once graded. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Persistent session chrome: the study card, its decorations, and the bottom nav. */
export function SessionShell({
  current,
  total,
  cardKey,
  typeLabel,
  streak,
  showStreak,
  settings,
  setSetting,
  onProgress,
  fx,
  fxKey,
  footer,
  children,
}: SessionShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 py-6">
      <div className="learn-card relative flex min-h-115 w-full flex-col overflow-hidden rounded-[22px] px-6 py-7 sm:px-9 sm:py-8">
        <SettingsPopover settings={settings} setSetting={setSetting} />
        <Garland />
        {showStreak && <StreakBadge streak={streak} />}

        <div className="flex flex-1 flex-col">
          <div className="mb-2 min-h-5.5 text-center">
            <span className="rounded-full bg-secondary px-3 py-1 text-[12.5px] font-bold tracking-wide text-secondary-foreground">
              {typeLabel}
            </span>
          </div>

          <div key={cardKey} className="learn-anim-in flex flex-1 flex-col justify-center">
            {children}
          </div>

          {footer && <div className="mt-5">{footer}</div>}
        </div>

        {fx && <FeedbackFx key={fxKey} kind={fx} />}
      </div>

      <SessionNav current={current} total={total} onProgress={onProgress} />
    </div>
  );
}
