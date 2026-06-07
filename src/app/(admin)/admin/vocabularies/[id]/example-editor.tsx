import { QuoteIcon, XIcon } from "lucide-react";

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
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <QuoteIcon className="size-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Examples
        </span>
        {examples.length > 0 && (
          <span className="min-w-[17px] rounded-full bg-muted px-1.5 text-center text-[10.5px] font-semibold text-muted-foreground">
            {examples.length}
          </span>
        )}
      </div>

      {examples.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          No examples yet — give learners a sentence in context.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {examples.map((ex) => (
            <li
              key={ex.id}
              className="relative flex items-start gap-2.5 rounded-md border border-border bg-background py-2.5 pr-2 pl-3.5"
            >
              <span
                aria-hidden
                className="absolute inset-y-2 left-0 w-[2.5px] rounded bg-primary/35"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[13.5px] leading-snug">{ex.sentence}</span>
                {ex.translation && (
                  <span className="text-xs text-muted-foreground">
                    {ex.translation}
                  </span>
                )}
              </div>
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
          placeholder="Example sentence…"
          aria-label="Example sentence"
          className="h-8"
        />
        <div className="flex items-center gap-2">
          <Input
            name="translation"
            placeholder="Translation (optional)"
            aria-label="Example translation"
            className="h-8 min-w-0 flex-1"
          />
          <AdminSubmit variant="outline">Add example</AdminSubmit>
        </div>
      </ActionForm>
    </div>
  );
}
