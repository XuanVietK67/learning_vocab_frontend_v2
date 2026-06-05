"use client";

/**
 * Review & approve queue (split layout). Drafts from both AI flows land here
 * unapproved; this is where machine-generated quality is enforced. The master
 * list is skimmable + multi-selectable for bulk approve; the detail pane surfaces
 * the fields most likely to be AI-wrong (IPA, examples). Approving publishes the
 * word — audio + images then generate in the background, so the pane shows a
 * "media pending" confirmation rather than pretending they're ready.
 */
import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CheckCheckIcon,
  CheckIcon,
  ImageIcon,
  Loader2Icon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { ToneBadge } from "@/components/admin/tone-badge";
import { Button } from "@/components/ui/button";
import { approveDraftAction, rejectDraftAction } from "@/lib/admin/quick";
import { cefrTone } from "@/lib/admin/badge-tones";
import type { AdminVocabulary } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type RowState = "pending" | "busy" | "approved";

export function ReviewQueue({
  drafts,
  query,
}: {
  drafts: AdminVocabulary[];
  query?: string;
}) {
  const [items, setItems] = useState(drafts);
  const [state, setState] = useState<Record<string, RowState>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(drafts[0]?.id ?? null);

  const pending = items.filter((d) => (state[d.id] ?? "pending") !== "approved");
  const open = items.find((d) => d.id === openId) ?? null;
  const openState: RowState = open ? (state[open.id] ?? "pending") : "pending";

  const selectedPending = pending.filter((d) => selected.has(d.id));
  const allSelected =
    pending.length > 0 && pending.every((d) => selected.has(d.id));

  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(pending.map((d) => d.id)));
  }

  async function approve(id: string) {
    setState((s) => ({ ...s, [id]: "busy" }));
    const res = await approveDraftAction(id);
    if (!res.ok) {
      toast.error(res.error ?? "Could not approve the draft.");
      setState((s) => ({ ...s, [id]: "pending" }));
      return;
    }
    setState((s) => ({ ...s, [id]: "approved" }));
    setSelected((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    toast.success("Published — audio & images are generating in the background.");
  }

  async function bulkApprove() {
    const ids = selectedPending.map((d) => d.id);
    if (ids.length === 0) return;
    // Server Actions dispatch one at a time; approve sequentially.
    for (const id of ids) {
      await approve(id);
    }
  }

  async function reject(id: string) {
    if (!window.confirm("Reject and delete this draft? This cannot be undone."))
      return;
    setState((s) => ({ ...s, [id]: "busy" }));
    const res = await rejectDraftAction(id);
    if (!res.ok) {
      toast.error(res.error ?? "Could not reject the draft.");
      setState((s) => ({ ...s, [id]: "pending" }));
      return;
    }
    setItems((it) => it.filter((d) => d.id !== id));
    setSelected((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    if (openId === id) {
      const nextPending = pending.find((d) => d.id !== id);
      setOpenId(nextPending?.id ?? null);
    }
    toast.success("Draft rejected.");
  }

  function openNextPending() {
    setOpenId(pending[0]?.id ?? null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <CheckCheckIcon className="size-5" />
        </span>
        <p className="font-heading text-base font-medium">
          {query ? `No drafts match “${query}”.` : "No drafts to review."}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          New AI drafts will appear here for approval.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/admin/vocabularies/quick">
            <Button size="sm" variant="outline">
              <SparklesIcon />
              Quick add
            </Button>
          </Link>
          <Link href="/admin/vocabularies/bulk">
            <Button size="sm" variant="outline">
              Bulk import
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
      {/* Master list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Checkbox
            checked={allSelected}
            indeterminate={selected.size > 0 && !allSelected}
            onChange={toggleSelectAll}
            disabled={pending.length === 0}
          />
          {selectedPending.length > 0 ? (
            <>
              <span className="text-xs font-medium tabular-nums">
                {selectedPending.length} selected
              </span>
              <Button
                size="sm"
                className="ml-auto"
                onClick={bulkApprove}
              >
                <CheckIcon />
                Approve {selectedPending.length}
              </Button>
            </>
          ) : (
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {pending.length} pending
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {items.map((d) => {
            const st = state[d.id] ?? "pending";
            const isOpen = d.id === openId;
            return (
              <div
                key={d.id}
                className={cn(
                  "flex items-center gap-2.5 border-b px-3 py-2.5 transition-colors last:border-0 hover:bg-muted/50",
                  isOpen && "bg-muted/60",
                )}
              >
                {st === "approved" ? (
                  <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                ) : (
                  <Checkbox
                    checked={selected.has(d.id)}
                    onChange={() => toggleSelect(d.id)}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setOpenId(d.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {d.lemma}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {d.partOfSpeech}
                      </span>
                    </span>
                    {d.ipa && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {d.ipa}
                      </span>
                    )}
                  </span>
                  {st === "approved" ? (
                    <span className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Approved
                    </span>
                  ) : st === "busy" ? (
                    <Loader2Icon className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail pane */}
      <div>
        {open ? (
          openState === "approved" ? (
            <ApprovedPanel
              vocab={open}
              onNext={openNextPending}
              hasNext={pending.length > 0}
            />
          ) : (
            <DraftDetail
              vocab={open}
              busy={openState === "busy"}
              onApprove={() => approve(open.id)}
              onReject={() => reject(open.id)}
            />
          )
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Select a draft to review.
          </div>
        )}
      </div>
    </div>
  );
}

/** AI-wrong-prone field hint. */
function RiskHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
      <AlertTriangleIcon className="size-3" />
      {children}
    </span>
  );
}

function DraftDetail({
  vocab,
  busy,
  onApprove,
  onReject,
}: {
  vocab: AdminVocabulary;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {vocab.lemma}
            </h2>
            <ToneBadge tone="slate">{vocab.partOfSpeech}</ToneBadge>
            {vocab.cefrLevel && (
              <ToneBadge tone={cefrTone(vocab.cefrLevel)}>
                {vocab.cefrLevel}
              </ToneBadge>
            )}
            <ToneBadge tone="amber">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Pending
            </ToneBadge>
          </div>
          {vocab.ipa ? (
            <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              {vocab.ipa}
              <RiskHint>check IPA</RiskHint>
            </p>
          ) : null}
        </div>
        <Link
          href={`/admin/vocabularies/${vocab.id}`}
          className="shrink-0"
          aria-label="Edit draft"
        >
          <Button variant="outline" size="sm">
            <PencilIcon />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 p-5">
        {vocab.topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {vocab.topics.map((t) => (
              <ToneBadge key={t.id} tone="violet">
                {t.name}
              </ToneBadge>
            ))}
          </div>
        )}

        {vocab.senses.map((sense, i) => (
          <div key={sense.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                {i + 1}
              </span>
              {sense.gloss && (
                <span className="text-sm font-semibold">{sense.gloss}</span>
              )}
            </div>
            {sense.definition && (
              <p className="text-sm text-muted-foreground">{sense.definition}</p>
            )}

            {sense.translations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sense.translations.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-md bg-muted px-1.5 py-0.5 text-xs"
                  >
                    {t.translation}
                    <span className="ml-1 text-muted-foreground">
                      {t.language}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {sense.examples.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Examples
                  </span>
                  <RiskHint>check examples</RiskHint>
                </div>
                <ul className="grid gap-1.5">
                  {sense.examples.map((ex) => (
                    <li
                      key={ex.id}
                      className="rounded-md bg-muted/50 px-2.5 py-1.5 text-sm"
                    >
                      {ex.sentence}
                      {ex.translation && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {ex.translation}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(sense.synonyms?.length || sense.antonyms?.length) ? (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {sense.synonyms?.length ? (
                  <span>
                    <span className="font-medium text-foreground">Syn:</span>{" "}
                    {sense.synonyms.join(", ")}
                  </span>
                ) : null}
                {sense.antonyms?.length ? (
                  <span>
                    <span className="font-medium text-foreground">Ant:</span>{" "}
                    {sense.antonyms.join(", ")}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 border-t bg-muted/20 p-4">
        <Button
          variant="destructive"
          size="sm"
          disabled={busy}
          onClick={onReject}
        >
          <Trash2Icon />
          Reject
        </Button>
        <Button size="sm" disabled={busy} onClick={onApprove}>
          {busy ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
          Approve
        </Button>
      </div>
    </div>
  );
}

function ApprovedPanel({
  vocab,
  onNext,
  hasNext,
}: {
  vocab: AdminVocabulary;
  onNext: () => void;
  hasNext: boolean;
}) {
  return (
    <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCheckIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            “{vocab.lemma}” is published & live
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="size-4" />
            Audio and per-sense images are generating in the background — re-open
            the word in a few seconds to see them.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {hasNext && (
              <Button size="sm" onClick={onNext}>
                Next draft
              </Button>
            )}
            <Link href={`/admin/vocabularies/${vocab.id}`}>
              <Button size="sm" variant="outline">
                <PencilIcon />
                Open word
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small square checkbox matching the admin visual language. */
function Checkbox({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40",
        checked || indeterminate
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:border-muted-foreground/50",
      )}
    >
      {checked ? (
        <CheckIcon className="size-3" strokeWidth={3} />
      ) : indeterminate ? (
        <span className="h-0.5 w-2.5 rounded-full bg-primary-foreground" />
      ) : null}
    </button>
  );
}
