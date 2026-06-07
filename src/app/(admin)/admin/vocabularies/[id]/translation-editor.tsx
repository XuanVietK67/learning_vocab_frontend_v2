import { LanguagesIcon, XIcon } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Input } from "@/components/ui/input";
import {
  addTranslationAction,
  deleteTranslationAction,
} from "@/lib/admin/actions";
import type { AdminTranslation } from "@/lib/admin/types";
import { LANGUAGES } from "@/lib/languages";

const selectClass =
  "h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface Props {
  vocabularyId: string;
  senseId: string;
  translations: AdminTranslation[];
}

/** Translations sub-editor for one sense: list + delete + add. */
export function TranslationEditor({ vocabularyId, senseId, translations }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <LanguagesIcon className="size-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Translations
        </span>
        {translations.length > 0 && (
          <span className="min-w-[17px] rounded-full bg-muted px-1.5 text-center text-[10.5px] font-semibold text-muted-foreground">
            {translations.length}
          </span>
        )}
      </div>

      {translations.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          No translations yet — add the first below.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {translations.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-0.5 pr-1 pl-1.5 text-[13px]"
            >
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-muted-foreground uppercase">
                {t.language}
              </span>
              <span>{t.translation}</span>
              <form action={deleteTranslationAction}>
                <input type="hidden" name="vocabularyId" value={vocabularyId} />
                <input type="hidden" name="senseId" value={senseId} />
                <input type="hidden" name="translationId" value={t.id} />
                <ConfirmButton
                  variant="ghost"
                  size="icon-xs"
                  message="Remove this translation?"
                  aria-label={`Remove ${t.language} translation`}
                >
                  <XIcon className="text-muted-foreground" />
                </ConfirmButton>
              </form>
            </span>
          ))}
        </div>
      )}

      <ActionForm
        action={addTranslationAction}
        resetOnSuccess
        className="flex items-center gap-2"
      >
        <input type="hidden" name="vocabularyId" value={vocabularyId} />
        <input type="hidden" name="senseId" value={senseId} />
        <select
          name="language"
          defaultValue="vi"
          aria-label="Translation language"
          className={selectClass}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.value}
            </option>
          ))}
        </select>
        <Input
          name="translation"
          placeholder="Add a translation…"
          aria-label="Translation"
          className="h-8 min-w-0 flex-1"
        />
        <AdminSubmit variant="outline">Add</AdminSubmit>
      </ActionForm>
    </div>
  );
}
