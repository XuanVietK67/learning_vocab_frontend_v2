"use client";

import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVocabularyAction } from "@/lib/admin/actions";
import { CEFR_LEVELS } from "@/lib/admin/types";
import { LANGUAGES } from "@/lib/languages";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Create a system vocabulary with one seed sense. Translations/examples beyond
 * this first pair are added afterwards in the detail editor; on success the
 * action redirects there.
 */
export function CreateVocabForm() {
  return (
    <ActionForm action={createVocabularyAction} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="lemma">Lemma</Label>
          <Input id="lemma" name="lemma" required placeholder="serendipity" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="partOfSpeech">Part of speech</Label>
          <Input
            id="partOfSpeech"
            name="partOfSpeech"
            required
            placeholder="noun"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            name="language"
            defaultValue="en"
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
            defaultValue=""
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
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="ipa">IPA (optional)</Label>
          <Input id="ipa" name="ipa" placeholder="/ˌser.ənˈdɪp.ə.ti/" />
        </div>
      </div>

      <fieldset className="grid gap-4 rounded-lg border border-border/60 p-4">
        <legend className="px-1 text-sm font-medium">First sense</legend>
        <div className="grid gap-2">
          <Label htmlFor="gloss">Gloss</Label>
          <Input id="gloss" name="gloss" placeholder="fortunate accident" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="definition">Definition</Label>
          <Input
            id="definition"
            name="definition"
            placeholder="the occurrence of events by chance in a happy way"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <div className="grid gap-2">
            <Label htmlFor="translationLang">Translation lang</Label>
            <select
              id="translationLang"
              name="translationLang"
              defaultValue=""
              className={selectClass}
            >
              <option value="">— None —</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.value}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="translation">Translation</Label>
            <Input
              id="translation"
              name="translation"
              placeholder="sự tình cờ may mắn"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="exampleSentence">Example sentence</Label>
          <Input
            id="exampleSentence"
            name="exampleSentence"
            placeholder="Meeting her was pure serendipity."
          />
        </div>
      </fieldset>

      <div>
        <AdminSubmit>Create word</AdminSubmit>
      </div>
    </ActionForm>
  );
}
