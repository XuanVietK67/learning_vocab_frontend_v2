"use client";

import { useRef, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "neutral" | "syn" | "ant";

const TONE: Record<Tone, string> = {
  neutral: "bg-(--primary-soft) text-(--primary-ink)",
  syn: "bg-(--ok-soft) text-(--ok-ink)",
  ant: "bg-(--bad-soft) text-(--bad-ink)",
};

/**
 * Free-text chip input (synonyms / antonyms). Enter or comma commits the draft;
 * Backspace on an empty field removes the last chip. Bounded by `max` items of
 * `maxLen` chars each — mirrors the API caps (≤32 items, 1–64 chars).
 */
export function ChipsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  tone = "neutral",
  max = 32,
  maxLen = 64,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  tone?: Tone;
  max?: number;
  maxLen?: number;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function add(raw: string) {
    const v = raw.trim();
    if (!v || v.length > maxLen || value.length >= max) {
      setDraft("");
      return;
    }
    if (!value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]);
    setDraft("");
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-[14px] border border-(--line-2) bg-(--surface) p-1.5 shadow-(--sh-sm) focus-within:border-(--primary) focus-within:ring-4 focus-within:ring-(--primary-soft)"
    >
      {value.map((chip, i) => (
        <span
          key={chip}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg py-1 pr-1 pl-2.5 text-[12.5px] font-semibold",
            TONE[tone],
          )}
        >
          {chip}
          <button
            type="button"
            aria-label={`Remove ${chip}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(value.filter((_, j) => j !== i));
            }}
            className="inline-flex rounded p-0.5 opacity-60 hover:opacity-100"
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => add(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && draft === "" && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[90px] flex-1 bg-transparent px-1.5 py-1 text-[13.5px] text-(--ink) outline-none placeholder:text-(--ink-3)"
      />
    </div>
  );
}

/**
 * Topic picker constrained to existing system slugs (`GET /v1/topics`) — an
 * unknown slug would 400, so there is no free text. Selected slugs render as
 * removable chips; an "add" popover offers the remaining ones.
 */
export function TopicPicker({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: { slug: string; name: string }[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const remaining = options.filter((o) => !value.includes(o.slug));

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((slug) => {
          const topic = options.find((o) => o.slug === slug);
          return (
            <span
              key={slug}
              className="inline-flex items-center gap-1 rounded-lg bg-(--primary-soft) py-1 pr-1 pl-2.5 text-[12.5px] font-semibold text-(--primary-ink)"
            >
              {topic?.name ?? slug}
              <button
                type="button"
                aria-label={`Remove ${slug}`}
                onClick={() => onChange(value.filter((s) => s !== slug))}
                className="inline-flex rounded p-0.5 opacity-60 hover:opacity-100"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          );
        })}
        <button
          type="button"
          disabled={remaining.length === 0}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-(--line-2) px-2.5 py-1 text-[12.5px] font-semibold text-(--ink-2) hover:bg-(--card-2) disabled:opacity-50"
        >
          <PlusIcon className="size-3.5" /> add
        </button>
      </div>
      {open && remaining.length > 0 && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 z-30 max-h-60 w-60 overflow-y-auto rounded-[16px] border border-(--line-2) bg-(--surface) p-1.5 shadow-(--sh-lg)"
          onMouseLeave={() => setOpen(false)}
        >
          <p className="px-2 py-1 text-[11px] font-semibold tracking-wide text-(--ink-3) uppercase">
            Pick a topic
          </p>
          {remaining.map((o) => (
            <button
              key={o.slug}
              type="button"
              onClick={() => onChange([...value, o.slug])}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-(--ink) hover:bg-(--primary-soft)/60"
            >
              <PlusIcon className="size-3.5 text-(--ink-3)" /> {o.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
