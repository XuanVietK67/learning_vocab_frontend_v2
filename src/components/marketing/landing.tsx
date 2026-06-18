import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";

import { cn } from "@/lib/utils";

import { Features } from "./features";
import { FinalCta } from "./final-cta";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { Showcase } from "./showcase";

/** Friendly geometric sans for all Sprout UI text (Vietnamese-capable). */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Dictionary-feel serif for the display moments: hero + section headings. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

/**
 * The logged-out marketing landing. Composed entirely of Server Components —
 * no client JS — so it stays cheap to render and fully cacheable.
 *
 * The root route renders outside `.app-shell`, so the `.marketing-shell` scope
 * (globals.css) lifts the Sprout mint tokens onto it, and the Jakarta +
 * Newsreader fonts are loaded here so the serif display headings and `.lr-*`
 * atoms render correctly — mirroring how `(app)`/layout.tsx sets its scope.
 */
export function Landing() {
  return (
    <div
      className={cn(
        jakarta.variable,
        newsreader.variable,
        "marketing-shell flex flex-1 flex-col",
      )}
    >
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Showcase />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
