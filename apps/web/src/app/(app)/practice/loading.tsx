/** Route-level fallback while the Practice hub data resolves on the server. */
export default function PracticeLoading() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6 lg:py-10">
      <div className="lr-sk mb-2 h-8 w-64 rounded-xl" />
      <div className="lr-sk mb-5.5 h-12 w-full rounded-2xl" />
      <div className="lr-sk mb-6.5 h-44 w-full rounded-[var(--r-card)]" />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="lr-sk h-20 rounded-[18px]" />
        <div className="lr-sk h-20 rounded-[18px]" />
        <div className="lr-sk h-20 rounded-[18px]" />
        <div className="lr-sk h-20 rounded-[18px]" />
      </div>
    </div>
  );
}
