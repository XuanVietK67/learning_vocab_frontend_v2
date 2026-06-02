import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Top bar for the marketing landing: brand mark + auth entry points. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Vocab home">
          <BrandMark />
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }), "h-9 px-3 sm:px-4")}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants(), "h-9 px-3 sm:px-4")}
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
