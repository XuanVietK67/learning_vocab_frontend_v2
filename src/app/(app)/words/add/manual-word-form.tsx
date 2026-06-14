"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  ImageIcon,
  Loader2Icon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { CharCounter, Field, RadioCards, SelectField, TextArea, TextInput } from "@/components/app/field";
import { ChipsInput, TopicPicker } from "@/components/app/chips-input";
import type { TopicOption } from "./add-word-screen";
import { createUserVocabulary } from "@/lib/me/vocabulary-actions";
import { CEFR_LEVELS, PARTS_OF_SPEECH } from "@/lib/admin/types";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";

const POS_OPTIONS = PARTS_OF_SPEECH.map((p) => ({
  value: p,
  label: p.charAt(0).toUpperCase() + p.slice(1),
}));
const CEFR_OPTIONS = CEFR_LEVELS.map((c) => ({ value: c, label: c }));

interface ExampleDraft {
  id: string;
  sentence: string;
  translation: string;
}
interface TranslationDraft {
  id: string;
  language: string;
  translation: string;
  note: string;
}
interface SenseDraft {
  id: string;
  gloss: string;
  definition: string;
  imageUrl: string;
  synonyms: string[];
  antonyms: string[];
  translations: TranslationDraft[];
  examples: ExampleDraft[];
  collapsed: boolean;
}
interface WordDraft {
  lemma: string;
  language: string;
  partOfSpeech: string;
  ipa: string;
  cefrLevel: string;
  frequencyRank: string;
  topics: string[];
  audioMode: "auto" | "url";
  audioUrl: string;
  senses: SenseDraft[];
}

const uid = () => crypto.randomUUID();
const newExample = (): ExampleDraft => ({ id: uid(), sentence: "", translation: "" });
const newTranslation = (lang: string): TranslationDraft => ({
  id: uid(),
  language: lang,
  translation: "",
  note: "",
});
const newSense = (): SenseDraft => ({
  id: uid(),
  gloss: "",
  definition: "",
  imageUrl: "",
  synonyms: [],
  antonyms: [],
  translations: [],
  examples: [newExample(), newExample()], // seed two (the API minimum)
  collapsed: false,
});

/** Mirror the API rules client-side so the user gets instant feedback. */
function validate(form: WordDraft): {
  errors: Record<string, string>;
  valid: boolean;
  reasons: string[];
} {
  const errors: Record<string, string> = {};
  const reasons: string[] = [];

  if (!form.lemma.trim()) reasons.push("Word is required");
  else if (form.lemma.length > 128) errors["lemma"] = "Max 128 characters.";
  if (!form.language) reasons.push("Language is required");
  if (!form.partOfSpeech) reasons.push("Part of speech is required");
  if (form.ipa && form.ipa.length > 128) errors["ipa"] = "Max 128 characters.";
  if (form.frequencyRank.trim()) {
    const n = Number(form.frequencyRank);
    if (!Number.isInteger(n) || n < 0) errors["frequencyRank"] = "Whole number ≥ 0.";
  }
  if (form.audioMode === "url" && form.audioUrl.length > 512)
    errors["audioUrl"] = "Max 512 characters.";

  form.senses.forEach((s, si) => {
    if (s.gloss.length > 128) errors[`senses.${si}.gloss`] = "Max 128 characters.";
    if (s.definition.length > 2000) errors[`senses.${si}.definition`] = "Max 2000 characters.";
    const filled = s.examples.filter((e) => e.sentence.trim()).length;
    if (filled < 2) {
      errors[`senses.${si}.examples`] = "Each sense needs at least 2 examples.";
      reasons.push(`Sense ${si + 1} needs 2 examples`);
    }
    s.examples.forEach((e, ei) => {
      if (e.sentence.length > 1000)
        errors[`senses.${si}.examples.${ei}.sentence`] = "Max 1000 characters.";
    });
    s.translations.forEach((t, ti) => {
      if (t.translation.trim() && !t.language)
        errors[`senses.${si}.translations.${ti}.language`] = "Pick a language.";
      if (t.translation.length > 255)
        errors[`senses.${si}.translations.${ti}.translation`] = "Max 255 characters.";
    });
  });

  const hardValid =
    Boolean(form.lemma.trim() && form.language && form.partOfSpeech) &&
    form.senses.every((s) => s.examples.filter((e) => e.sentence.trim()).length >= 2);

  return { errors, valid: hardValid && Object.keys(errors).length === 0, reasons: [...new Set(reasons)] };
}

/** Shape the draft into the `POST /v1/me/vocabularies` body, dropping blanks. */
function buildPayload(d: WordDraft) {
  const clean = (s: string) => s.trim() || undefined;
  return {
    language: d.language,
    lemma: d.lemma.trim(),
    partOfSpeech: d.partOfSpeech,
    ipa: clean(d.ipa),
    cefrLevel: d.cefrLevel || undefined,
    frequencyRank: d.frequencyRank.trim() ? Number(d.frequencyRank) : undefined,
    ...(d.audioMode === "url" && d.audioUrl.trim() ? { audioUrl: d.audioUrl.trim() } : {}),
    topics: d.topics,
    senses: d.senses.map((s) => ({
      gloss: clean(s.gloss),
      definition: clean(s.definition),
      imageUrl: clean(s.imageUrl),
      synonyms: s.synonyms,
      antonyms: s.antonyms,
      translations: s.translations
        .filter((t) => t.translation.trim())
        .map((t) => ({ language: t.language, translation: t.translation.trim(), note: clean(t.note) })),
      examples: s.examples
        .filter((e) => e.sentence.trim())
        .map((e) => ({ sentence: e.sentence.trim(), translation: clean(e.translation) })),
    })),
  };
}

/**
 * The manual full form (Way 3) — the centerpiece. Authors the word header plus
 * a sense repeater (each with translations + ≥2 examples) and saves it
 * atomically. Maps the backend's 201 / 409 / 400 inline and never clears the
 * form on error. Opens pre-filled when the user falls back from a failed
 * quick-add.
 */
export function ManualWordForm({
  prefillLemma,
  fromFailed,
  appLanguage,
  nativeLanguage,
  topics,
  onBack,
}: {
  prefillLemma: string;
  fromFailed: boolean;
  appLanguage: string;
  nativeLanguage: string;
  topics: TopicOption[];
  onBack: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<WordDraft>(() => ({
    lemma: prefillLemma,
    language: appLanguage,
    partOfSpeech: "",
    ipa: "",
    cefrLevel: "",
    frequencyRank: "",
    topics: [],
    audioMode: "auto",
    audioUrl: "",
    senses: [newSense()],
  }));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [duplicate, setDuplicate] = useState(false);

  const { errors: clientErrors, valid, reasons } = validate(form);
  const errors = submitted ? { ...clientErrors, ...serverErrors } : serverErrors;

  const set = (patch: Partial<WordDraft>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDuplicate(false);
    setServerErrors({});
  };
  const setSense = (i: number, patch: Partial<SenseDraft>) =>
    setForm((f) => ({ ...f, senses: f.senses.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  const addSense = () =>
    setForm((f) => (f.senses.length < 16 ? { ...f, senses: [...f.senses, newSense()] } : f));
  const removeSense = (i: number) =>
    setForm((f) =>
      f.senses.length > 1 ? { ...f, senses: f.senses.filter((_, j) => j !== i) } : f,
    );
  const moveSense = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.senses.length) return f;
      const senses = [...f.senses];
      [senses[i], senses[j]] = [senses[j], senses[i]];
      return { ...f, senses };
    });

  async function doSave() {
    setSubmitted(true);
    if (!valid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    const res = await createUserVocabulary(JSON.stringify(buildPayload(form)));
    setSaving(false);

    if (res.ok) {
      toast.success(`Added "${form.lemma.trim()}"`, {
        description: "Saved instantly. Audio is processing.",
      });
      router.push("/words");
      router.refresh();
      return;
    }
    if (res.status === 409) {
      setDuplicate(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if ("fieldErrors" in res) {
      setServerErrors(res.fieldErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.error(res.message);
      return;
    }
    toast.error(res.message);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:pt-10 lg:pb-32">
      <button
        type="button"
        onClick={onBack}
        className="mb-3.5 inline-flex items-center gap-1 text-[13px] text-(--ink-3) hover:text-(--ink)"
      >
        <ChevronLeftIcon className="size-4" /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">
            Add a word
          </h1>
          <p className="mt-1 text-sm text-(--ink-2)">
            Full control — you author every field. Saved instantly, ready to study.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={doSave}
          className="lr-btn lr-btn--primary lr-btn--md shrink-0"
        >
          {saving ? <Loader2Icon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {fromFailed && (
        <div className="mt-4 flex items-start gap-2.5 rounded-[18px] border border-(--line-2) bg-(--card-2) px-4 py-3">
          <SparklesIcon className="mt-0.5 size-4 shrink-0 text-(--ink-3)" />
          <p className="text-[13px] text-(--ink-2)">
            We couldn’t auto-build <strong className="text-(--ink)">{prefillLemma}</strong> — no
            problem, fill it in yourself below. We’ve carried the word over.
          </p>
        </div>
      )}

      {/* Word header */}
      <section className="lr-card mt-5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-heading text-lg font-bold tracking-tight text-(--ink)">Word</h2>
          <span className="text-[12.5px] text-(--ink-3)">The subject of the entry</span>
        </div>

        {duplicate && (
          <div className="mb-4 flex items-start gap-2.5 rounded-[14px] border border-(--amber)/40 bg-(--amber-soft) px-3.5 py-3">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-(--amber-2)" />
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold text-(--ink)">You already have this word</p>
              <p className="mt-0.5 text-[12.5px] text-(--ink-2)">
                You own “{form.lemma}” ({form.partOfSpeech || "—"}) already.
              </p>
              <a
                href="/words"
                className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-(--primary-ink) hover:underline"
              >
                Open My Words <ExternalLinkIcon className="size-3" />
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Field label="Word (lemma)" required error={errors["lemma"]}>
            <TextInput
              value={form.lemma}
              invalid={Boolean(errors["lemma"]) || duplicate}
              maxLength={128}
              onChange={(e) => set({ lemma: e.target.value })}
              placeholder="resilient"
              className="font-heading text-base font-semibold"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Language" required error={errors["language"]}>
              <SelectField
                value={form.language}
                onChange={(v) => set({ language: v })}
                options={LANGUAGES}
                invalid={Boolean(errors["language"])}
              />
            </Field>
            <Field label="Part of speech" required error={errors["partOfSpeech"]}>
              <SelectField
                value={form.partOfSpeech}
                onChange={(v) => set({ partOfSpeech: v })}
                options={POS_OPTIONS}
                placeholder="Select…"
                invalid={Boolean(errors["partOfSpeech"])}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="IPA" optional error={errors["ipa"]}>
              <TextInput
                mono
                value={form.ipa}
                invalid={Boolean(errors["ipa"])}
                maxLength={128}
                onChange={(e) => set({ ipa: e.target.value })}
                placeholder="/rɪˈzɪliənt/"
              />
            </Field>
            <Field label="CEFR" optional>
              <SelectField
                value={form.cefrLevel}
                onChange={(v) => set({ cefrLevel: v })}
                options={CEFR_OPTIONS}
                placeholder="—"
              />
            </Field>
            <Field label="Frequency rank" optional error={errors["frequencyRank"]}>
              <TextInput
                type="number"
                min={0}
                value={form.frequencyRank}
                invalid={Boolean(errors["frequencyRank"])}
                onChange={(e) => set({ frequencyRank: e.target.value })}
                placeholder="4821"
                className="tnum"
              />
            </Field>
          </div>

          {topics.length > 0 && (
            <Field
              label="Topics"
              optional
              hint="Pick from existing topics — custom topics aren't allowed."
            >
              <TopicPicker value={form.topics} options={topics} onChange={(v) => set({ topics: v })} />
            </Field>
          )}

          <Field label="Audio" optional>
            <RadioCards
              name="audio"
              value={form.audioMode}
              onChange={(v) => set({ audioMode: v as "auto" | "url" })}
              options={[
                { value: "auto", label: "Auto-generate", desc: "We'll synthesize pronunciation audio after saving." },
                { value: "url", label: "Paste a URL", desc: "Provide your own audio file link." },
              ]}
            />
            {form.audioMode === "url" && (
              <TextInput
                value={form.audioUrl}
                invalid={Boolean(errors["audioUrl"])}
                maxLength={512}
                onChange={(e) => set({ audioUrl: e.target.value })}
                placeholder="https://…/resilient.mp3"
                className="mt-2"
              />
            )}
          </Field>
        </div>
      </section>

      {/* Senses */}
      <div className="mt-6 mb-2 flex items-center gap-2.5">
        <h2 className="font-heading text-lg font-bold tracking-tight text-(--ink)">Senses</h2>
        <span className="text-[12.5px] text-(--ink-3)">
          {form.senses.length}/16 · each needs ≥ 2 examples
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        {form.senses.map((sense, i) => (
          <SenseCard
            key={sense.id}
            sense={sense}
            index={i}
            total={form.senses.length}
            nativeLanguage={nativeLanguage}
            errors={errors}
            onChange={(patch) => setSense(i, patch)}
            onMove={(dir) => moveSense(i, dir)}
            onRemove={() => removeSense(i)}
          />
        ))}
        <button
          type="button"
          onClick={addSense}
          disabled={form.senses.length >= 16}
          className="lr-btn lr-btn--soft w-full border border-dashed border-(--line-2) disabled:opacity-50"
        >
          <PlusIcon className="size-4" /> Add another sense
        </button>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-(--line) bg-(--surface)/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <p
          className={cn(
            "flex items-center gap-1.5 text-[12.5px]",
            valid ? "text-(--ink-3)" : "text-(--amber-2)",
          )}
        >
          {valid ? (
            <>
              <CheckIcon className="size-4 text-(--ok)" /> Ready to save
            </>
          ) : (
            <>
              <TriangleAlertIcon className="size-4" />
              {reasons[0] ?? "Complete required fields"}
              {reasons.length > 1 && ` · +${reasons.length - 1} more`}
            </>
          )}
        </p>
        <div className="flex gap-2.5">
          <button type="button" onClick={onBack} className="lr-btn lr-btn--ghost lr-btn--md">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={doSave}
            className="lr-btn lr-btn--primary lr-btn--md"
          >
            {saving ? <Loader2Icon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
            {saving ? "Saving…" : "Save word"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sense card ─────────────────────────────────────────────────────────── */

function SenseCard({
  sense,
  index,
  total,
  nativeLanguage,
  errors,
  onChange,
  onMove,
  onRemove,
}: {
  sense: SenseDraft;
  index: number;
  total: number;
  nativeLanguage: string;
  errors: Record<string, string>;
  onChange: (patch: Partial<SenseDraft>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const ek = (suffix: string) => errors[`senses.${index}.${suffix}`];
  const filledExamples = sense.examples.filter((e) => e.sentence.trim()).length;
  const canRemoveExample = sense.examples.length > 2;

  const updateExample = (i: number, patch: Partial<ExampleDraft>) =>
    onChange({ examples: sense.examples.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const updateTranslation = (i: number, patch: Partial<TranslationDraft>) =>
    onChange({ translations: sense.translations.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  return (
    <section
      className={cn(
        "rounded-[22px] border bg-(--surface) shadow-(--sh-sm)",
        ek("examples") ? "border-(--bad)/40" : "border-(--line)",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3",
          !sense.collapsed && "border-b border-(--line)",
        )}
      >
        <button
          type="button"
          onClick={() => onChange({ collapsed: !sense.collapsed })}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronDownIcon
            className={cn("size-4 text-(--ink-3) transition-transform", sense.collapsed && "-rotate-90")}
          />
          <span className="font-heading text-base font-semibold text-(--ink)">Sense {index + 1}</span>
          {sense.gloss && (
            <span className="truncate text-[13px] text-(--ink-3)">· {sense.gloss}</span>
          )}
        </button>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            filledExamples >= 2
              ? "bg-(--muted) text-(--ink-3)"
              : "bg-(--amber-soft) text-(--amber-2)",
          )}
        >
          {filledExamples >= 2 ? <CheckIcon className="size-3" /> : <TriangleAlertIcon className="size-3" />}
          {filledExamples}/2+ examples
        </span>
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          aria-label="Move sense up"
          className="lr-icon-btn size-8 disabled:opacity-30"
        >
          <ChevronUpIcon className="size-4" />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          aria-label="Move sense down"
          className="lr-icon-btn size-8 disabled:opacity-30"
        >
          <ChevronDownIcon className="size-4" />
        </button>
        <button
          type="button"
          disabled={total <= 1}
          onClick={onRemove}
          aria-label="Remove sense"
          className="lr-icon-btn size-8 text-(--bad-ink) disabled:opacity-30"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>

      {!sense.collapsed && (
        <div className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Gloss" optional hint="A short label for this meaning" error={ek("gloss")}>
              <TextInput
                value={sense.gloss}
                invalid={Boolean(ek("gloss"))}
                maxLength={128}
                onChange={(e) => onChange({ gloss: e.target.value })}
                placeholder="e.g. able to recover"
              />
            </Field>
            <Field label="Image" optional hint="Paste an image URL">
              <div className="relative">
                <ImageIcon className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--ink-3)" />
                <TextInput
                  value={sense.imageUrl}
                  maxLength={512}
                  onChange={(e) => onChange({ imageUrl: e.target.value })}
                  placeholder="https://…"
                  className="pl-10"
                />
              </div>
            </Field>
          </div>

          <Field label="Definition" optional error={ek("definition")}>
            <TextArea
              value={sense.definition}
              invalid={Boolean(ek("definition"))}
              maxLength={2000}
              onChange={(e) => onChange({ definition: e.target.value })}
              placeholder="Able to recover quickly from difficulties."
            />
            <div className="flex justify-end">
              <CharCounter value={sense.definition.length} max={2000} />
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Synonyms" optional>
              <ChipsInput
                value={sense.synonyms}
                onChange={(v) => onChange({ synonyms: v })}
                tone="syn"
                placeholder="tough, hardy…"
              />
            </Field>
            <Field label="Antonyms" optional>
              <ChipsInput
                value={sense.antonyms}
                onChange={(v) => onChange({ antonyms: v })}
                tone="ant"
                placeholder="fragile…"
              />
            </Field>
          </div>

          {/* Translations */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-(--ink)">Translations</span>
              <span className="text-[12px] text-(--ink-3)">optional · up to 16</span>
            </div>
            {sense.translations.map((t, i) => (
              <div key={t.id} className="flex items-start gap-2">
                <SelectField
                  value={t.language}
                  onChange={(v) => updateTranslation(i, { language: v })}
                  options={LANGUAGES}
                  invalid={Boolean(ek(`translations.${i}.language`))}
                  className="w-36 shrink-0"
                />
                <div className="relative flex-1">
                  <TextInput
                    value={t.translation}
                    invalid={Boolean(ek(`translations.${i}.translation`))}
                    maxLength={255}
                    onChange={(e) => updateTranslation(i, { translation: e.target.value })}
                    placeholder="Translation"
                    className="pr-14"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2">
                    <CharCounter value={t.translation.length} max={255} />
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Remove translation"
                  onClick={() =>
                    onChange({ translations: sense.translations.filter((_, j) => j !== i) })
                  }
                  className="lr-icon-btn size-9 text-(--ink-3) hover:text-(--bad-ink)"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={sense.translations.length >= 16}
              onClick={() =>
                onChange({ translations: [...sense.translations, newTranslation(nativeLanguage)] })
              }
              className="lr-btn lr-btn--ghost lr-btn--sm w-fit text-(--ink-2)"
            >
              <PlusIcon className="size-3.5" /> Add translation
            </button>
          </div>

          {/* Examples */}
          <div className="flex flex-col gap-2.5 border-t border-(--line) pt-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-(--ink)">
                Examples <span className="text-(--bad)">*</span>
              </span>
              <span
                className={cn(
                  "text-[12px]",
                  ek("examples") ? "text-(--bad-ink)" : "text-(--ink-3)",
                )}
              >
                at least 2 — one is held out for testing
              </span>
            </div>
            {sense.examples.map((ex, i) => (
              <div key={ex.id} className="flex items-start gap-2.5">
                <span className="tnum w-4 shrink-0 pt-2.5 text-right font-mono text-[13px] text-(--ink-3)">
                  {i + 1}
                </span>
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="relative">
                    <TextInput
                      value={ex.sentence}
                      invalid={Boolean(ek(`examples.${i}.sentence`))}
                      maxLength={1000}
                      onChange={(e) => updateExample(i, { sentence: e.target.value })}
                      placeholder="Example sentence"
                      className="pr-16"
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2">
                      <CharCounter value={ex.sentence.length} max={1000} />
                    </span>
                  </div>
                  <TextInput
                    value={ex.translation}
                    maxLength={1000}
                    onChange={(e) => updateExample(i, { translation: e.target.value })}
                    placeholder="Translation (optional)"
                    className="text-[13px] text-(--ink-2)"
                  />
                </div>
                <button
                  type="button"
                  disabled={!canRemoveExample}
                  aria-label="Remove example"
                  title={canRemoveExample ? "Remove example" : "Each sense needs at least 2 examples"}
                  onClick={() =>
                    canRemoveExample &&
                    onChange({ examples: sense.examples.filter((_, j) => j !== i) })
                  }
                  className="lr-icon-btn mt-1 size-9 text-(--ink-3) hover:text-(--bad-ink) disabled:opacity-30"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
            {ek("examples") && (
              <span className="ml-6 flex items-center gap-1.5 text-[12.5px] text-(--bad-ink)">
                <TriangleAlertIcon className="size-3.5" /> {ek("examples")}
              </span>
            )}
            <button
              type="button"
              disabled={sense.examples.length >= 16}
              onClick={() => onChange({ examples: [...sense.examples, newExample()] })}
              className="lr-btn lr-btn--soft lr-btn--sm w-fit"
            >
              <PlusIcon className="size-3.5" /> Add example
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
