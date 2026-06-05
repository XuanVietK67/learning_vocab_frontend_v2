import { toneClass, type BadgeTone } from "@/lib/admin/badge-tones";
import { cn } from "@/lib/utils";

/** Small tone-colored pill with an inset ring — the admin badge vocabulary. */
export function ToneBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
