"use client";

import { useActionState, useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cefrTone,
  sourceTone,
  toneClass,
  type BadgeTone,
} from "@/lib/admin/badge-tones";
import { updateVocabularyFieldsAction } from "@/lib/admin/actions";
import { CEFR_LEVELS } from "@/lib/admin/types";
import type { ActionResult, VocabularyDetail } from "@/lib/admin/types";
import { LANGUAGES, languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

const FORM_ID = "vocab-fields-form";
const INITIAL: ActionResult = { ok: false };

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

/**
 * Editor header + top-level fields form (`PATCH /v1/admin/vocabularies/:id`).
 * The "Save changes" button lives in the header next to the passed-in
 * `deleteSlot`; it submits the fields form below via the HTML `form` attribute,
 * and its pending state comes from `useActionState` (works outside the form,
 * unlike `useFormStatus`).
 */
export function VocabFieldsForm({
  vocab,
  deleteSlot,
}: {
  vocab: VocabularyDetail;
  deleteSlot: React.ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(
    updateVocabularyFieldsAction,
    INITIAL,
  );

  useEffect(() => {
    if (state.ok) toast.success("Saved");
  }, [state]);

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {vocab.lemma}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{vocab.partOfSpeech}</Badge>
            <Badge>{languageLabel(vocab.language)}</Badge>
            {vocab.cefrLevel && (
              <Badge tone={cefrTone(vocab.cefrLevel)}>{vocab.cefrLevel}</Badge>
            )}
            <Badge tone={sourceTone(vocab.source)}>{vocab.source}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" form={FORM_ID} size="sm" disabled={isPending}>
            {isPending && <Loader2Icon className="animate-spin" />}
            Save changes
          </Button>
          {deleteSlot}
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form id={FORM_ID} action={formAction} className="grid gap-4">
            <input type="hidden" name="id" value={vocab.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="lemma">Lemma</Label>
                <Input
                  id="lemma"
                  name="lemma"
                  defaultValue={vocab.lemma}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="partOfSpeech">Part of speech</Label>
                <Input
                  id="partOfSpeech"
                  name="partOfSpeech"
                  defaultValue={vocab.partOfSpeech}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cefrLevel">CEFR level</Label>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ipa">IPA</Label>
                <Input id="ipa" name="ipa" defaultValue={vocab.ipa ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequencyRank">Frequency rank</Label>
                <Input
                  id="frequencyRank"
                  name="frequencyRank"
                  type="number"
                  min={0}
                  defaultValue={vocab.frequencyRank ?? ""}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="audioUrl">Audio URL</Label>
                <Input
                  id="audioUrl"
                  name="audioUrl"
                  type="url"
                  defaultValue={vocab.audioUrl ?? ""}
                  placeholder="Leave blank to keep silent / auto-generate"
                />
              </div>
            </div>

            {state.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </>
  );
}
