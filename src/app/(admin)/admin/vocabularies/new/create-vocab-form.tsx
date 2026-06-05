"use client";

import { BookOpenIcon, LayersIcon, PlusIcon, TagsIcon } from "lucide-react";
import { useState } from "react";

import { type Accent, SectionCard } from "@/components/admin/section-card";
import {
  SenseFieldset,
  emptySense,
  type SenseDraft,
} from "./sense-fieldset";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVocabularyAction } from "@/lib/admin/actions";
import { CEFR_LEVELS, PARTS_OF_SPEECH, type Topic } from "@/lib/admin/types";
import { LANGUAGES } from "@/lib/languages";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Accent colors cycled across senses so each is visually distinct. */
const SENSE_ACCENTS: Accent[] = [
  "indigo",
  "emerald",
  "amber",
  "sky",
  "violet",
  "rose",
];

interface VocabDraft {
  language: string;
  lemma: string;
  partOfSpeech: string;
  ipa: string;
  cefrLevel: string;
  frequencyRank: string;
  topics: string[];
  senses: SenseDraft[];
}

function initialDraft(): VocabDraft {
  return {
    language: "en",
    lemma: "",
    partOfSpeech: "noun",
    ipa: "",
    cefrLevel: "",
    frequencyRank: "",
    topics: [],
    senses: [emptySense()],
  };
}

/** Trim the draft and drop blank rows, shaping it for the create payload. */
function buildPayload(d: VocabDraft) {
  const clean = (s: string) => s.trim() || undefined;
  return {
    language: d.language,
    lemma: d.lemma.trim(),
    partOfSpeech: d.partOfSpeech,
    ipa: clean(d.ipa),
    cefrLevel: d.cefrLevel || undefined,
    frequencyRank: d.frequencyRank.trim() ? Number(d.frequencyRank) : undefined,
    topics: d.topics,
    senses: d.senses.map((s) => ({
      gloss: clean(s.gloss),
      definition: clean(s.definition),
      imageUrl: clean(s.imageUrl),
      synonyms: s.synonyms,
      antonyms: s.antonyms,
      translations: s.translations
        .filter((t) => t.translation.trim())
        .map((t) => ({
          language: t.language,
          translation: t.translation.trim(),
          note: clean(t.note),
        })),
      examples: s.examples
        .filter((e) => e.sentence.trim())
        .map((e) => ({
          sentence: e.sentence.trim(),
          translation: clean(e.translation),
        })),
    })),
  };
}

/**
 * Authors a full system vocabulary — multiple senses, each with translations,
 * examples (≥2), synonyms/antonyms, and an image — and submits it in one atomic
 * `POST /v1/admin/vocabularies`. The whole draft lives in client state and is
 * serialized into a single hidden `payload` field; the Server Action
 * re-validates and, on success, redirects to the editor.
 */
export function CreateVocabForm({ topics }: { topics: Topic[] }) {
  const [draft, setDraft] = useState<VocabDraft>(initialDraft);

  const set = (patch: Partial<VocabDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const patchSense = (i: number, patch: Partial<SenseDraft>) =>
    setDraft((d) => ({
      ...d,
      senses: d.senses.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    }));

  const moveSense = (i: number, direction: -1 | 1) =>
    setDraft((d) => {
      const j = i + direction;
      if (j < 0 || j >= d.senses.length) return d;
      const senses = [...d.senses];
      [senses[i], senses[j]] = [senses[j], senses[i]];
      return { ...d, senses };
    });

  const toggleTopic = (slug: string) =>
    setDraft((d) => ({
      ...d,
      topics: d.topics.includes(slug)
        ? d.topics.filter((s) => s !== slug)
        : [...d.topics, slug],
    }));

  return (
    <ActionForm action={createVocabularyAction} className="grid gap-5">
      <input
        type="hidden"
        name="payload"
        value={JSON.stringify(buildPayload(draft))}
      />

      {/* Word details */}
      <SectionCard
        accent="indigo"
        icon={<BookOpenIcon />}
        title="Word details"
        description="The headword and how it's classified."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="lemma">Lemma</Label>
            <Input
              id="lemma"
              value={draft.lemma}
              onChange={(e) => set({ lemma: e.target.value })}
              placeholder="ephemeral"
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="partOfSpeech">Part of speech</Label>
            <select
              id="partOfSpeech"
              value={draft.partOfSpeech}
              onChange={(e) => set({ partOfSpeech: e.target.value })}
              className={selectClass}
            >
              {PARTS_OF_SPEECH.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={draft.language}
              onChange={(e) => set({ language: e.target.value })}
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
              value={draft.cefrLevel}
              onChange={(e) => set({ cefrLevel: e.target.value })}
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
            <Input
              id="ipa"
              value={draft.ipa}
              onChange={(e) => set({ ipa: e.target.value })}
              placeholder="/əˈfem(ə)rəl/"
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequencyRank">Frequency rank</Label>
            <Input
              id="frequencyRank"
              type="number"
              min={0}
              value={draft.frequencyRank}
              onChange={(e) => set({ frequencyRank: e.target.value })}
              className="bg-background"
            />
          </div>
        </div>
      </SectionCard>

      {/* Topics */}
      {topics.length > 0 && (
        <SectionCard
          accent="violet"
          icon={<TagsIcon />}
          title="Topics"
          description="Link this word to existing topic tags."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {topics.map((topic) => {
              const checked = draft.topics.includes(topic.slug);
              return (
                <label
                  key={topic.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                    checked
                      ? "border-violet-300 bg-violet-100/60 text-violet-900 dark:border-violet-700 dark:bg-violet-500/15 dark:text-violet-100"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(topic.slug)}
                    className="size-4 accent-violet-600"
                  />
                  <span className="truncate">{topic.name}</span>
                </label>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Senses */}
      <div className="grid gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 [&_svg]:size-4.5">
            <LayersIcon />
          </span>
          <div className="grid gap-0.5">
            <h2 className="font-heading text-base leading-none font-semibold tracking-tight">
              Senses
            </h2>
            <p className="text-xs text-muted-foreground">
              Each sense needs at least 2 examples.
            </p>
          </div>
          <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
            {draft.senses.length}
          </span>
        </div>

        {draft.senses.map((sense, i) => (
          <SenseFieldset
            key={i}
            index={i}
            count={draft.senses.length}
            accent={SENSE_ACCENTS[i % SENSE_ACCENTS.length]}
            sense={sense}
            onChange={(patch) => patchSense(i, patch)}
            onMove={(direction) => moveSense(i, direction)}
            onRemove={() =>
              set({ senses: draft.senses.filter((_, j) => j !== i) })
            }
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={() => set({ senses: [...draft.senses, emptySense()] })}
        >
          <PlusIcon /> Add another sense
        </Button>
      </div>

      <div className="flex justify-end">
        <AdminSubmit size="lg">Create word</AdminSubmit>
      </div>
    </ActionForm>
  );
}
