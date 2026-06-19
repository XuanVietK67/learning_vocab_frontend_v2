/** Skeleton for `/leaderboard` while the board loads. Mirrors the podium + list shape. */
export default function LeaderboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pt-6 pb-[150px] sm:px-6">
      <div className="flex flex-col gap-[22px]">
        {/* header band */}
        <div className="lb-band rounded-[30px] border border-(--line) px-8 pt-[30px] pb-[26px] shadow-[var(--sh-md)]">
          <div className="flex items-center gap-3.5">
            <span className="lr-sk size-[46px] rounded-[14px]" />
            <span className="lr-sk h-9 w-52 rounded-lg" />
          </div>
          <span className="lr-sk mt-4 block h-4 w-80 max-w-full rounded-md" />
          <div className="mt-5 flex gap-2">
            <span className="lr-sk h-10 w-40 rounded-full" />
            <span className="lr-sk h-10 w-44 rounded-full" />
          </div>
        </div>

        {/* main card */}
        <div className="lr-card p-5">
          <div className="flex items-stretch gap-3.5">
            <span className="lr-sk h-[150px] flex-1 rounded-[var(--r-tile)]" />
            <span className="lr-sk h-[150px] flex-[1.12] rounded-[var(--r-tile)]" />
            <span className="lr-sk h-[150px] flex-1 rounded-[var(--r-tile)]" />
          </div>
          <div className="my-[18px] h-px bg-(--line)" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 px-2.5">
                <span className="lr-sk h-3.5 w-6 rounded" />
                <span className="lr-sk size-[38px] rounded-full" />
                <span className="lr-sk h-3.5 w-44 max-w-full flex-1 rounded" />
                <span className="lr-sk h-4 w-10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
