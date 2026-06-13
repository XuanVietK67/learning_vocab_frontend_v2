import { bandOf, BAND_STYLE } from "./band";

/**
 * A compact attempt sparkline for the word header's history strip — the trend of
 * a word's past scores over time, coloured by the latest band. Renders nothing
 * with fewer than two points (a single dot reads as noise). Pure SVG, no hooks.
 */
export function Sparkline({
  data,
  width = 96,
  height = 30,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (Math.max(0, Math.min(100, v)) / 100) * height;
    return [x, y] as const;
  });
  const d = points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const colour = BAND_STYLE[bandOf(data[data.length - 1])].line;

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke={colour} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={colour} />
    </svg>
  );
}
