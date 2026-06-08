"use client";

import Link from "next/link";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";

/** Catches unexpected render/data errors in the learn segment. */
export default function LearnError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="learn-anim-in learn-card p-9 text-center">
        <div className="lr-pop mx-auto mb-5 grid size-21 place-items-center rounded-3xl bg-(--bad-soft) text-(--bad-ink)">
          <TriangleAlertIcon className="size-10" />
        </div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Couldn’t load your session</h1>
        <p className="mt-3 text-(--ink-2)">
          {error.digest
            ? `An unexpected error occurred (ref: ${error.digest}).`
            : "An unexpected error occurred while loading this page."}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="lr-btn lr-btn--primary lr-btn--lg lr-btn--block"
          >
            <RotateCcwIcon className="size-5" />
            Try again
          </button>
          <Link href="/dashboard" className="lr-btn lr-btn--ghost lr-btn--md lr-btn--block">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
