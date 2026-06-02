import { SenseCard } from "./sense-card";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSenseAction } from "@/lib/admin/actions";
import type { AdminSense } from "@/lib/admin/types";

/** Copy of `ids` with positions `i` and `j` swapped. */
function swapped(ids: string[], i: number, j: number): string[] {
  const next = [...ids];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

interface Props {
  vocabularyId: string;
  senses: AdminSense[];
}

/** Ordered, editable list of senses plus an "add sense" form. */
export function SenseList({ vocabularyId, senses }: Props) {
  const ids = senses.map((s) => s.id);

  return (
    <div className="flex flex-col gap-4">
      {senses.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No senses yet — add the first one below.
        </p>
      )}

      {senses.map((sense, i) => (
        <SenseCard
          key={sense.id}
          vocabularyId={vocabularyId}
          sense={sense}
          upOrder={i > 0 ? swapped(ids, i, i - 1) : null}
          downOrder={i < ids.length - 1 ? swapped(ids, i, i + 1) : null}
        />
      ))}

      <ActionForm
        action={addSenseAction}
        successMessage="Sense added"
        resetOnSuccess
        className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3"
      >
        <input type="hidden" name="vocabularyId" value={vocabularyId} />
        <p className="text-sm font-medium">Add a sense</p>
        <div className="grid gap-2">
          <Label htmlFor="new-sense-gloss">Gloss</Label>
          <Input
            id="new-sense-gloss"
            name="gloss"
            placeholder="short meaning label"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-sense-definition">Definition</Label>
          <Input
            id="new-sense-definition"
            name="definition"
            placeholder="full definition"
          />
        </div>
        <div>
          <AdminSubmit variant="outline">Add sense</AdminSubmit>
        </div>
      </ActionForm>
    </div>
  );
}
