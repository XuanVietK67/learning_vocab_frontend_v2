/** Route-level fallback while the learn page resolves on the server. */
export default function LearnLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-150 flex-col justify-center gap-4 px-4 py-8">
      <div className="lr-sk h-9 w-1/2 rounded-2xl" />
      <div className="lr-sk h-24 w-full rounded-[30px]" />
      <div className="lr-sk h-20 w-full rounded-[30px]" />
      <div className="grid grid-cols-2 gap-3.5">
        <div className="lr-sk h-28 rounded-[30px]" />
        <div className="lr-sk h-28 rounded-[30px]" />
      </div>
    </div>
  );
}
