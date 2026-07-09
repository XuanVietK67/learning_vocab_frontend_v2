import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SentenceBlankProps {
  /** Sentence containing a run of underscores where the answer goes. */
  text: string;
  /** Fill the blank with this text (e.g. the chosen option). */
  value?: string | null;
  /** Reveal coloring for the filled blank. */
  state?: "ok" | "bad" | null;
  /** Replace the blank with a custom node (e.g. an inline input). */
  slot?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BLANK_RE = /_{2,}/g;
const SIZES: Record<NonNullable<SentenceBlankProps["size"]>, string> = {
  sm: "text-[22px]",
  md: "text-[26px]",
  lg: "text-[30px]",
};

/**
 * Renders a cloze sentence in the Sprout serif, styling the blank (a run of
 * underscores) as an underlined slot. Pass `slot` to drop an inline input into
 * the gap, or `value` to fill it with the chosen word (tinted by `state`).
 */
export function SentenceBlank({
  text,
  value,
  state = null,
  slot,
  size = "md",
  className,
}: SentenceBlankProps) {
  const parts = text.split(BLANK_RE);

  return (
    <p className={cn("lr-sentence text-balance", SIZES[size], className)}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 &&
            (slot !== undefined ? slot : <BlankFill value={value} state={state} />)}
        </Fragment>
      ))}
    </p>
  );
}

function BlankFill({ value, state }: { value?: string | null; state: "ok" | "bad" | null }) {
  const filled = Boolean(value);
  return (
    <span
      className={cn(
        "lr-blank",
        !filled && "is-empty",
        filled && !state && "is-filled",
        state === "ok" && "is-correct",
        state === "bad" && "is-wrong",
      )}
    >
      {value || "·····"}
    </span>
  );
}
