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
  size?: "md" | "lg";
  className?: string;
}

const BLANK_RE = /_{2,}/g;

/**
 * Renders a cloze sentence, styling the blank (a run of underscores) as an
 * underlined slot. Pass `slot` to drop an inline input into the gap, or `value`
 * to fill it with the chosen word (tinted by `state` once graded).
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
    <p
      className={cn(
        "text-center font-medium leading-loose text-balance",
        size === "lg" ? "text-[22px]" : "text-xl",
        className,
      )}
    >
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
  return (
    <span
      className={cn(
        "mx-1 inline-block min-w-18.5 border-b-[2.5px] px-1.5 text-center align-baseline font-bold",
        state === "ok" && "border-(--ok) text-(--ok)",
        state === "bad" && "border-(--bad) text-(--bad) line-through",
        !state && "border-primary text-(--primary-d)",
      )}
    >
      {value || "    "}
    </span>
  );
}
