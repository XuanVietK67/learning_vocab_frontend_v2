"use client";

import { useEffect, useRef, useState } from "react";
import {
  type LucideIcon,
  BellIcon,
  ImageIcon,
  Music2Icon,
  SettingsIcon,
  SparklesIcon,
  TypeIcon,
  Volume2Icon,
} from "lucide-react";

import { QuestionTypePicker } from "./question-type-picker";
import { type LearnSettings, SETTING_LABELS } from "./settings-context";
import { ToggleSwitch } from "./toggle-switch";
import type { QuestionTypePrefs } from "./use-question-type-prefs";

interface SettingsPopoverProps {
  settings: LearnSettings;
  setSetting: (key: keyof LearnSettings, value: boolean) => void;
  /** Which question types a session may use (applies to the next session). */
  typePrefs: QuestionTypePrefs;
}

const SETTING_ICONS: Record<keyof LearnSettings, LucideIcon> = {
  autoplay: Volume2Icon,
  sound: BellIcon,
  music: Music2Icon,
  showPhonetic: TypeIcon,
  showImage: ImageIcon,
  stageTransitions: SparklesIcon,
};

/** Top-row card control: a small popover of display toggles + question-type picker. */
export function SettingsPopover({ settings, setSetting, typePrefs }: SettingsPopoverProps) {
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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Card options"
        aria-expanded={open}
        className="lr-icon-btn"
      >
        <SettingsIcon className="size-5" />
      </button>

      {open && (
        <div className="lr-pop absolute right-0 top-12 z-30 max-h-[min(80vh,34rem)] w-68 overflow-y-auto rounded-2xl border border-(--line-2) bg-popover p-3 shadow-(--sh-lg)">
          <p className="lr-eyebrow px-1 pb-2">Display</p>
          {(Object.keys(SETTING_LABELS) as (keyof LearnSettings)[]).map((key) => {
            const Icon = SETTING_ICONS[key];
            const on = settings[key];
            return (
              <button
                key={key}
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => setSetting(key, !on)}
                className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2.5 text-left text-[15px] font-bold text-(--ink) transition-colors hover:bg-(--card-2)"
              >
                <Icon className={on ? "size-5 text-primary" : "size-5 text-(--ink-3)"} />
                <span className="flex-1">{SETTING_LABELS[key]}</span>
                <ToggleSwitch on={on} />
              </button>
            );
          })}

          <div className="my-2 h-px bg-(--line-2)" />
          <QuestionTypePicker prefs={typePrefs} />
        </div>
      )}
    </div>
  );
}
