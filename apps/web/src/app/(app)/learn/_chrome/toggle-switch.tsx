import { cn } from "@/lib/utils";

/** Compact pill toggle (mint when on). Shared by the card-settings popover. */
export function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative h-6.5 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-primary" : "bg-(--line-2)",
      )}
    >
      <span
        className={cn(
          "absolute top-0.75 size-5 rounded-full bg-white shadow transition-all",
          on ? "left-5.25" : "left-0.75",
        )}
      />
    </span>
  );
}
