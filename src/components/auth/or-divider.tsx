/** Horizontal "or" divider between the Google CTA and the email form. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3.5">
      <span className="h-px flex-1 bg-(--line-2)" />
      <span className="text-xs font-semibold text-(--ink-3)">or</span>
      <span className="h-px flex-1 bg-(--line-2)" />
    </div>
  );
}
