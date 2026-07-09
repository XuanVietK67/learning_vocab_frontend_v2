"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CheckIcon, ChevronLeftIcon, Loader2Icon } from "lucide-react";

import { Field, SelectField, TextArea, TextInput } from "@/components/app/field";
import { createDeck } from "@/lib/me/deck-actions";
import { CEFR_LEVELS } from "@/lib/admin/types";
import { LANGUAGES } from "@/lib/languages";

const CEFR_OPTIONS = CEFR_LEVELS.map((c) => ({ value: c, label: c }));

/**
 * Create-list form (§6.2). Minimal fields — name, description, language, CEFR.
 * Lists are always private (the backend owns visibility), so there's no
 * publish control here. On success, navigate into the new list to fill it.
 */
export function CreateListForm({ appLanguage }: { appLanguage: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState(appLanguage);
  const [cefrLevel, setCefrLevel] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameInvalid = submitted && (!name.trim() || name.length > 80);

  async function save() {
    setSubmitted(true);
    if (!name.trim() || name.length > 80) return;
    setSaving(true);
    const res = await createDeck({
      name,
      description: description.trim() || undefined,
      language,
      cefrLevel: cefrLevel || undefined,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Created "${name.trim()}"`, { description: "Add words one at a time or in bulk." });
    router.push(`/decks/${res.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/decks"
        className="mb-3.5 inline-flex items-center gap-1 text-[13px] text-(--ink-3) hover:text-(--ink)"
      >
        <ChevronLeftIcon className="size-4" /> Lists
      </Link>

      <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">New list</h1>
      <p className="mt-1 mb-6 text-sm text-(--ink-2)">
        Give it a name now — add words after, one at a time or in bulk.
      </p>

      <div className="lr-card flex flex-col gap-4 p-5">
        <Field
          label="List name"
          required
          error={nameInvalid ? "Enter a name (1–80 characters)." : null}
        >
          <TextInput
            value={name}
            invalid={nameInvalid}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
            }}
            placeholder="e.g. C1 Advanced — Reading"
            className="font-heading text-base font-semibold"
          />
        </Field>
        <Field label="Description" optional>
          <TextArea
            value={description}
            maxLength={280}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this list for?"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Language" hint="Words in this list">
            <SelectField value={language} onChange={setLanguage} options={LANGUAGES} />
          </Field>
          <Field label="CEFR" optional>
            <SelectField
              value={cefrLevel}
              onChange={setCefrLevel}
              options={CEFR_OPTIONS}
              placeholder="—"
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <Link href="/decks" className="lr-btn lr-btn--ghost lr-btn--md">
          Cancel
        </Link>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="lr-btn lr-btn--primary lr-btn--md"
        >
          {saving ? <Loader2Icon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
          {saving ? "Creating…" : "Create list"}
        </button>
      </div>
    </div>
  );
}
