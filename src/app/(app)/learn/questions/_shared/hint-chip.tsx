import { LightbulbIcon } from "lucide-react";

interface HintChipProps {
  /** Translation hint for the sentence, or null when none was provided. */
  hint: string | null;
}

/** Small translation-hint chip shown under a cloze sentence. */
export function HintChip({ hint }: HintChipProps) {
  if (!hint) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
      <LightbulbIcon className="size-3.5" />
      {hint}
    </span>
  );
}
