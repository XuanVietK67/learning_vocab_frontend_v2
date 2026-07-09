"use client";

import { ArrowRightIcon, CheckIcon, ChevronUpIcon, TargetIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { QuestionType } from "@/lib/me/learn/types";
import type { StageSegment } from "../session-machine";
import { ACCENTS, accentVars } from "./accents";
import { Confetti } from "../questions/_shared/confetti";
import { TYPE_META } from "./type-pill";

interface StageInterstitialProps {
  /** The round just finished. */
  clearedType: QuestionType;
  /** The round about to start (drives the accent — "harder ahead" via hue). */
  nextType: QuestionType;
  /** This round's score, for the one-line breath stat. */
  stat: { correct: number; total: number };
  /** Live stage track (already advanced) for the mini map. */
  stages: StageSegment[];
  /** Skip immediately to the next card. */
  onContinue: () => void;
}

/**
 * The stage-clear → next-stage beat: a calm, ~1.2s celebration shown over a
 * blurred backdrop when a round boundary is crossed. The middle of three
 * escalating beats (answer flash → stage clear → session summary). Wears the
 * NEXT round's accent so the "harder ahead" shift is felt through color. Always
 * skippable; auto-advance is owned by the runner. See
 * docs/design/learn_session_design_context.md §4.
 */
export function StageInterstitial({
  clearedType,
  nextType,
  stat,
  stages,
  onContinue,
}: StageInterstitialProps) {
  const cleared = TYPE_META[clearedType];
  const next = TYPE_META[nextType];
  const nextAcc = ACCENTS[next.accent];

  return (
    <div
      className="lr-inter-overlay"
      role="dialog"
      aria-label={`${cleared.label} cleared. Next stage: ${next.label}.`}
      onClick={onContinue}
    >
      <div
        className="lr-inter-panel"
        style={accentVars(next.accent)}
        onClick={(e) => e.stopPropagation()}
      >
        <Confetti fire={1} />

        <div
          className="lr-inter-burst"
          aria-hidden
          style={{
            background: `linear-gradient(145deg, ${nextAcc.main}, ${nextAcc.press})`,
          }}
        >
          <CheckIcon className="size-9" strokeWidth={3} />
        </div>

        <p className="lr-inter-eyebrow">Stage cleared</p>
        <h2 className="lr-inter-title">{cleared.label} — cleared</h2>

        <span className="lr-inter-stat">
          <TargetIcon className="size-4" strokeWidth={2.6} />
          {stat.correct} / {stat.total} correct
        </span>

        <div className="lr-inter-stepup" aria-hidden>
          <span className="line" />
          <span className="tag">
            <ChevronUpIcon className="size-3.5" strokeWidth={3} />
            STEP UP
          </span>
          <span className="line" />
        </div>

        <p className="lr-inter-nextlabel">Next stage</p>
        <div className="lr-inter-next">
          <span className="dot" style={{ background: nextAcc.main }} />
          <span className="name">{next.label}</span>
        </div>
        <p className="lr-inter-verb">{next.title}</p>

        <div className="lr-inter-map" aria-hidden>
          <span className="lr-inter-map-track" />
          {stages.map((seg, i) => (
            <span
              key={i}
              className={cn(
                "lr-inter-map-dot",
                seg.state === "current" && "is-current",
                seg.state === "upcoming" && "is-upcoming",
              )}
              style={accentVars(TYPE_META[seg.type].accent)}
            />
          ))}
        </div>

        <button
          type="button"
          autoFocus
          onClick={onContinue}
          className="lr-inter-cta"
        >
          Continue
          <ArrowRightIcon className="size-5" strokeWidth={2.4} />
        </button>
        <p className="lr-inter-hint">Auto-advancing… press Continue to skip</p>
      </div>
    </div>
  );
}
