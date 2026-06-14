"use client";

import { useEffect, useRef, useState } from "react";
import { type LucideIcon, MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

/**
 * Compact `⋯` dropdown used on list cards. Closes on outside-click or Escape.
 * Mirrors the profile popover pattern in `app-nav.tsx`, restyled for a card
 * corner.
 */
export function Menu({
  items,
  label = "More actions",
}: {
  items: MenuItem[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="lr-icon-btn size-8"
      >
        <MoreHorizontalIcon className="size-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+4px)] right-0 z-30 min-w-44 rounded-[16px] border border-(--line-2) bg-(--surface) p-1.5 shadow-(--sh-lg)"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium",
                item.danger
                  ? "text-(--bad-ink) hover:bg-(--bad-soft)"
                  : "text-(--ink) hover:bg-(--primary-soft)/60",
              )}
            >
              {item.icon && <item.icon className="size-4" />} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
