import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Show the "Vocab" wordmark next to the logo square. Default `true`. */
  wordmark?: boolean;
  className?: string;
}

/**
 * The product's logo lockup: a rounded "V" square plus the "Vocab" wordmark.
 * Shared across the auth chrome and the marketing landing so the brand stays
 * in one place.
 */
export function BrandMark({ wordmark = true, className }: BrandMarkProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        V
      </span>
      {wordmark && (
        <span className="text-base font-semibold tracking-tight">Vocab</span>
      )}
    </span>
  );
}
