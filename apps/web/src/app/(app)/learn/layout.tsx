import type { ReactNode } from "react";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";

import { cn } from "@/lib/utils";

/** Friendly geometric sans for the Sprout session UI (Vietnamese-capable). */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Dictionary-feel serif that anchors the vocabulary word and cloze sentences. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

/**
 * Scopes the Sprout "study card" theme + fonts to the learn routes only.
 * `.learn-shell` (see globals.css) overrides the shadcn tokens locally with the
 * mint palette, so the rest of the app keeps its neutral theme.
 */
export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        jakarta.variable,
        newsreader.variable,
        "learn-shell min-h-[calc(100vh-3.5rem)]",
      )}
    >
      {children}
    </div>
  );
}
