import { cn } from "@/lib/utils";

interface StepDotsProps {
  /** 0-based position in the word's lesson ladder. */
  stepIndex: number;
  /** Total steps in the word's ladder. */
  stepCount: number;
}

/** Sub-indicator showing where we are in a single word's lesson ladder. */
export function StepDots({ stepIndex, stepCount }: StepDotsProps) {
  if (stepCount <= 1) return null;
  const current = stepIndex + 1; // contract is 0-based; render 1-based.

  return (
    <span className="lr-steps" aria-label={`Step ${current} of ${stepCount}`}>
      {Array.from({ length: stepCount }).map((_, i) => (
        <i
          key={i}
          className={cn(i + 1 < current && "done", i + 1 === current && "current")}
        />
      ))}
    </span>
  );
}
