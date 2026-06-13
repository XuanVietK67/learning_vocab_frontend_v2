/**
 * One rubric axis as a neutral 0–5 dot row (grammar / word usage / naturalness /
 * relevance). Deliberately **not** band-coloured — the 0–5 criteria are a
 * separate, neutral scale from the 0–100 score band (see {@link ./band}). Pure.
 */
export function CriteriaRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-[7px]">
      <span className="text-[14.5px] font-semibold text-(--ink-2)">{label}</span>
      <div className="flex items-center gap-3">
        <span className="crit-dots" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className={i < value ? "on" : ""} />
          ))}
        </span>
        <span className="tnum w-7 text-right text-[13.5px] font-extrabold">{value}/5</span>
      </div>
    </div>
  );
}
