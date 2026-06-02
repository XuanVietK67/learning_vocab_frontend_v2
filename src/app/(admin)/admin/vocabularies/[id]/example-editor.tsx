import { XIcon } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Input } from "@/components/ui/input";
import { addExampleAction, deleteExampleAction } from "@/lib/admin/actions";
import type { AdminExample } from "@/lib/admin/types";

interface Props {
  vocabularyId: string;
  senseId: string;
  examples: AdminExample[];
}

/** Examples sub-editor for one sense: list + delete + add. */
export function ExampleEditor({ vocabularyId, senseId, examples }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Examples
      </p>

      {examples.length > 0 && (
        <ul className="flex flex-col gap-1 border-l-2 border-border pl-3">
          {examples.map((ex) => (
            <li
              key={ex.id}
              className="flex items-start justify-between gap-2 text-sm"
            >
              <span>
                <span className="italic">{ex.sentence}</span>
                {ex.translation && (
                  <span className="text-muted-foreground"> — {ex.translation}</span>
                )}
              </span>
              <form action={deleteExampleAction}>
                <input type="hidden" name="vocabularyId" value={vocabularyId} />
                <input type="hidden" name="senseId" value={senseId} />
                <input type="hidden" name="exampleId" value={ex.id} />
                <ConfirmButton
                  variant="ghost"
                  size="icon-xs"
                  message="Remove this example?"
                  aria-label="Remove example"
                >
                  <XIcon className="text-muted-foreground" />
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <ActionForm
        action={addExampleAction}
        resetOnSuccess
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="vocabularyId" value={vocabularyId} />
        <input type="hidden" name="senseId" value={senseId} />
        <Input
          name="sentence"
          placeholder="Example sentence"
          aria-label="Example sentence"
          className="h-8"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Input
            name="translation"
            placeholder="Translation (optional)"
            aria-label="Example translation"
            className="h-8 w-56"
          />
          <AdminSubmit variant="outline">Add example</AdminSubmit>
        </div>
      </ActionForm>
    </div>
  );
}
