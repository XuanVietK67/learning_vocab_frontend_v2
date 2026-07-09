"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2Icon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bulkImportAction } from "@/lib/admin/actions";
import type { BulkImportSummary, ImportResult } from "@/lib/admin/types";

const INITIAL: ImportResult = { ok: false };

const PLACEHOLDER = `[
  {
    "language": "en",
    "lemma": "apple",
    "partOfSpeech": "noun",
    "senses": [
      {
        "gloss": "fruit",
        "translations": [{ "language": "vi", "translation": "quả táo" }],
        "examples": [{ "sentence": "I ate an apple." }]
      }
    ]
  }
]`;

const SUMMARY_FIELDS: { key: keyof BulkImportSummary; label: string }[] = [
  { key: "upserted", label: "Upserted" },
  { key: "inserted", label: "Inserted" },
  { key: "updated", label: "Updated" },
  { key: "sensesAdded", label: "Senses added" },
  { key: "translationsAdded", label: "Translations added" },
  { key: "examplesAdded", label: "Examples added" },
  { key: "topicLinksAdded", label: "Topic links added" },
];

export function ImportForm() {
  const [state, formAction, pending] = useActionState(bulkImportAction, INITIAL);
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Paste a JSON array of items, or load a <code>.json</code> file. Up to
          500 items; upserts by natural key.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon className="size-4" />
          Load file
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      <textarea
        name="items"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder={PLACEHOLDER}
        className="min-h-72 w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      {state.ok && state.summary && (
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="mb-2 text-sm font-medium text-primary">Import complete</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
            {SUMMARY_FIELDS.map((field) => (
              <div key={field.key} className="flex justify-between gap-2">
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="font-medium tabular-nums">
                  {state.summary![field.key]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? "Importing…" : "Import"}
        </Button>
      </div>
    </form>
  );
}
