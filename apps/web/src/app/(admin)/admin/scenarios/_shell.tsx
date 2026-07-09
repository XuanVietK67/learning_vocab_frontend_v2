/**
 * The deliberate "no grey admin" exception (brief §1). The `(admin)` group has no
 * Sprout scope, so the scenario-authoring pages opt into the brand explicitly:
 * this wrapper loads the Jakarta + Newsreader fonts and pairs `.app-shell`
 * (token block) with `.speak-shell .speak-field` (the conversation surface) so
 * authoring is just as colourful as the learner side, inside the grey admin frame.
 */
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";

import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export function ScenarioAdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(jakarta.variable, newsreader.variable, "app-shell speak-shell speak-field min-h-full")}>
      {children}
    </div>
  );
}
