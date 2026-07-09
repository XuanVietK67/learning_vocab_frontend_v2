import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyboardIcon,
  SearchCheckIcon,
  SparklesIcon,
  UploadIcon,
} from "lucide-react";

import { QuickCreate } from "./quick-create";

export const metadata: Metadata = {
  title: "Quick add word",
};

const STEPS = [
  { icon: KeyboardIcon, label: "Type a word" },
  { icon: SparklesIcon, label: "AI drafts it" },
  { icon: SearchCheckIcon, label: "You review" },
  { icon: UploadIcon, label: "Publish" },
];

export default function QuickAddPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/admin/vocabularies"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Vocabulary
      </Link>

      {/* Expressive AI hero */}
      <header className="flex flex-col gap-4 rounded-xl border border-indigo-200/70 bg-linear-to-br from-indigo-50 via-violet-50 to-sky-50 p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-sky-950/20">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
            <SparklesIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Quick add a word
            </h1>
            <p className="text-sm text-muted-foreground">
              Give just the word — AI enriches it into fully-formed drafts
              (senses, examples, translations). You review before anything goes
              live.
            </p>
          </div>
        </div>

        {/* Mental-model strip: TYPE → WAIT → REVIEW → PUBLISH */}
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {STEPS.map((step, i) => (
            <li key={step.label} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 ring-1 ring-inset ring-border">
                <step.icon className="size-3.5" />
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRightIcon className="size-3.5 text-muted-foreground/40" />
              )}
            </li>
          ))}
        </ol>
      </header>

      <QuickCreate />
    </div>
  );
}
