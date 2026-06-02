import { XIcon } from "lucide-react";

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
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface Props {
  vocabularyId: string;
  senseId: string;
  translations: AdminTranslation[];
}

/** Translations sub-editor for one sense: list + delete + add. */
export function TranslationEditor({ vocabularyId, senseId, translations }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Translations
      </p>

      {translations.length > 0 && (
        <ul className="flex flex-col gap-1">
          {translations.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span>
                <span className="text-muted-foreground">{t.language}:</span>{" "}
                {t.translation}
              </span>
              <form action={deleteTranslationAction}>
                <input type="hidden" name="vocabularyId" value={vocabularyId} />
                <input type="hidden" name="senseId" value={senseId} />
                <input type="hidden" name="translationId" value={t.id} />
                <ConfirmButton
                  variant="ghost"
                  size="icon-xs"
                  message="Remove this translation?"
                  aria-label="Remove translation"
                >
                  <XIcon className="text-muted-foreground" />
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <ActionForm
        action={addTranslationAction}
        resetOnSuccess
        className="flex flex-wrap items-center gap-2"
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
          placeholder="Add a translation"
          aria-label="Translation"
          className="h-8 w-48"
        />
        <AdminSubmit variant="outline">Add</AdminSubmit>
      </ActionForm>
    </div>
  );
}
