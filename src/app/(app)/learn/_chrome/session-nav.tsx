"use client";

import { LayersIcon, ShuffleIcon } from "lucide-react";

interface SessionNavProps {
  /** 1-based position of the card on screen. */
  current: number;
  /** Known total (answered + remaining; grows when cards requeue). */
  total: number;
  /** Opens the progress / summary modal. */
  onProgress: () => void;
}

/**
 * Bottom chrome under the study card: a keyboard-hint row and a pill nav.
 *
 * Navigation is forward-only by design — the session is server-paced, so there
 * is no free prev/next or in-session shuffle yet (a "shuffle on start" option is
 * planned backend-side). The shuffle pill is therefore rendered disabled.
 */
export function SessionNav({ current, total, onProgress }: SessionNavProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-[13px] text-muted-foreground">
        <Key>Space</Key> or <Key>Enter</Key> to reveal
        <span className="text-border">•</span>
        <Key>Enter</Key> to check
      </p>

      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={onProgress}
          className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-[15px] font-bold text-foreground shadow-[0_4px_14px_-6px_rgba(35,40,70,0.18)] transition hover:-translate-y-px hover:shadow-[0_6px_18px_-6px_rgba(35,40,70,0.26)]"
        >
          <LayersIcon className="size-[18px] text-primary" />
          Progress
        </button>

        <div className="text-[15px] font-semibold text-muted-foreground tabular-nums">
          Card <b className="font-extrabold text-foreground">{current}</b> / {total}
        </div>

        <button
          type="button"
          disabled
          title="Shuffle (coming soon)"
          aria-label="Shuffle (coming soon)"
          className="grid size-12 cursor-not-allowed place-items-center rounded-2xl border border-border bg-card text-muted-foreground opacity-40 shadow-[0_4px_14px_-6px_rgba(35,40,70,0.18)]"
        >
          <ShuffleIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid h-[22px] min-w-[22px] place-items-center rounded-md border border-border border-b-2 bg-card px-1.5 text-xs font-bold text-foreground">
      {children}
    </kbd>
  );
}
