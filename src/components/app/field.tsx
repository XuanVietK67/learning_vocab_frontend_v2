"use client";

import { ChevronDownIcon, TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Mint-themed form atoms shared by the user authoring surfaces (`/words/add`,
 * `/decks/new`, the bulk-import sheet). They resolve the `.app-shell` tokens
 * (`--surface`, `--ink`, `--primary`, `--line-2`, `--bad`) so they sit native
 * to the dashboard rather than the neutral shadcn primitives in `components/ui`.
 */

/** Shared input/select/textarea base — compact, rounded, mint focus ring. */
export const controlClass =
  "w-full rounded-[14px] border border-(--line-2) bg-(--surface) px-3.5 py-2.5 text-sm text-(--ink) shadow-(--sh-sm) outline-none transition-colors placeholder:text-(--ink-3) focus:border-(--primary) focus:ring-4 focus:ring-(--primary-soft) disabled:opacity-60";

export function controlClassWith(invalid?: boolean, extra?: string): string {
  return cn(controlClass, invalid && "border-(--bad) focus:border-(--bad) focus:ring-(--bad-soft)", extra);
}

/** Label + required/optional badge + hint/error wrapper. */
export function Field({
  label,
  required,
  optional,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string | null;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-(--ink)"
        >
          {label}
          {required && <span className="text-(--bad)">*</span>}
          {optional && <span className="font-medium text-(--ink-3)">optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-(--bad-ink)">
          <TriangleAlertIcon className="size-3.5 shrink-0" /> {error}
        </span>
      ) : hint ? (
        <span className="text-[12.5px] text-(--ink-3)">{hint}</span>
      ) : null}
    </div>
  );
}

export function TextInput({
  invalid,
  mono,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; mono?: boolean }) {
  return (
    <input
      className={controlClassWith(invalid, cn(mono && "font-mono", className))}
      {...rest}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={controlClassWith(invalid, cn("min-h-[84px] resize-y leading-relaxed", className))}
      {...rest}
    />
  );
}

interface Option {
  value: string;
  label: string;
}

/** Native select styled as a mint control, with a chevron affordance. */
export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  invalid,
  className,
  id,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  placeholder?: string;
  invalid?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={controlClassWith(
          invalid,
          cn("cursor-pointer appearance-none pr-9", value === "" && "text-(--ink-3)"),
        )}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-(--ink-3)" />
    </div>
  );
}

/** Live character counter, amber near the cap, red over it. */
export function CharCounter({ value, max }: { value: number; max: number }) {
  const near = value > max * 0.9;
  const over = value > max;
  return (
    <span
      className={cn(
        "tnum font-mono text-[11.5px]",
        over ? "text-(--bad-ink)" : near ? "text-(--amber-2)" : "text-(--ink-3)",
      )}
    >
      {value}/{max}
    </span>
  );
}

interface RadioCardOption {
  value: string;
  label: string;
  desc?: string;
}

/** Stacked radio "cards" (audio auto/URL, etc.). */
export function RadioCards({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioCardOption[];
}) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[14px] border px-3.5 py-2.5 transition-colors",
              selected
                ? "border-(--primary) bg-(--primary-soft)/50"
                : "border-(--line-2) bg-(--surface) hover:bg-(--card-2)",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                selected ? "border-(--primary)" : "border-(--ink-3)",
              )}
            >
              {selected && <span className="size-2 rounded-full bg-(--primary)" />}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-semibold text-(--ink)">{o.label}</span>
              {o.desc && <span className="text-[12.5px] text-(--ink-3)">{o.desc}</span>}
            </span>
            <input
              type="radio"
              name={name}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
}
