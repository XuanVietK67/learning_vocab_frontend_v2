"use client";

import { useState, useTransition } from "react";

import { setLeaderboardOptOut } from "./settings-actions";

/**
 * "Appear on leaderboard" switch (reuses the `.lr-switch` atom). ON = visible =
 * `leaderboardOptOut: false`. Optimistic: flips immediately, reverts + shows an
 * error if the `PATCH /v1/users/:id` fails.
 */
export function LeaderboardVisibilityToggle({
  initialOptOut,
}: {
  initialOptOut: boolean;
}) {
  const [appear, setAppear] = useState(!initialOptOut);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !appear;
    setAppear(next); // optimistic
    setError(null);
    startTransition(async () => {
      const res = await setLeaderboardOptOut(!next); // optOut is the inverse of "appear"
      if (!res.ok) {
        setAppear(!next); // revert
        setError(res.error ?? "Something went wrong. Try again.");
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0">
        <div className="text-[15px] font-bold text-(--ink)">Appear on leaderboard</div>
        <p className="mt-0.5 text-[13.5px] text-(--ink-2)">
          When off, you&apos;re hidden from every board and don&apos;t count toward
          rankings.
        </p>
        {error && (
          <p className="mt-2 text-[13px] font-semibold text-(--bad-ink)">{error}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={appear}
        aria-label="Appear on leaderboard"
        className="lr-switch mt-0.5"
        data-on={appear}
        disabled={pending}
        onClick={toggle}
      />
    </div>
  );
}
