import Link from "next/link";
import { ArrowLeftIcon, type LucideIcon } from "lucide-react";

/**
 * Branded placeholder for nav destinations that are wired into the sidebar but
 * not yet built. Keeps the navigation honest — no dead links, no "Soon" labels —
 * while the real screens land. Renders inside the `.app-shell` (app) layout.
 */
export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-[var(--r-tile)] bg-(--primary-soft) text-(--primary)">
        <Icon className="size-7" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="lr-eyebrow">Coming soon</p>
        <h1 className="serif text-3xl font-semibold tracking-tight text-(--ink)">
          {title}
        </h1>
        <p className="text-(--ink-2)">{description}</p>
      </div>
      <Link href="/dashboard" className="lr-btn lr-btn--soft lr-btn--md">
        <ArrowLeftIcon className="size-4" /> Back to home
      </Link>
    </div>
  );
}
