"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckIcon, LinkIcon, Share2Icon } from "lucide-react";

import { PublishConfirmDialog } from "@/components/app/publish-confirm-dialog";
import { setDeckVisibility } from "@/lib/me/deck-actions";
import type { DeckSummary } from "@/lib/me/types";

/** Public preview URL for a shared list (the copy-link target). */
export function communityUrl(id: string): string {
  if (typeof window !== "undefined") return `${window.location.origin}/community/${id}`;
  return `/community/${id}`;
}

/**
 * Author Share control — the inline-toggle variant (design §6.1). A pill with a
 * switch: turning it **on** opens the privacy confirm before publishing; turning
 * it **off** unpublishes immediately (one tap, no confirm). State is driven from
 * `deck.visibility` (server-owned) and refreshed after each change.
 */
export function ShareControl({ deck }: { deck: DeckSummary }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const isPublic = deck.visibility === "public";

  function apply(makePublic: boolean) {
    startTransition(async () => {
      const res = await setDeckVisibility(deck.id, makePublic ? "public" : "private");
      setConfirmOpen(false);
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't update sharing.");
        return;
      }
      router.refresh();
      if (makePublic) {
        toast.success("Shared to the community", {
          action: {
            label: "Copy link",
            onClick: () => copyLink(deck.id),
          },
        });
      } else {
        toast.success("List is private again");
      }
    });
  }

  function onToggle() {
    if (isPublic) apply(false);
    else setConfirmOpen(true);
  }

  return (
    <>
      <div
        className="inline-flex items-center gap-2.5 rounded-full border border-(--line-2) py-1.5 pl-3.5 pr-2 transition-colors"
        style={{ background: isPublic ? "var(--primary-soft)" : "var(--surface)" }}
      >
        <Share2Icon
          className="size-4"
          style={{ color: isPublic ? "var(--primary-ink)" : "var(--ink-2)" }}
        />
        <span
          className="text-[13.5px] font-bold"
          style={{ color: isPublic ? "var(--primary-ink)" : "var(--ink-2)" }}
        >
          {pending ? "Working…" : isPublic ? "Shared" : "Share"}
        </span>
        <button
          type="button"
          className="lr-switch"
          data-on={isPublic}
          disabled={pending}
          aria-label={isPublic ? "Make list private" : "Share list to community"}
          onClick={onToggle}
        />
      </div>

      {confirmOpen && (
        <PublishConfirmDialog
          name={deck.name}
          vocabCount={deck.vocabCount}
          busy={pending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => apply(true)}
        />
      )}
    </>
  );
}

function copyLink(id: string) {
  void navigator.clipboard
    .writeText(communityUrl(id))
    .then(() => toast.success("Link copied to clipboard"))
    .catch(() => toast.error("Couldn't copy the link"));
}

/** Read-only shareable link + Copy button, shown under the header when public. */
export function CopyLinkRow({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  function onCopy() {
    void navigator.clipboard
      .writeText(communityUrl(id))
      .then(() => {
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => toast.error("Couldn't copy the link"));
  }

  return (
    <div className="flex items-center gap-2 rounded-[12px] border border-(--line) bg-(--card-2) py-2 pl-3.5 pr-2">
      <LinkIcon className="size-4 shrink-0 text-(--ink-3)" />
      <span className="tnum min-w-0 flex-1 truncate text-[12.5px] text-(--ink-2)">
        {communityUrl(id)}
      </span>
      <button
        type="button"
        className="lr-btn lr-btn--soft lr-btn--sm"
        onClick={onCopy}
        style={{ padding: "5px 11px" }}
      >
        {copied ? <CheckIcon className="size-3.5" /> : "Copy"}
      </button>
    </div>
  );
}
