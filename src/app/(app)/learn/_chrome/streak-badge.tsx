import { FlameIcon } from "lucide-react";

/** Inline "🔥 n" streak pill (amber gradient), shown once the user is on a roll. */
export function StreakBadge({ streak }: { streak: number }) {
  return (
    <span className="lr-streak lr-pop" role="status" aria-label={`Streak ${streak}`}>
      <FlameIcon className="lr-flame lit size-4 fill-[#ff7a1a] text-[#ff7a1a]" />
      <span className="tabular-nums">{streak}</span>
    </span>
  );
}
