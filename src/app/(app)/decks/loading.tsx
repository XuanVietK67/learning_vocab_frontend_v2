/** Skeleton for `/decks` while the lists load. */
export default function DecksLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="lr-sk h-7 w-32 rounded-lg" />
          <span className="lr-sk h-4 w-80 rounded-md" />
        </div>
        <span className="lr-sk h-9 w-28 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="lr-sk h-40 rounded-[30px]" />
        ))}
      </div>
    </div>
  );
}
