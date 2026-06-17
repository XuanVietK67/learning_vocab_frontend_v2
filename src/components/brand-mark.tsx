import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Show the "Vocab" wordmark next to the logo square. Default `true`. */
  wordmark?: boolean;
  /**
   * `"lg"` is the branded auth-chrome lockup: a larger mint square with a serif
   * "V", a mint glow, and a heavier wordmark. `"default"` is the compact nav mark.
   */
  size?: "default" | "lg";
  className?: string;
}

/**
 * The product's logo lockup: a rounded "V" square plus the "Vocab" wordmark.
 * Shared across the auth chrome and the marketing landing so the brand stays
 * in one place.
 */
export function BrandMark({ wordmark = true, size = "default", className }: BrandMarkProps) {
  const lg = size === "lg";

  return (
    <span className={cn("flex items-center", lg ? "gap-[11px]" : "gap-2", className)}>
      <span
        className={cn(
          "flex items-center justify-center bg-primary text-primary-foreground",
          lg
            ? "size-[42px] rounded-[13px] font-(family-name:--serif) text-2xl font-medium shadow-(--sh-primary)"
            : "size-8 rounded-lg text-sm font-semibold",
        )}
      >
        V
      </span>
      {wordmark && (
        <span
          className={cn(
            "tracking-tight",
            lg ? "text-[21px] font-extrabold text-(--ink)" : "text-base font-semibold",
          )}
        >
          Vocab
        </span>
      )}
    </span>
  );
}
