"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type LearnSettings,
  SETTING_LABELS,
} from "./settings-context";

interface SettingsPopoverProps {
  settings: LearnSettings;
  setSetting: (key: keyof LearnSettings, value: boolean) => void;
}

/** Top-left card control: a small popover of display toggles for the study card. */
export function SettingsPopover({ settings, setSetting }: SettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="absolute left-4 top-4 z-20" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Card options"
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <SlidersHorizontalIcon className="size-5" />
      </button>

      {open && (
        <div className="learn-pop absolute left-0 top-12 w-60 rounded-2xl border border-border bg-popover p-2 shadow-[0_18px_40px_-12px_rgba(35,40,70,0.25)]">
          <p className="px-2.5 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Card options
          </p>
          {(Object.keys(SETTING_LABELS) as (keyof LearnSettings)[]).map((key) => (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={settings[key]}
              onClick={() => setSetting(key, !settings[key])}
              className="flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span>{SETTING_LABELS[key]}</span>
              <ToggleSwitch on={settings[key]} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact pill toggle styled to the design (mint when on). */
export function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors",
        on ? "bg-primary" : "bg-[#d6dae3]",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] size-4 rounded-full bg-white shadow transition-all",
          on ? "left-[19px]" : "left-[3px]",
        )}
      />
    </span>
  );
}
