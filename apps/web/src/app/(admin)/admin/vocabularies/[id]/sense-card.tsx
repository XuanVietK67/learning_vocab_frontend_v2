"use client";

import { useActionState, useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
  Loader2Icon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { ExampleEditor } from "./example-editor";
import { TranslationEditor } from "./translation-editor";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteSenseAction,
  reorderSensesAction,
  updateSenseAction,
} from "@/lib/admin/actions";
import type { ActionResult, AdminSense } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const INITIAL: ActionResult = { ok: false };

const textareaClass =
  "min-h-16 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface Props {
  vocabularyId: string;
  sense: AdminSense;
  /** Full id permutation that moves this sense up one slot, or null if first. */
  upOrder: string[] | null;
  /** Full id permutation that moves this sense down one slot, or null if last. */
  downOrder: string[] | null;
}

/** One reorder ▲/▼ submit that posts the full reordered id list. */
function ReorderButton({
  vocabularyId,
  order,
  direction,
}: {
  vocabularyId: string;
  order: string[];
  direction: "up" | "down";
}) {
  return (
    <form action={reorderSensesAction}>
      <input type="hidden" name="vocabularyId" value={vocabularyId} />
      {order.map((id, i) => (
        <input key={`${id}-${i}`} type="hidden" name="senseIds" value={id} />
      ))}
      <AdminSubmit
        variant="ghost"
        size="icon-sm"
        aria-label={direction === "up" ? "Move sense up" : "Move sense down"}
      >
        {direction === "up" ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </AdminSubmit>
    </form>
  );
}

/**
 * Editable card for a single sense: a header strip (order chip + inline gloss +
 * reorder/delete), the sense's own fields, calm Translations/Examples
 * sub-sections, and a footer save bar.
 *
 * The gloss/definition/imageUrl fields and the footer "Save sense" button all
 * belong to one `updateSenseAction` form, but are scattered across the card's
 * header, body and footer — so they associate with a single standalone `<form>`
 * via the HTML `form={formId}` attribute (the same decoupling the header bar
 * uses). Reorder and delete stay independent forms — never nested.
 */
export function SenseCard({ vocabularyId, sense, upOrder, downOrder }: Props) {
  const formId = `sense-form-${sense.id}`;
  const fieldId = (name: string) => `sense-${sense.id}-${name}`;
  const [state, formAction, isPending] = useActionState(
    updateSenseAction,
    INITIAL,
  );
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (state.ok) toast.success("Sense saved");
  }, [state]);

  // Clear the save flash a beat after it's triggered (async setState is fine).
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 1000);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <Card className={cn("gap-0 py-0", flash && "sense-saved-flash")}>
      {/* Standalone save form. Visible fields link to it via form={formId}. */}
      <form
        id={formId}
        action={formAction}
        onSubmit={() => setFlash(true)}
        className="hidden"
      >
        <input type="hidden" name="vocabularyId" value={vocabularyId} />
        <input type="hidden" name="senseId" value={sense.id} />
      </form>

      {/* header strip */}
      <div className="flex items-center gap-3 border-b bg-muted/40 py-3 pr-3 pl-4">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground tabular-nums">
          {sense.senseOrder}
        </span>
        <input
          form={formId}
          name="gloss"
          defaultValue={sense.gloss ?? ""}
          aria-label={`Sense ${sense.senseOrder} gloss`}
          placeholder="Short gloss (e.g. “leave behind”)"
          className="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-[15px] font-medium outline-none transition-colors focus:border-input focus:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <div className="flex shrink-0 items-center gap-0.5">
          {upOrder ? (
            <ReorderButton
              vocabularyId={vocabularyId}
              order={upOrder}
              direction="up"
            />
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled
              aria-label="Move sense up"
            >
              <ChevronUpIcon />
            </Button>
          )}
          {downOrder ? (
            <ReorderButton
              vocabularyId={vocabularyId}
              order={downOrder}
              direction="down"
            />
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled
              aria-label="Move sense down"
            >
              <ChevronDownIcon />
            </Button>
          )}
          <form action={deleteSenseAction}>
            <input type="hidden" name="vocabularyId" value={vocabularyId} />
            <input type="hidden" name="senseId" value={sense.id} />
            <ConfirmButton
              variant="ghost"
              size="icon-sm"
              message="Delete this sense and its translations and examples?"
              aria-label="Delete sense"
            >
              <Trash2Icon className="text-muted-foreground" />
            </ConfirmButton>
          </form>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="grid gap-2">
          <Label htmlFor={fieldId("definition")}>Definition</Label>
          <textarea
            id={fieldId("definition")}
            form={formId}
            name="definition"
            defaultValue={sense.definition ?? ""}
            rows={2}
            placeholder="Full definition for this sense…"
            className={textareaClass}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor={fieldId("imageUrl")}>Image URL</Label>
            <span className="text-[11px] text-muted-foreground">optional</span>
          </div>
          <div className="flex gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
              <ImageIcon className="size-4" />
            </span>
            <Input
              id={fieldId("imageUrl")}
              form={formId}
              name="imageUrl"
              type="url"
              defaultValue={sense.imageUrl ?? ""}
              placeholder="https://…"
              className="flex-1"
            />
          </div>
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <div className="h-px bg-border" />

        <TranslationEditor
          vocabularyId={vocabularyId}
          senseId={sense.id}
          translations={sense.translations}
        />
        <ExampleEditor
          vocabularyId={vocabularyId}
          senseId={sense.id}
          examples={sense.examples}
        />
      </div>

      {/* footer save */}
      <CardFooter className="justify-end">
        <Button type="submit" form={formId} size="sm" disabled={isPending}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          Save sense
        </Button>
      </CardFooter>
    </Card>
  );
}
