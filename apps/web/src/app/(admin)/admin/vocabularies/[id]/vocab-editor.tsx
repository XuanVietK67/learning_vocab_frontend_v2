"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  ChevronLeftIcon,
  Loader2Icon,
  SaveIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AudioChip } from "./audio-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVocabularyFieldsAction } from "@/lib/admin/actions";
import { CEFR_LEVELS } from "@/lib/admin/types";
import type {
  ActionResult,
  AdminVocabularyDetail,
} from "@/lib/admin/types";
import { LANGUAGES, languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

const FORM_ID = "vocab-fields-form";
const INITIAL: ActionResult = { ok: false };

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface Props {
  vocab: AdminVocabularyDetail;
  /** Amber "approve & publish" banner, or null when the word is published. */
  draftBanner: React.ReactNode;
  /** Server-rendered delete form (`deleteVocabularyAction`). */
  deleteSlot: React.ReactNode;
  /** Server-rendered `SenseList` — the dominant left column. */
  senses: React.ReactNode;
  /** Server-rendered `TopicsForm` — sits in the meta rail. */
  topics: React.ReactNode;
}

/**
 * Interactive chrome for the edit-vocabulary screen. Owns the top-level fields
 * Server Action so the sticky action bar's "Save changes" button and the Details
 * form (down in the meta rail) can share one pending/dirty state — the button
 * stays decoupled from the form via `form={FORM_ID}`, exactly as before. Senses
 * and Topics are passed in as server-rendered slots.
 */
export function VocabEditor({
  vocab,
  draftBanner,
  deleteSlot,
  senses,
  topics,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    updateVocabularyFieldsAction,
    INITIAL,
  );
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (state.ok) toast.success("Saved");
  }, [state]);

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      {/* sticky action bar */}
      <div className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href="/admin/vocabularies"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">Vocabulary</span>
          </Link>
          <span className="h-4 w-px bg-border" />
          <span className="truncate font-heading text-sm font-semibold tracking-tight">
            {vocab.lemma}
          </span>
          {vocab.isApproved ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              <CheckIcon className="size-3" /> published
            </span>
          ) : (
            <span className="rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
              draft
            </span>
          )}
          <div className="flex-1" />
          {dirty && (
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}
          {deleteSlot}
          <Button type="submit" form={FORM_ID} size="sm" disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            Save changes
          </Button>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6">
        {draftBanner}

        <HeroIdentity vocab={vocab} />

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
          {/* Senses — dominant column (left on wide screens) */}
          <div className="order-2 min-w-0 lg:order-1">{senses}</div>

          {/* Meta rail — Details + Topics (right, sticky on wide screens) */}
          <div className="order-1 flex flex-col gap-5 lg:order-2 lg:sticky lg:top-20">
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  id={FORM_ID}
                  action={formAction}
                  onChange={() => setDirty(true)}
                  onSubmit={() => setDirty(false)}
                  className="grid gap-3.5 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={vocab.id} />

                  <Field label="Lemma" htmlFor="lemma">
                    <Input
                      id="lemma"
                      name="lemma"
                      defaultValue={vocab.lemma}
                      required
                    />
                  </Field>
                  <Field label="Part of speech" htmlFor="partOfSpeech">
                    <Input
                      id="partOfSpeech"
                      name="partOfSpeech"
                      defaultValue={vocab.partOfSpeech}
                      required
                    />
                  </Field>
                  <Field label="Language" htmlFor="language">
                    <select
                      id="language"
                      name="language"
                      defaultValue={vocab.language}
                      className={selectClass}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="CEFR level" htmlFor="cefrLevel">
                    <select
                      id="cefrLevel"
                      name="cefrLevel"
                      defaultValue={vocab.cefrLevel ?? ""}
                      className={selectClass}
                    >
                      <option value="">— None —</option>
                      {CEFR_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="IPA" htmlFor="ipa">
                    <Input
                      id="ipa"
                      name="ipa"
                      defaultValue={vocab.ipa ?? ""}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Frequency rank" htmlFor="frequencyRank">
                    <Input
                      id="frequencyRank"
                      name="frequencyRank"
                      type="number"
                      min={0}
                      defaultValue={vocab.frequencyRank ?? ""}
                      className="tabular-nums"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Audio URL" htmlFor="audioUrl">
                      <Input
                        id="audioUrl"
                        name="audioUrl"
                        type="url"
                        defaultValue={vocab.audioUrl ?? ""}
                        placeholder="Leave blank to keep silent / auto-generate"
                      />
                    </Field>
                  </div>

                  {state.error ? (
                    <p
                      role="alert"
                      className="text-sm text-destructive sm:col-span-2"
                    >
                      {state.error}
                    </p>
                  ) : null}
                </form>
              </CardContent>
            </Card>

            {topics}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Label + control pair, matching the shadcn field rhythm. */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/** Hero identity panel: lemma at display scale, IPA/audio, and a meta strip. */
function HeroIdentity({ vocab }: { vocab: AdminVocabularyDetail }) {
  return (
    <div className="rounded-xl bg-card px-5 py-6 ring-1 ring-foreground/10 sm:px-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-[clamp(2rem,6vw,3rem)] leading-none font-semibold tracking-tight">
              {vocab.lemma}
            </h1>
            <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium italic">
              {vocab.partOfSpeech}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-sm text-muted-foreground">
            {vocab.ipa && (
              <span className="font-mono text-base">{vocab.ipa}</span>
            )}
            <span className="size-1 rounded-full bg-border" />
            <span>{languageLabel(vocab.language)}</span>
            <AudioChip url={vocab.audioUrl} />
          </div>
        </div>

        <MetaStrip vocab={vocab} />
      </div>
    </div>
  );
}

function MetaStrip({ vocab }: { vocab: AdminVocabularyDetail }) {
  return (
    <div className="flex flex-wrap items-stretch">
      <MetaStat label="CEFR" accent>
        {vocab.cefrLevel ?? "—"}
      </MetaStat>
      <MetaStat label="Frequency">
        {vocab.frequencyRank ? `#${vocab.frequencyRank.toLocaleString()}` : "—"}
      </MetaStat>
      <MetaStat label="Source" capitalize>
        {vocab.source}
      </MetaStat>
      <MetaStat
        label="Enrichment"
        capitalize
        dot={vocab.enrichmentStatus === "enriched"}
        tone={vocab.enrichmentStatus === "failed" ? "destructive" : undefined}
      >
        {vocab.enrichmentStatus ?? "—"}
      </MetaStat>
    </div>
  );
}

function MetaStat({
  label,
  children,
  accent,
  capitalize,
  dot,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
  capitalize?: boolean;
  dot?: boolean;
  tone?: "destructive";
}) {
  return (
    <div className="flex flex-col justify-center gap-1 border-l border-border pl-4 first:border-l-0 first:pl-0 [&:not(:last-child)]:pr-4">
      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-1.5 leading-none tabular-nums",
          accent ? "text-lg font-semibold" : "text-[15px] font-medium",
          capitalize && "capitalize",
          tone === "destructive" && "text-destructive",
        )}
      >
        {dot && <span className="size-[7px] rounded-full bg-green-500" />}
        {children}
      </span>
    </div>
  );
}
