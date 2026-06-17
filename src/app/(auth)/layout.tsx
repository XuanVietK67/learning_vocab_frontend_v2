import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";

import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

/** Friendly geometric sans for the Sprout brand UI (Vietnamese-capable). */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Dictionary-feel serif that anchors the auth card titles. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

/**
 * Shared chrome for the auth screens. `.app-shell` lifts the Sprout mint tokens
 * onto this route group (the same scope the authenticated home uses), so reused
 * shadcn primitives inherit mint here; `.app-field` paints the branded canvas.
 * Server Component — no interactivity here.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={cn(
        jakarta.variable,
        newsreader.variable,
        "app-shell app-field relative flex flex-1 flex-col items-center justify-center gap-6.5 overflow-hidden px-5 py-14",
      )}
    >
      {/* decorative floating mint/sky blob behind the card */}
      <div aria-hidden className="auth-ornament" />

      <BrandMark size="lg" />
      <div className="relative z-1 w-full max-w-109">{children}</div>
    </main>
  );
}
