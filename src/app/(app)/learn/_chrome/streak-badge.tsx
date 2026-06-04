import { FlameIcon } from "lucide-react";

/** Top-right "n 🔥" streak pill, shown once the user is on a roll. */
export function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="absolute right-5 top-4 z-10 flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-sm font-extrabold text-amber-500 shadow-sm">
      <span className="tabular-nums">{streak}</span>
      <FlameIcon className="size-4 fill-amber-400 text-amber-500" />
    </div>
  );
}
