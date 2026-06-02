import Link from "next/link";
import {
  CalendarDaysIcon,
  LayersIcon,
  RefreshCwIcon,
  TagIcon,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Mode {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const MODES: Mode[] = [
  {
    label: "Daily",
    description: "Due cards plus fresh words",
    href: "/learn?mode=daily",
    icon: CalendarDaysIcon,
  },
  {
    label: "Review",
    description: "Consolidate what you know",
    href: "/learn?mode=review",
    icon: RefreshCwIcon,
  },
  {
    label: "By topic",
    description: "Focus on a subject",
    href: "/learn?mode=topic",
    icon: TagIcon,
  },
  {
    label: "By deck",
    description: "Study a collection",
    href: "/learn?mode=deck",
    icon: LayersIcon,
  },
];

/** Entry points to each learning mode (see /v1/me/learn/session). */
export function PracticeModes() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-medium tracking-tight">Practice</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((mode) => (
          <Link key={mode.label} href={mode.href} className="group">
            <Card className="transition-shadow group-hover:ring-foreground/20">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <mode.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">{mode.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {mode.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
