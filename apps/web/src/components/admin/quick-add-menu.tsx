"use client";

/**
 * Entry point for the AI-assisted vocabulary flows, grouped under one "Quick add"
 * menu so the new single/bulk flows read as one feature — and the legacy raw-JSON
 * importer stays a clearly-separated advanced path (it upserts JSON, it is *not*
 * the AI flow).
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  FileJsonIcon,
  LayersIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface Item {
  href: string;
  title: string;
  description: string;
  icon: typeof SparklesIcon;
  muted?: boolean;
}

const ITEMS: Item[] = [
  {
    href: "/admin/vocabularies/quick",
    title: "Quick add a word",
    description: "Type one word — AI drafts it.",
    icon: SparklesIcon,
  },
  {
    href: "/admin/vocabularies/bulk",
    title: "Bulk import",
    description: "Paste or upload many words.",
    icon: LayersIcon,
  },
  {
    href: "/admin/vocabularies/import",
    title: "Import JSON",
    description: "Advanced — upsert raw JSON.",
    icon: FileJsonIcon,
    muted: true,
  },
];

export function QuickAddMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <SparklesIcon />
        Quick add
        <ChevronDownIcon />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border bg-popover p-1.5 shadow-md ring-1 ring-foreground/10"
        >
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
            >
              <span
                className={
                  item.muted
                    ? "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3.5"
                    : "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary [&_svg]:size-3.5"
                }
              >
                <item.icon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
