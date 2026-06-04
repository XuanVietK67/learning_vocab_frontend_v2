/** Decorative confetti-dot garland in the top-right corner of the study card. */
const DOTS = [
  { x: 196, y: 8, r: 6, c: "#5BD0A8" },
  { x: 178, y: 18, r: 5, c: "#5B8DEF" },
  { x: 158, y: 24, r: 7, c: "#57C9C0" },
  { x: 138, y: 33, r: 5, c: "#8FA6FF" },
  { x: 118, y: 39, r: 6, c: "#FFB85C" },
  { x: 98, y: 47, r: 5, c: "#13A97B" },
  { x: 78, y: 53, r: 7, c: "#FFD24D" },
  { x: 58, y: 62, r: 5, c: "#57C9C0" },
  { x: 40, y: 68, r: 6, c: "#8FA6FF" },
];

export function Garland() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0"
      viewBox="0 0 210 80"
      width="200"
      height="76"
      aria-hidden="true"
    >
      <path
        d="M205 6 Q120 30 36 70"
        fill="none"
        stroke="#E4E7EE"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />
      ))}
    </svg>
  );
}
