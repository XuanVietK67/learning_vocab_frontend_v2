/** Pending fallback for the admin vocab list while the page data resolves. */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-8 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
      <div className="h-80 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
