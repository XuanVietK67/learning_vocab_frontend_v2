"use client";

import { useEffect, useState } from "react";

import { bandOf, BAND_STYLE } from "./band";

/**
 * The overall 0–100 score gauge — a band-coloured ring with the serif number in
 * the centre, shared by the Write rubric and Speak result. The ring fills from
 * empty via a CSS `stroke-dashoffset` transition (not rAF), so it paints
 * correctly even in backgrounded/reduced-motion contexts. Mirrors the /learn
 * pronunciation `Gauge`, but its track uses `--line` (the learn-only
 * `--learn-field-2` token isn't defined under `.app-shell`).
 */
export function ScoreGauge({
  score,
  size = 124,
  stroke = 11,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const band = bandOf(score);
  const style = BAND_STYLE[band];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Start fully empty, then transition to the target offset after mount so the
  // ring fills via CSS (no rAF — survives backgrounded/reduced-motion contexts).
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const id = window.setTimeout(() => setOffset(c * (1 - score / 100)), 80);
    return () => clearTimeout(id);
  }, [score, c]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={style.line}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.3,0.9,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="tnum serif font-semibold" style={{ fontSize: size * 0.34, color: style.ink }}>
            {score}
          </div>
          <div className="mt-0.5 text-[10.5px] font-extrabold tracking-[0.1em] text-(--ink-3) uppercase">
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}
