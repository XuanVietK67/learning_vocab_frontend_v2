import { LightbulbIcon } from "lucide-react";

interface HintChipProps {
  /** Translation hint for the sentence, or null when none was provided. */
  hint: string | null;
}

/** Dashed translation-hint line shown under a cloze sentence. */
export function HintChip({ hint }: { hint: HintChipProps["hint"] }) {
  if (!hint) return null;
  return (
    <div className="mx-auto flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 px-3.5 py-2 text-center text-sm text-muted-foreground">
      <LightbulbIcon className="size-4 shrink-0 text-amber-500" />
      <span>{hint}</span>
    </div>
  );
}
