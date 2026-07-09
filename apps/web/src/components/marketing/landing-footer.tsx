import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

/** Minimal marketing footer — warm and quiet; the energy lives above it. */
export function LandingFooter() {
  return (
    <footer className="border-t border-(--line) bg-(--app-bg)">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-4 py-9 sm:px-6">
        <BrandMark />
        <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold">
          <Link
            href="/login"
            className="text-(--ink-2) transition-colors hover:text-(--primary-ink)"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-(--ink-2) transition-colors hover:text-(--primary-ink)"
          >
            Sign up
          </Link>
        </nav>
        <span className="text-sm text-(--ink-3)">
          © {new Date().getFullYear()} Vocab
        </span>
      </div>
    </footer>
  );
}
