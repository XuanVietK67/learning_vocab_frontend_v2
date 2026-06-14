/** Skeleton for a list detail while it loads. */
export default function DeckDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <span className="lr-sk mb-4 block h-4 w-16 rounded-md" />
      <div className="flex items-start gap-4">
        <span className="lr-sk size-12 rounded-[14px]" />
        <div className="flex flex-1 flex-col gap-2">
          <span className="lr-sk h-7 w-56 rounded-lg" />
          <span className="lr-sk h-4 w-72 rounded-md" />
        </div>
        <span className="lr-sk h-9 w-32 rounded-full" />
      </div>
      <div className="lr-card mt-6 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 border-b border-(--line) px-4 py-3.5 last:border-b-0">
            <div className="flex flex-1 flex-col gap-2">
              <span className="lr-sk h-4 w-40 rounded-md" />
              <span className="lr-sk h-3 w-60 rounded-md" />
            </div>
            <span className="lr-sk size-9 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
