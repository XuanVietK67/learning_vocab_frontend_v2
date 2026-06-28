"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  HeadphonesIcon,
  KeyboardIcon,
  ListChecksIcon,
  type LucideIcon,
  MicIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ACCENTS } from "./accents";
import { QUESTION_GROUPS, type QuestionGroupId } from "./question-groups";
import { ToggleSwitch } from "./toggle-switch";
import { TYPE_META } from "./type-pill";
import type { QuestionTypePrefs } from "./use-question-type-prefs";

const GROUP_ICONS: Record<QuestionGroupId, LucideIcon> = {
  choosing: ListChecksIcon,
  typing: KeyboardIcon,
  listening: HeadphonesIcon,
  speaking: MicIcon,
};

/**
 * Lets the learner pick which question types a session may use. Groups toggle
 * a whole skill at once; the advanced disclosure exposes per-type control. The
 * guardrail (never drop the last enabled type) lives in `useQuestionTypePrefs`;
 * here we just grey out the control that would hit it.
 */
export function QuestionTypePicker({ prefs }: { prefs: QuestionTypePrefs }) {
  const [advanced, setAdvanced] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="lr-eyebrow">Question types</p>
        <span className="text-[11px] font-semibold text-(--ink-3)">Next session</span>
      </div>

      {QUESTION_GROUPS.map((group) => {
        const Icon = GROUP_ICONS[group.id];
        const gState = prefs.groupState(group);
        const on = gState !== "off";
        // Turning this group off would empty the set (every enabled type lives
        // here) → keep it locked on.
        const lockOn = on && prefs.enabled.every((t) => group.types.includes(t));

        return (
          <div key={group.id}>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              disabled={lockOn}
              onClick={() => prefs.toggleGroup(group)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition-colors hover:bg-(--card-2)",
                lockOn && "cursor-default opacity-90 hover:bg-transparent",
              )}
            >
              <Icon className={on ? "size-5 text-primary" : "size-5 text-(--ink-3)"} />
              <span className="flex-1">
                <span className="block text-[15px] font-bold text-(--ink)">{group.label}</span>
                <span className="block text-[12px] font-medium text-(--ink-3)">
                  {gState === "mixed" ? "Some types on" : group.description}
                </span>
              </span>
              <ToggleSwitch on={on} />
            </button>

            {advanced && group.types.length > 1 && (
              <div className="mb-1 ml-9 flex flex-col gap-0.5 border-l border-(--line-2) pl-2">
                {group.types.map((type) => {
                  const meta = TYPE_META[type];
                  const typeOn = prefs.isOn(type);
                  // Last one standing across the whole set → can't turn off.
                  const lockType = typeOn && prefs.enabled.length === 1;
                  return (
                    <button
                      key={type}
                      type="button"
                      role="switch"
                      aria-checked={typeOn}
                      disabled={lockType}
                      onClick={() => prefs.toggleType(type)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-(--card-2)",
                        lockType && "cursor-default hover:bg-transparent",
                      )}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: ACCENTS[meta.accent].main }}
                      />
                      <span className="flex-1 text-[13px] font-semibold text-(--ink-2)">
                        {meta.label}
                      </span>
                      <ToggleSwitch on={typeOn} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        aria-expanded={advanced}
        onClick={() => setAdvanced((a) => !a)}
        className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[12px] font-bold text-(--ink-3) transition-colors hover:bg-(--card-2)"
      >
        {advanced ? "Hide individual types" : "Advanced"}
        <ChevronDownIcon className={cn("size-3.5 transition-transform", advanced && "rotate-180")} />
      </button>
    </div>
  );
}
