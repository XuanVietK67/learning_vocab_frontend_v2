import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Accent =
  | "indigo"
  | "violet"
  | "sky"
  | "emerald"
  | "amber"
  | "rose";

/** Soft-tint class sets per accent: card shell + icon chip. */
export const ACCENT: Record<Accent, { card: string; chip: string }> = {
  indigo: {
    card: "border-indigo-200/70 border-l-indigo-500 bg-indigo-50/40 dark:border-indigo-900/40 dark:border-l-indigo-500/70 dark:bg-indigo-950/20",
    chip: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  violet: {
    card: "border-violet-200/70 border-l-violet-500 bg-violet-50/40 dark:border-violet-900/40 dark:border-l-violet-500/70 dark:bg-violet-950/20",
    chip: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  sky: {
    card: "border-sky-200/70 border-l-sky-500 bg-sky-50/40 dark:border-sky-900/40 dark:border-l-sky-500/70 dark:bg-sky-950/20",
    chip: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  emerald: {
    card: "border-emerald-200/70 border-l-emerald-500 bg-emerald-50/40 dark:border-emerald-900/40 dark:border-l-emerald-500/70 dark:bg-emerald-950/20",
    chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  amber: {
    card: "border-amber-200/70 border-l-amber-500 bg-amber-50/40 dark:border-amber-900/40 dark:border-l-amber-500/70 dark:bg-amber-950/20",
    chip: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  rose: {
    card: "border-rose-200/70 border-l-rose-500 bg-rose-50/40 dark:border-rose-900/40 dark:border-l-rose-500/70 dark:bg-rose-950/20",
    chip: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
};

interface Props {
  accent: Accent;
  icon: ReactNode;
  title: string;
  description?: string;
  /** Optional element pinned to the section's top-right (e.g. a counter). */
  action?: ReactNode;
  children: ReactNode;
}

/** A soft-tinted, accent-bordered section shell with an icon + title header. */
export function SectionCard({
  accent,
  icon,
  title,
  description,
  action,
  children,
}: Props) {
  const a = ACCENT[accent];
  return (
    <section
      className={cn("rounded-xl border border-l-4 p-5 shadow-sm", a.card)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4.5",
              a.chip,
            )}
          >
            {icon}
          </span>
          <div className="grid gap-0.5">
            <h2 className="font-heading text-base leading-none font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
