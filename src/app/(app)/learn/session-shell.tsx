import Link from "next/link";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionShellProps {
  percent: number;
  /** e.g. "Step 2 of 5" — the position within the current word's ladder. */
  stepLabel?: string | null;
  children: ReactNode;
}

/** Persistent session chrome: exit control, progress bar, and the card slot. */
export function SessionShell({ percent, stepLabel, children }: SessionShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link
          href="/dashboard"
          aria-label="Exit session"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <XIcon />
        </Link>
        <Progress value={percent} className="flex-1" />
        {stepLabel && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {stepLabel}
          </span>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
