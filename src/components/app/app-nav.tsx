"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarkedIcon,
  GraduationCapIcon,
  HomeIcon,
  LayersIcon,
  LogOutIcon,
  type LucideIcon,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand-mark";
import type { UserResponse } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Listed in the nav but not yet routable. */
  disabled?: boolean;
}

const NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: HomeIcon },
  { label: "Learn", href: "/learn", icon: GraduationCapIcon },
  { label: "Decks", href: "/decks", icon: LayersIcon, disabled: true },
  { label: "Words", href: "/words", icon: BookMarkedIcon, disabled: true },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialOf(user: UserResponse): string {
  return (user.username || user.email).charAt(0).toUpperCase();
}

/** Persistent left navigation for authenticated pages (desktop only). */
export function AppSidebar({ user }: { user: UserResponse }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar px-3 py-4 lg:flex">
      <Link href="/dashboard" className="px-2 py-1.5" aria-label="Dashboard">
        <BrandMark />
      </Link>

      <nav className="mt-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = !item.disabled && isActive(pathname, item.href);
          const content = (
            <>
              <item.icon className="size-4 shrink-0" />
              <span>{item.label}</span>
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
export function AppMobileBar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 lg:hidden">
      <Link href="/dashboard" aria-label="Dashboard">
        <BrandMark />
      </Link>
      <nav className="flex items-center gap-1">
        {NAV.filter((item) => !item.disabled).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-5" />
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
