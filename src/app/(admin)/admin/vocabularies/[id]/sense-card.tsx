import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from "lucide-react";

import { ExampleEditor } from "./example-editor";
import { TranslationEditor } from "./translation-editor";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteSenseAction,
  reorderSensesAction,
  updateSenseAction,
} from "@/lib/admin/actions";
import type { AdminSense } from "@/lib/admin/types";

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

/** Editable card for a single sense: fields, reorder, delete, sub-editors. */
export function SenseCard({ vocabularyId, sense, upOrder, downOrder }: Props) {
  const fieldId = (name: string) => `sense-${sense.id}-${name}`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold">
          {sense.senseOrder}
        </span>
        <div className="flex items-center gap-1">
          {upOrder ? (
            <ReorderButton
              vocabularyId={vocabularyId}
              order={upOrder}
              direction="up"
            />
          ) : (
            <Button variant="ghost" size="icon-sm" disabled aria-label="Move sense up">
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

      <ActionForm
        action={updateSenseAction}
        successMessage="Sense saved"
        className="grid gap-3"
      >
        <input type="hidden" name="vocabularyId" value={vocabularyId} />
        <input type="hidden" name="senseId" value={sense.id} />
        <div className="grid gap-2">
          <Label htmlFor={fieldId("gloss")}>Gloss</Label>
          <Input
            id={fieldId("gloss")}
            name="gloss"
            defaultValue={sense.gloss ?? ""}
            placeholder="short meaning label"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fieldId("definition")}>Definition</Label>
          <Input
            id={fieldId("definition")}
            name="definition"
            defaultValue={sense.definition ?? ""}
            placeholder="full definition"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fieldId("imageUrl")}>Image URL</Label>
          <Input
            id={fieldId("imageUrl")}
            name="imageUrl"
            type="url"
            defaultValue={sense.imageUrl ?? ""}
          />
        </div>
        <div>
          <AdminSubmit variant="outline">Save sense</AdminSubmit>
        </div>
      </ActionForm>

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
  );
}
