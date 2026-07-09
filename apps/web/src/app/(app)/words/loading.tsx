/** Skeleton for `/words` while the first page loads. */
export default function WordsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="lr-sk h-7 w-40 rounded-lg" />
          <span className="lr-sk h-4 w-72 rounded-md" />
        </div>
        <span className="lr-sk h-9 w-28 rounded-full" />
      </div>
      <span className="lr-sk mt-6 block h-11 w-80 rounded-[14px]" />
      <div className="lr-card mt-5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 border-b border-(--line) px-4 py-3.5 last:border-b-0">
            <div className="flex flex-1 flex-col gap-2">
              <span className="lr-sk h-4 w-44 rounded-md" />
              <span className="lr-sk h-3 w-64 rounded-md" />
            </div>
            <span className="lr-sk size-9 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
