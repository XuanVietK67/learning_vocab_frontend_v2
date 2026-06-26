"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2Icon,
  Loader2Icon,
  PlusIcon,
  SparklesIcon,
  TargetIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { cefrBadge, topicLabel } from "@/lib/me/speaking/format";
import {
  createScenarioAction,
  draftScenarioAction,
  publishScenarioAction,
  retireScenarioAction,
  updateScenarioAction,
} from "@/lib/admin/scenarios/actions";
import type { ScenarioDraft, ScenarioStatus } from "@/lib/admin/scenarios/types";
import type { CefrLevel } from "@/lib/auth/types";
import {
  CEFR_VALUES,
  scenarioFormSchema,
  type ScenarioFormValues,
} from "@/lib/validations/scenario";

type FieldErrors = Partial<Record<keyof ScenarioFormValues, string>>;

const TOPIC_RE = /^[a-z0-9-]+$/;

function draftToForm(draft: ScenarioDraft): ScenarioFormValues {
  return {
    title: draft.title ?? "",
    topic: draft.topic ?? "",
    cefrLevel: draft.cefrLevel ?? "",
    setting: draft.setting ?? "",
    aiRole: draft.aiRole ?? "",
    userRole: draft.userRole ?? "",
    goal: draft.goal ?? "",
    openingLine: draft.openingLine ?? "",
    seedPhrases: Array.isArray(draft.seedPhrases) ? draft.seedPhrases.slice(0, 20) : [],
    estTurns: typeof draft.estTurns === "number" ? draft.estTurns : "",
    introVideoScript: draft.introVideoScript ?? "",
  };
}

/**
 * The scenario author form (brief §3.2 / §3.3). Left column = the form grouped as
 * a story (Draft with AI → the scene → the cast → the mission → phrases → pacing);
 * right column = a live scene-card preview that renders exactly what a learner
 * sees, the admin's best feedback loop. The AI draft is convenience only — a 503
 * shows an amber notice and the manual form stays fully usable.
 */
export function ScenarioForm({
  mode,
  scenarioId,
  initial,
  status,
  version,
}: {
  mode: "create" | "edit";
  scenarioId?: string;
  initial: ScenarioFormValues;
  status?: ScenarioStatus;
  version?: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ScenarioFormValues>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, startSaving] = useTransition();

  // Draft-with-AI
  const [brief, setBrief] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftedBy, setDraftedBy] = useState<string | null>(null);
  const [draftFailed, setDraftFailed] = useState(false);

  // Lifecycle (edit)
  const [lifecycle, startLifecycle] = useTransition();
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);

  // Seed phrase composer
  const [phrase, setPhrase] = useState("");

  function set<K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSaved(false);
  }

  async function draft() {
    if (drafting || brief.trim().length < 3) return;
    setDrafting(true);
    setDraftFailed(false);
    setFormError(null);
    const res = await draftScenarioAction({
      brief,
      cefrLevel: form.cefrLevel === "" ? undefined : form.cefrLevel,
      topic: TOPIC_RE.test(form.topic) ? form.topic : undefined,
    });
    setDrafting(false);
    if (res.ok) {
      setForm(draftToForm(res.draft));
      setErrors({});
      setDraftedBy(res.draft.model);
    } else if (res.kind === "unavailable") {
      setDraftFailed(true);
    } else {
      setFormError(res.message);
    }
  }

  function addPhrase() {
    const value = phrase.trim();
    if (!value || form.seedPhrases.length >= 20) return;
    if (!form.seedPhrases.includes(value)) {
      set("seedPhrases", [...form.seedPhrases, value]);
    }
    setPhrase("");
  }

  function submit() {
    const parsed = scenarioFormSchema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ScenarioFormValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setFormError("A few fields need a look.");
      return;
    }
    setFormError(null);
    startSaving(async () => {
      const res =
        mode === "create"
          ? await createScenarioAction(parsed.data)
          : await updateScenarioAction(scenarioId!, parsed.data);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      if (mode === "create") router.push(`/admin/scenarios/${res.id}`);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  function runLifecycle(action: () => Promise<{ ok: boolean; error?: string }>) {
    setLifecycleError(null);
    startLifecycle(async () => {
      const res = await action();
      if (!res.ok) setLifecycleError(res.error ?? "Something went wrong.");
      else router.refresh();
    });
  }

  const badge = cefrBadge(form.cefrLevel === "" ? null : (form.cefrLevel as CefrLevel));

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      {/* ── form column ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        {/* Draft with AI */}
        <section className="lr-card speak-band p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-[18px] text-(--violet)" />
            <h2 className="text-base font-extrabold tracking-[-0.01em] text-(--ink)">
              Draft with AI
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-(--ink-2)">
            Describe the scene in a line — we&apos;ll fill the form for you to edit.
          </p>
          <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
            <input
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void draft();
                }
              }}
              placeholder="e.g. café ordering, B1"
              aria-label="Describe the scene"
              className="lr-input flex-1 py-3! text-[15px]!"
            />
            <button
              type="button"
              onClick={() => void draft()}
              disabled={drafting || brief.trim().length < 3}
              className="lr-btn lr-btn--md shrink-0 bg-(--violet) text-white shadow-[0_8px_18px_-5px_rgba(123,108,255,0.55)] disabled:opacity-50"
            >
              {drafting ? <Loader2Icon className="size-[18px] animate-spin" /> : <SparklesIcon className="size-[18px]" />}
              {drafting ? "Drafting…" : "Draft with AI"}
            </button>
          </div>
          {draftedBy && (
            <p className="mt-2.5 text-[12.5px] font-semibold text-[#4b3fb0]">
              Drafted by {draftedBy} · edit anything below.
            </p>
          )}
          {draftFailed && (
            <p className="mt-2.5 flex items-center gap-2 rounded-xl bg-(--warn-soft) px-3.5 py-2.5 text-[13px] font-semibold text-(--warn-ink)">
              <TriangleAlertIcon className="size-4 shrink-0" />
              AI drafting is unavailable — fill the form manually below.
            </p>
          )}
        </section>

        {/* The scene */}
        <Section title="The scene">
          <Field label="Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ordering at a café"
              className="lr-input py-3! text-[17px]!"
            />
          </Field>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Topic" error={errors.topic} hint="lowercase-slug">
              <input
                value={form.topic}
                onChange={(e) => set("topic", e.target.value.toLowerCase())}
                placeholder="coffee-food"
                className="lr-input py-3! text-[15px]!"
              />
            </Field>
            <Field label="Level" error={errors.cefrLevel}>
              <select
                value={form.cefrLevel}
                onChange={(e) => set("cefrLevel", e.target.value as ScenarioFormValues["cefrLevel"])}
                className="lr-input py-3! text-[15px]!"
              >
                <option value="">Any level</option>
                {CEFR_VALUES.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Setting" error={errors.setting}>
            <textarea
              value={form.setting}
              onChange={(e) => set("setting", e.target.value)}
              rows={3}
              placeholder="A busy café at lunchtime. The barista is friendly but busy."
              className="lr-input resize-y py-3! text-[15px]! leading-relaxed!"
            />
          </Field>
        </Section>

        {/* The cast */}
        <Section title="The cast">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="AI plays" error={errors.aiRole}>
              <div className="flex items-center gap-2.5">
                <Avatar kind="ai" />
                <input
                  value={form.aiRole}
                  onChange={(e) => set("aiRole", e.target.value)}
                  placeholder="barista"
                  className="lr-input py-3! text-[15px]!"
                />
              </div>
            </Field>
            <Field label="Learner plays" error={errors.userRole}>
              <div className="flex items-center gap-2.5">
                <Avatar kind="you" />
                <input
                  value={form.userRole}
                  onChange={(e) => set("userRole", e.target.value)}
                  placeholder="customer"
                  className="lr-input py-3! text-[15px]!"
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* The mission */}
        <Section title="The mission">
          <Field label="Goal" error={errors.goal}>
            <textarea
              value={form.goal}
              onChange={(e) => set("goal", e.target.value)}
              rows={2}
              placeholder="Order a drink and a snack, and ask for the price."
              className="lr-input resize-y py-3! text-[15px]! leading-relaxed!"
            />
          </Field>
          <Field label="Opening line" error={errors.openingLine} hint="the AI's scripted turn 0">
            <textarea
              value={form.openingLine}
              onChange={(e) => set("openingLine", e.target.value)}
              rows={2}
              placeholder="Hi there! What can I get for you today?"
              className="lr-input resize-y py-3! text-[15px]! leading-relaxed!"
            />
          </Field>
        </Section>

        {/* Useful phrases */}
        <Section title="Useful phrases" hint={`${form.seedPhrases.length}/20`}>
          {form.seedPhrases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.seedPhrases.map((p) => (
                <span key={p} className="lr-chip lr-chip--mint text-sm">
                  {p}
                  <button
                    type="button"
                    onClick={() => set("seedPhrases", form.seedPhrases.filter((x) => x !== p))}
                    aria-label={`Remove ${p}`}
                    className="ml-0.5 grid size-4 place-items-center rounded-full text-(--primary-ink)/60 hover:text-(--primary-ink)"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2.5">
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPhrase();
                }
              }}
              placeholder="I'd like…"
              aria-label="Add a useful phrase"
              disabled={form.seedPhrases.length >= 20}
              className="lr-input py-3! text-[15px]!"
            />
            <button
              type="button"
              onClick={addPhrase}
              disabled={!phrase.trim() || form.seedPhrases.length >= 20}
              className="lr-btn lr-btn--soft lr-btn--md shrink-0 disabled:opacity-50"
            >
              <PlusIcon className="size-[18px] order-first" /> Add
            </button>
          </div>
        </Section>

        {/* Pacing & extras */}
        <Section title="Pacing & extras">
          <Field label="Estimated turns" error={errors.estTurns} hint="1–100">
            <input
              type="number"
              min={1}
              max={100}
              value={form.estTurns}
              onChange={(e) => {
                const v = e.target.value;
                set("estTurns", v === "" ? "" : Number(v));
              }}
              placeholder="8"
              className="lr-input w-32 py-3! text-[15px]!"
            />
          </Field>
          <Field label="Intro video script" error={errors.introVideoScript} hint="optional · not shown yet">
            <textarea
              value={form.introVideoScript}
              onChange={(e) => set("introVideoScript", e.target.value)}
              rows={2}
              placeholder="You walk into a busy café…"
              className="lr-input resize-y py-3! text-[15px]! leading-relaxed!"
            />
          </Field>
        </Section>

        {/* save / lifecycle bar */}
        {formError && (
          <p className="flex items-center gap-2 text-sm font-semibold text-(--bad-ink)">
            <TriangleAlertIcon className="size-4 shrink-0" /> {formError}
          </p>
        )}
        {mode === "edit" && status === "published" && (
          <p className="flex items-center gap-2 rounded-xl bg-(--warn-soft) px-3.5 py-2.5 text-[13px] font-semibold text-(--warn-ink)">
            <TriangleAlertIcon className="size-4 shrink-0" />
            This scenario is live — saving bumps it to v{(version ?? 1) + 1}. In-flight
            sessions stay on the current version.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="lr-btn lr-btn--primary lr-btn--lg"
          >
            {saving ? <Loader2Icon className="size-5 animate-spin" /> : null}
            {mode === "create" ? "Create scenario" : "Save changes"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-(--ok-ink)">
              <CheckCircle2Icon className="size-4" /> Saved
            </span>
          )}

          {mode === "edit" && scenarioId && (
            <div className="ml-auto flex items-center gap-2.5">
              {status !== "published" && (
                <button
                  type="button"
                  onClick={() => runLifecycle(() => publishScenarioAction(scenarioId))}
                  disabled={lifecycle}
                  className="lr-btn lr-btn--soft lr-btn--md"
                >
                  {lifecycle ? <Loader2Icon className="size-[18px] animate-spin" /> : null}
                  Publish
                </button>
              )}
              {status !== "retired" && (
                <button
                  type="button"
                  onClick={() => runLifecycle(() => retireScenarioAction(scenarioId))}
                  disabled={lifecycle}
                  className="lr-btn lr-btn--ghost lr-btn--md"
                >
                  Retire
                </button>
              )}
            </div>
          )}
        </div>
        {lifecycleError && (
          <p className="text-sm font-semibold text-(--bad-ink)">{lifecycleError}</p>
        )}
      </div>

      {/* ── live preview column ───────────────────────────────────── */}
      <div className="lg:sticky lg:top-6">
        <p className="lr-eyebrow mb-2.5">Learner preview</p>
        <div className="lr-card overflow-hidden">
          <div className="speak-band px-6 pt-6 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
                style={{ background: badge.bg, color: badge.fg }}
              >
                {form.cefrLevel === "" ? "Any level" : form.cefrLevel}
              </span>
              <span className="lr-chip lr-chip--violet text-[12.5px]">
                {form.topic ? topicLabel(form.topic) : "topic"}
              </span>
            </div>
            <h3 className="serif mt-2.5 text-[26px] leading-tight font-medium tracking-[-0.01em] text-(--ink)">
              {form.title || "Untitled scene"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed font-medium text-(--ink-2)">
              {form.setting || "The setting will appear here as you write it."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-(--ink-2)">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-(--primary)" />
                You: {form.userRole || "learner"}
              </span>
              <span className="text-(--primary-soft-2)">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-(--violet)" />
                AI: {form.aiRole || "partner"}
              </span>
            </div>
          </div>
          <div className="px-6 py-5">
            {form.goal && (
              <p className="flex items-start gap-2 rounded-(--r-tile) border border-(--line) bg-(--card-2) px-3.5 py-3 text-sm font-semibold text-(--ink)">
                <TargetIcon className="mt-0.5 size-4 shrink-0 text-(--primary-ink)" />
                {form.goal}
              </p>
            )}
            {form.openingLine && (
              <div className="mt-4 flex items-end gap-2.5">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white"
                  style={{ background: "radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%)" }}
                >
                  AI
                </span>
                <div className="rounded-[16px_16px_16px_4px] bg-(--violet-soft) px-3.5 py-2.5 text-[15px] font-medium text-(--ink)">
                  {form.openingLine}
                </div>
              </div>
            )}
            {form.seedPhrases.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {form.seedPhrases.map((p) => (
                  <span key={p} className="lr-chip lr-chip--mint text-[13px]">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lr-card p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="lr-eyebrow">{title}</p>
        {hint && <span className="text-[12.5px] font-semibold text-(--ink-3)">{hint}</span>}
      </div>
      <div className="flex flex-col gap-3.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="text-[13px] font-bold text-(--ink-2)">{label}</span>
        {hint && <span className="text-[12px] font-semibold text-(--ink-3)">{hint}</span>}
      </span>
      {children}
      {error && <span className="text-[12.5px] font-semibold text-(--bad-ink)">{error}</span>}
    </label>
  );
}

function Avatar({ kind }: { kind: "you" | "ai" }) {
  const you = kind === "you";
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-extrabold text-white"
      style={{
        background: you
          ? "radial-gradient(120% 120% at 35% 25%, #2bd6a3, var(--primary) 70%)"
          : "radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%)",
      }}
    >
      {you ? "You" : "AI"}
    </span>
  );
}
