"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookMarkedIcon,
  ChevronDownIcon,
  CompassIcon,
  GraduationCapIcon,
  HomeIcon,
  LayersIcon,
  LogOutIcon,
  type LucideIcon,
  MenuIcon,
  MessagesSquareIcon,
  MicIcon,
  SettingsIcon,
  ShieldIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand-mark";
import type { UserResponse } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Leaderboard tints violet to match its own screen (§3.2). */
  violet?: boolean;
}

interface NavGroup {
  /** Rendered as an `.lr-eyebrow` group label (MENU / LIBRARY / DISCOVER). */
  label: string;
  items: NavItem[];
}

/**
 * The branded spine (§3). Grouped so a richer destination list stays scannable.
 * Every entry is backend-supported — no "Soon" dead labels. Pages that don't
 * exist yet render a branded "coming soon" stub so no link is dead.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Menu",
    items: [
      { label: "Home", href: "/dashboard", icon: HomeIcon },
      { label: "Learn", href: "/learn", icon: GraduationCapIcon },
      { label: "Practice", href: "/practice", icon: MicIcon },
      { label: "Speaking Room", href: "/speaking", icon: MessagesSquareIcon, violet: true },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "My Words", href: "/words", icon: BookMarkedIcon },
      { label: "My Lists", href: "/decks", icon: LayersIcon },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Explore", href: "/explore", icon: CompassIcon },
      { label: "Community", href: "/community", icon: UsersIcon },
      { label: "Leaderboard", href: "/leaderboard", icon: TrophyIcon, violet: true },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialOf(user: UserResponse): string {
  return (user.username || user.email).charAt(0).toUpperCase();
}

/** Avatar with a `--primary-soft` initial fallback (reused header + menu). */
function Avatar({ user, size = 36 }: { user: UserResponse; size?: number }) {
  if (user.avatarUrl) {
    return (
      <span
        aria-hidden
        className="shrink-0 rounded-full bg-cover bg-center"
        style={{
          width: size,
          height: size,
          backgroundImage: `url("${user.avatarUrl}")`,
        }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-(--primary-soft) font-extrabold text-(--primary-ink)"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initialOf(user)}
    </span>
  );
}

/** Grouped nav links shared by the desktop sidebar and the mobile drawer. */
function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="lr-eyebrow px-3 pb-1">{group.label}</p>
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-item",
                  active && "is-active",
                  active && item.violet && "is-active--violet",
                )}
              >
                <span className="ni-icon">
                  <item.icon className="size-[19px]" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

/** Footer profile popover (§3.3): avatar + username, Profile / Settings / Sign out. */
function ProfileMenu({
  user,
  onNavigate,
}: {
  user: UserResponse;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {open && (
        <div
          role="menu"
          className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-20 rounded-[18px] border border-(--line-2) bg-(--surface) p-2 shadow-[var(--sh-lg)]"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={close}
            className="nav-item w-full"
          >
            <span className="ni-icon">
              <UserIcon className="size-[18px]" />
            </span>
            Profile
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            onClick={close}
            className="nav-item w-full"
          >
            <span className="ni-icon">
              <SettingsIcon className="size-[18px]" />
            </span>
            Settings
          </Link>
          {user.role === "admin" && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={close}
              className="nav-item w-full"
            >
              <span className="ni-icon">
                <ShieldIcon className="size-[18px]" />
              </span>
              Admin
            </Link>
          )}
          <div className="mx-2 my-1.5 h-px bg-(--line)" />
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="nav-item w-full text-(--bad-ink)"
            >
              <span className="ni-icon text-(--bad)">
                <LogOutIcon className="size-[18px]" />
              </span>
              Sign out
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 rounded-[14px] border border-(--line-2) p-2 transition-colors",
          open ? "bg-(--card-2)" : "bg-(--surface)",
        )}
      >
        <Avatar user={user} size={36} />
        <span className="flex min-w-0 flex-col text-left leading-tight">
          <span className="truncate text-sm font-bold text-(--ink)">
            @{user.username}
          </span>
          <span className="truncate text-xs text-(--ink-3)">
            {user.targetLanguage ?? "Learner"}
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            "ml-auto size-4 text-(--ink-3) transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}

/** Persistent left navigation for authenticated pages (desktop only). */
export function AppSidebar({ user }: { user: UserResponse }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col gap-5 border-r border-(--line-2) bg-[linear-gradient(180deg,#fbfdfc,var(--surface))] px-4 py-5 lg:flex">
      <Link href="/dashboard" className="px-1.5" aria-label="Home">
        <BrandMark />
      </Link>

      <nav className="flex flex-1 flex-col gap-5">
        <NavLinks pathname={pathname} />
      </nav>

      <ProfileMenu user={user} />
    </aside>
  );
}

/** Compact top bar + slide-in drawer shown in place of the sidebar on small screens. */
export function AppMobileBar({ user }: { user: UserResponse }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-(--line-2) bg-(--surface) px-4 py-2.5 lg:hidden">
        <Link href="/dashboard" aria-label="Home">
          <BrandMark />
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="lr-icon-btn"
        >
          <MenuIcon className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-(--ink)/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[82%] flex-col gap-5 border-r border-(--line-2) bg-[linear-gradient(180deg,#fbfdfc,var(--surface))] px-4 py-5 shadow-[var(--sh-lg)]">
            <div className="flex items-center justify-between px-1.5">
              <BrandMark />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="lr-icon-btn"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </nav>

            <ProfileMenu user={user} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
