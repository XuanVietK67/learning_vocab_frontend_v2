import type { ReactNode } from "react";
import { Nunito } from "next/font/google";

import { cn } from "@/lib/utils";

/** Vietnamese-friendly rounded typeface for the study-card session theme. */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

/**
 * Scopes the mint "study card" theme + Nunito font to the learn routes only.
 * `.learn-shell` (see globals.css) overrides the shadcn tokens locally, so the
 * rest of the app keeps its neutral theme.
 */
export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(nunito.variable, "learn-shell min-h-[calc(100vh-3.5rem)]")}>
      {children}
    </div>
  );
}
