"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

import { type Accent, ACCENT } from "./section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/languages";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Colored left border for each sense's spine, cycled by the parent. */
const SENSE_SPINE: Record<Accent, string> = {
  indigo: "border-l-indigo-400 dark:border-l-indigo-500/70",
  violet: "border-l-violet-400 dark:border-l-violet-500/70",
  sky: "border-l-sky-400 dark:border-l-sky-500/70",
  emerald: "border-l-emerald-400 dark:border-l-emerald-500/70",
  amber: "border-l-amber-400 dark:border-l-amber-500/70",
  rose: "border-l-rose-400 dark:border-l-rose-500/70",
};

/** Tinted sub-block styling, keyed by semantic role. */
const BLOCK = {
  sky: {
    wrap: "rounded-lg border border-sky-200/60 bg-sky-50/40 p-3 dark:border-sky-900/40 dark:bg-sky-950/15",
    label: "text-sky-700 dark:text-sky-300",
    chip: "",
  },
  emerald: {
    wrap: "rounded-lg border border-emerald-200/60 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/15",
    label: "text-emerald-700 dark:text-emerald-300",
    chip: "",
  },
  amber: {
    wrap: "rounded-lg border border-amber-200/60 bg-amber-50/40 p-3 dark:border-amber-900/40 dark:bg-amber-950/15",
    label: "text-amber-700 dark:text-amber-300",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  },
  rose: {
    wrap: "rounded-lg border border-rose-200/60 bg-rose-50/40 p-3 dark:border-rose-900/40 dark:bg-rose-950/15",
    label: "text-rose-700 dark:text-rose-300",
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
  },
} as const;

export interface ExampleDraft {
  sentence: string;
  translation: string;
}

export interface TranslationDraft {
  language: string;
  translation: string;
  note: string;
}

export interface SenseDraft {
  gloss: string;
  definition: string;
  imageUrl: string;
  synonyms: string[];
  antonyms: string[];
  translations: TranslationDraft[];
  examples: ExampleDraft[];
}

export function emptyExample(): ExampleDraft {
  return { sentence: "", translation: "" };
}

export function emptyTranslation(): TranslationDraft {
  return { language: "vi", translation: "", note: "" };
}

/** A fresh sense starts with two empty example rows (the API minimum). */
export function emptySense(): SenseDraft {
  return {
    gloss: "",
    definition: "",
    imageUrl: "",
    synonyms: [],
    antonyms: [],
    translations: [],
    examples: [emptyExample(), emptyExample()],
  };
}

/** Comma/Enter-driven chip input for synonyms and antonyms. */
function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  labelClass,
  chipClass,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  labelClass: string;
  chipClass: string;
}) {
  const [text, setText] = useState("");

  const add = () => {
    const value = text.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setText("");
  };

  return (
    <div className="grid gap-2">
      <Label className={cn("text-xs font-semibold", labelClass)}>{label}</Label>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li
              key={value}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                chipClass,
              )}
            >
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => onChange(values.filter((v) => v !== value))}
                className="opacity-70 hover:opacity-100"
              >
                <XIcon className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-8 bg-background"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}

interface Props {
  index: number;
  count: number;
  accent: Accent;
  sense: SenseDraft;
  onChange: (patch: Partial<SenseDraft>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

/** Controlled, color-accented editor for one sense within the create form. */
export function SenseFieldset({
  index,
  count,
  accent,
  sense,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const filledExamples = sense.examples.filter((e) => e.sentence.trim()).length;

  const setExample = (i: number, patch: Partial<ExampleDraft>) =>
    onChange({
      examples: sense.examples.map((e, j) => (j === i ? { ...e, ...patch } : e)),
    });
  const setTranslation = (i: number, patch: Partial<TranslationDraft>) =>
    onChange({
      translations: sense.translations.map((t, j) =>
        j === i ? { ...t, ...patch } : t,
      ),
    });

  return (
    <fieldset
      className={cn(
        "grid gap-4 rounded-xl border border-l-4 bg-card p-5 shadow-sm",
        SENSE_SPINE[accent],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-lg text-sm font-bold",
              ACCENT[accent].chip,
            )}
          >
            {index + 1}
          </span>
          <legend className="font-heading text-sm font-semibold">
            Sense {index + 1}
          </legend>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="Move sense up"
          >
            <ChevronUpIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label="Move sense down"
          >
            <ChevronDownIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={count === 1}
            onClick={onRemove}
            aria-label="Delete sense"
            className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Gloss</Label>
          <Input
            value={sense.gloss}
            onChange={(e) => onChange({ gloss: e.target.value })}
            placeholder="short meaning label"
          />
        </div>
        <div className="grid gap-2">
          <Label>Definition</Label>
          <Input
            value={sense.definition}
            onChange={(e) => onChange({ definition: e.target.value })}
            placeholder="full definition"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Image URL</Label>
        <div className="flex items-start gap-3">
          <Input
            type="url"
            value={sense.imageUrl}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="https://…/image.jpg"
          />
          {sense.imageUrl.trim() && (
            // Arbitrary admin-supplied URL — not a configured next/image host.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sense.imageUrl}
              alt=""
              className="size-12 shrink-0 rounded-md border border-border/60 object-cover"
            />
          )}
        </div>
      </div>

      {/* Synonyms / antonyms */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={BLOCK.amber.wrap}>
          <ChipInput
            label="Synonyms"
            values={sense.synonyms}
            onChange={(next) => onChange({ synonyms: next })}
            placeholder="transient"
            labelClass={BLOCK.amber.label}
            chipClass={BLOCK.amber.chip}
          />
        </div>
        <div className={BLOCK.rose.wrap}>
          <ChipInput
            label="Antonyms"
            values={sense.antonyms}
            onChange={(next) => onChange({ antonyms: next })}
            placeholder="permanent"
            labelClass={BLOCK.rose.label}
            chipClass={BLOCK.rose.chip}
          />
        </div>
      </div>

      {/* Translations */}
      <div className={cn("grid gap-2", BLOCK.sky.wrap)}>
        <Label className={cn("text-xs font-semibold", BLOCK.sky.label)}>
          Translations
        </Label>
        {sense.translations.map((t, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select
              value={t.language}
              onChange={(e) => setTranslation(i, { language: e.target.value })}
              aria-label="Translation language"
              className={cn(selectClass, "bg-background")}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.value}
                </option>
              ))}
            </select>
            <Input
              value={t.translation}
              onChange={(e) => setTranslation(i, { translation: e.target.value })}
              placeholder="translation"
              className="h-8 w-48 bg-background"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove translation"
              onClick={() =>
                onChange({
                  translations: sense.translations.filter((_, j) => j !== i),
                })
              }
            >
              <XIcon className="text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit bg-background"
          onClick={() =>
            onChange({ translations: [...sense.translations, emptyTranslation()] })
          }
        >
          <PlusIcon /> Add translation
        </Button>
      </div>

      {/* Examples */}
      <div className={cn("grid gap-2", BLOCK.emerald.wrap)}>
        <div className="flex items-center justify-between">
          <Label className={cn("text-xs font-semibold", BLOCK.emerald.label)}>
            Examples
          </Label>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              filledExamples < 2
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
            )}
          >
            {filledExamples}/2 minimum
          </span>
        </div>
        {sense.examples.map((ex, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <Input
              value={ex.sentence}
              onChange={(e) => setExample(i, { sentence: e.target.value })}
              placeholder="Example sentence"
              aria-label="Example sentence"
              className="h-8 min-w-56 flex-1 bg-background"
            />
            <Input
              value={ex.translation}
              onChange={(e) => setExample(i, { translation: e.target.value })}
              placeholder="Translation (optional)"
              aria-label="Example translation"
              className="h-8 w-48 bg-background"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={sense.examples.length <= 2}
              aria-label="Remove example"
              onClick={() =>
                onChange({
                  examples: sense.examples.filter((_, j) => j !== i),
                })
              }
            >
              <XIcon className="text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit bg-background"
          onClick={() => onChange({ examples: [...sense.examples, emptyExample()] })}
        >
          <PlusIcon /> Add example
        </Button>
      </div>
    </fieldset>
  );
}
