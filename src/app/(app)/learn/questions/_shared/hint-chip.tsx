import { LightbulbIcon } from "lucide-react";

interface HintChipProps {
  /** Translation hint for the sentence, or null when none was provided. */
  hint: string | null;
}

/** Translation-hint chip shown under a cloze sentence. */
export function HintChip({ hint }: HintChipProps) {
  if (!hint) return null;
  return (
    <div className="flex justify-center">
      <span className="lr-chip lr-chip--translation">
        <LightbulbIcon className="size-4 shrink-0 text-amber-500" />
        <span>{hint}</span>
      </span>
    </div>
  );
}
