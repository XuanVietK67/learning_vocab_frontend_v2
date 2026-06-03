import { Fragment } from "react";

import { cn } from "@/lib/utils";

interface SentenceBlankProps {
  /** Sentence containing a run of underscores where the answer goes. */
  text: string;
  className?: string;
}

const BLANK_RE = /_{2,}/g;

/**
 * Renders a cloze sentence, styling the blank (a run of underscores) as a pill
 * so it reads as a gap rather than literal underscores. Falls back to plain
 * text when no blank marker is present.
 */
export function SentenceBlank({ text, className }: SentenceBlankProps) {
  const parts = text.split(BLANK_RE);

  return (
    <p className={cn("text-lg leading-relaxed text-balance", className)}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="mx-1 inline-block min-w-16 rounded-md border-b-2 border-dashed border-muted-foreground/50 align-middle" />
          )}
        </Fragment>
      ))}
    </p>
  );
}
