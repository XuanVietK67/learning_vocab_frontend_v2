/** Route-level fallback while the catalogue resolves on the server. */
export default function SpeakingLoading() {
  return (
    <div className="speak-shell speak-field min-h-full">
      <div className="mx-auto w-full max-w-[1140px] px-5 pt-6 pb-20 sm:px-7">
        <div className="lr-sk mb-7 h-44 w-full rounded-[var(--r-card)]" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="lr-sk h-72 rounded-[var(--r-card)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
