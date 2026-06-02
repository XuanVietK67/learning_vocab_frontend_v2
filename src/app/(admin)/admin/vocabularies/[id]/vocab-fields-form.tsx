"use client";

import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVocabularyFieldsAction } from "@/lib/admin/actions";
import { CEFR_LEVELS } from "@/lib/admin/types";
import type { VocabularyDetail } from "@/lib/admin/types";
import { LANGUAGES } from "@/lib/languages";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Edit a vocabulary's top-level fields (`PATCH /v1/admin/vocabularies/:id`). */
export function VocabFieldsForm({ vocab }: { vocab: VocabularyDetail }) {
  return (
    <ActionForm
      action={updateVocabularyFieldsAction}
      successMessage="Saved"
      className="grid gap-4"
    >
      <input type="hidden" name="id" value={vocab.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="lemma">Lemma</Label>
          <Input id="lemma" name="lemma" defaultValue={vocab.lemma} required />
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

      <div>
        <AdminSubmit>Save changes</AdminSubmit>
      </div>
    </ActionForm>
  );
}
