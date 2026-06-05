"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarkedIcon,
  HourglassIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  type LucideIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand-mark";
import { useQuickJobs } from "@/hooks/use-quick-jobs";
import type { UserResponse } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Listed in the nav but not yet routable. */
  disabled?: boolean;
  /** Show the live count of active enrichment jobs as a badge. */
  jobsBadge?: boolean;
}

const NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { label: "Vocabulary", href: "/admin/vocabularies", icon: BookMarkedIcon },
  {
    label: "Review drafts",
    href: "/admin/vocabularies/review",
    icon: ListChecksIcon,
  },
  { label: "Topics", href: "/admin/topics", icon: TagsIcon },
  { label: "Users", href: "/admin/users", icon: UsersIcon },
  {
    label: "Jobs",
    href: "/admin/vocabularies/jobs",
    icon: HourglassIcon,
    jobsBadge: true,
  },
];

/**
 * The most specific matching nav href for a path, so nested routes (e.g.
 * `/admin/vocabularies/review`) highlight their own item rather than the broader
 * `/admin/vocabularies` parent.
 */
function activeHref(pathname: string): string | null {
  let best: string | null = null;
  for (const item of NAV) {
    if (item.disabled) continue;
    const matches =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (best === null || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

function initialOf(user: UserResponse): string {
  return (user.username || user.email).charAt(0).toUpperCase();
}

/** Persistent left navigation for admin pages (desktop only). */
export function AdminSidebar({ user }: { user: UserResponse }) {
  const pathname = usePathname();
  const { activeCount } = useQuickJobs();
  const current = activeHref(pathname);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar px-3 py-4 lg:flex">
      <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5">
        <BrandMark />
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Admin
        </span>
      </Link>

      <nav className="mt-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = !item.disabled && item.href === current;
          const content = (
            <>
              <item.icon className="size-4 shrink-0" />
              <span>{item.label}</span>
              {item.jobsBadge && activeCount > 0 && (
                <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums">
                  {activeCount}
                </span>
              )}
              {item.disabled && (
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Soon
                </span>
              )}
            </>
          );
          const base =
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors";

          return item.disabled ? (
            <span
              key={item.href}
              aria-disabled
              className={cn(base, "cursor-default text-sidebar-foreground/40")}
            >
              {content}
            </span>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                base,
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border/60 pt-3">
        <Link
          href="/dashboard"
          className="rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          ← Back to app
        </Link>
        <div className="flex items-center gap-2.5 px-2.5 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
            {initialOf(user)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user.username}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <LogOutIcon className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

/** Compact top bar shown in place of the sidebar on small screens. */
export function AdminMobileBar() {
  const pathname = usePathname();
  const { activeCount } = useQuickJobs();
  const current = activeHref(pathname);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 lg:hidden">
      <Link href="/admin" className="flex items-center gap-2">
        <BrandMark />
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Admin
        </span>
      </Link>
      <nav className="flex items-center gap-1">
        {NAV.filter((item) => !item.disabled).map((item) => {
          const active = item.href === current;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex size-9 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.jobsBadge && activeCount > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Sign out"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <LogOutIcon className="size-5" />
          </button>
        </form>
      </nav>
    </header>
  );
}
