import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

/** Top bar for the marketing landing: brand mark + auth entry points. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Vocab home">
          <BrandMark />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-[15px] font-semibold text-(--ink) transition-colors hover:bg-(--primary-soft) hover:text-(--primary-ink)"
          >
            Log in
          </Link>
          <Link href="/register" className="lr-btn lr-btn--primary lr-btn--sm">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
