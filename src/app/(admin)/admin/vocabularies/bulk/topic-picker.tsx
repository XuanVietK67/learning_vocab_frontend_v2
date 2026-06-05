"use client";

/**
 * Multi-select for topic slugs. Only offers topics that already exist — an
 * unknown slug fails the whole bulk submit (400), so free text is intentionally
 * impossible here. Selected topics tag every word the import touches.
 */
import { useEffect, useRef, useState } from "react";
import { TagsIcon, XIcon } from "lucide-react";

import type { Topic } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export function TopicPicker({
  topics,
  selected,
  onChange,
}: {
  topics: Topic[];
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const bySlug = (slug: string) => topics.find((t) => t.slug === slug);
  const available = topics.filter(
    (t) =>
      !selected.includes(t.slug) &&
      t.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        onClick={() => setOpen(true)}
      >
        {selected.map((slug) => {
          const t = bySlug(slug);
          return (
            <span
              key={slug}
              className="inline-flex items-center gap-1 rounded-md bg-violet-100/70 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-300/60 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/25"
            >
              <TagsIcon className="size-3" />
              {t?.name ?? slug}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selected.filter((s) => s !== slug));
                }}
                aria-label={`Remove ${t?.name ?? slug}`}
                className="ml-0.5 rounded hover:text-violet-900 dark:hover:text-violet-100"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          );
        })}
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length ? "" : "Search topics… (optional)"}
          className="min-w-[140px] flex-1 bg-transparent px-1.5 py-0.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      {open && available.length > 0 && (
        <div className="absolute z-40 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border bg-popover p-1.5 shadow-md ring-1 ring-foreground/10">
          {available.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => {
                onChange([...selected, t.slug]);
                setQ("");
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
              )}
            >
              <TagsIcon className="size-3.5 text-violet-500" />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
