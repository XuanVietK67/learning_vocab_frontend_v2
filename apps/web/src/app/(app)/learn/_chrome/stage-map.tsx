import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StageSegment } from "../session-machine";
import { ACCENTS, accentVars } from "./accents";
import { TYPE_META } from "./type-pill";

/**
 * The persistent stage track: one dot per round (a contiguous `type` run),
 * left → right in ascending difficulty. Cleared rounds fill with their own
 * accent, the current round pulses, and upcoming rounds sit in a faded tint of
 * their accent — never gray. A learner glancing at it sees the whole colored
 * ladder and how many stages remain. See docs/design/learn_session_design_context.md §5.
 */
export function StageMap({ stages }: { stages: StageSegment[] }) {
  const n = stages.length;
  if (n === 0) return null;

  const currentIndex = Math.max(
    0,
    stages.findIndex((s) => s.state === "current"),
  );
  // Dots sit centered in n equal columns. The track runs between the first and
  // last dot centers; the fill reaches the current dot's center.
  const firstCenter = 50 / n; // % from the left edge to the first dot's center
  const fillWidth = n > 1 ? (100 * currentIndex) / n : 0;
  const currentAccent = ACCENTS[TYPE_META[stages[currentIndex].type].accent];

  const label = `Stage ${currentIndex + 1} of ${n}, ${
    TYPE_META[stages[currentIndex].type].label
  }`;

  return (
    <div className="lr-stagemap" role="img" aria-label={label}>
      <span
        className="lr-stagemap-track"
        aria-hidden
        style={{ left: `${firstCenter}%`, right: `${firstCenter}%` }}
      />
      <span
        className="lr-stagemap-fill"
        aria-hidden
        style={{
          left: `${firstCenter}%`,
          width: `${fillWidth}%`,
          background: `linear-gradient(90deg, ${ACCENTS.mint.main}, ${currentAccent.main})`,
        }}
      />
      {stages.map((seg, i) => {
        const meta = TYPE_META[seg.type];
        return (
          <div className="lr-stage" key={i} style={accentVars(meta.accent)}>
            <span
              className={cn(
                "lr-stage-dot",
                seg.state === "cleared" && "is-cleared",
                seg.state === "current" && "is-current",
                seg.state === "upcoming" && "is-upcoming",
              )}
            >
              {seg.state === "cleared" ? (
                <CheckIcon className="size-3.5" strokeWidth={3.2} />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn("lr-stage-label", seg.state === "upcoming" && "is-upcoming")}
            >
              {meta.short}
            </span>
          </div>
        );
      })}
    </div>
  );
}
