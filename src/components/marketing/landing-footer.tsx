import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

/** Minimal marketing footer. */
export function LandingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <BrandMark />
          <p className="text-sm text-muted-foreground">
            Learn vocabulary in context.
          </p>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/login"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign up
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60 py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vocab
        </p>
      </div>
    </footer>
  );
}
