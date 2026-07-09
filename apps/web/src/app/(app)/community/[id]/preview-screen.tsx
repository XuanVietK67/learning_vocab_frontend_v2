"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronLeftIcon, HeartIcon, ListIcon, Loader2Icon, LockIcon } from "lucide-react";

import { LoginGateDialog } from "@/components/app/login-gate-dialog";
import { VisibilityBadge } from "@/components/app/visibility-badge";
import { WordRow } from "@/components/app/word-row";
import { cloneDeck } from "@/lib/me/deck-actions";
import { languageLabel } from "@/lib/languages";
import type { DeckDetail } from "@/lib/me/types";
import { deckAccent } from "../../decks/list-card";

/**
 * Community list preview (design §6.3–6.4). Read-only word list with a single
 * write action — "Save to my lists" (clone). Anonymous viewers hit a login gate;
 * a `404` from the clone/preview means the list is no longer available.
 */
export function PreviewScreen({
  deck,
  deckId,
  isLoggedIn,
}: {
  deck: DeckDetail | null;
  deckId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [gateOpen, setGateOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!deck) return <Unavailable />;

  const accent = deckAccent(deck.id);
  const words = deck.vocabularies ?? [];

  function onSave() {
    if (!isLoggedIn) {
      setGateOpen(true);
      return;
    }
    startTransition(async () => {
      const res = await cloneDeck(deckId);
      if (res.ok) {
        toast.success("Saved to your lists", {
          duration: 6000,
          action: { label: "Open list", onClick: () => router.push(`/decks/${res.id}`) },
        });
        return;
      }
      if (res.status === 401) {
        setGateOpen(true);
      } else if (res.status === 404) {
        toast.error("This list is no longer available");
        router.push("/community");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/community"
        className="mb-4 inline-flex items-center gap-1 text-[13px] text-(--ink-3) hover:text-(--ink)"
      >
        <ChevronLeftIcon className="size-4" /> Community
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-[14px]"
          style={{ background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent }}
        >
          <ListIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-(--ink)">
              {deck.name}
            </h1>
            <VisibilityBadge
              visibility={deck.visibility}
              ownerId={deck.ownerId}
              community
              className="mt-1.5"
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-(--ink-3)">
            <span className="tnum">{deck.vocabCount} words</span>
            <span>{languageLabel(deck.language)}</span>
            {deck.cefrLevel && <span>{deck.cefrLevel}</span>}
            {deck.author && <span className="font-semibold text-(--primary-ink)">by @{deck.author}</span>}
          </div>
        </div>
        <button
          type="button"
          className="lr-btn lr-btn--primary lr-btn--lg shrink-0"
          disabled={pending}
          onClick={onSave}
        >
          {pending ? (
            <>
              <Loader2Icon className="size-[18px] animate-spin" /> Saving…
            </>
          ) : (
            <>
              <HeartIcon className="size-[18px]" /> Save to my lists
            </>
          )}
        </button>
      </div>

      {deck.description && (
        <p className="mt-4 text-[15px] italic leading-relaxed text-(--ink-2)">“{deck.description}”</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[12.5px] font-semibold text-(--ink-3)">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--card-2) px-3 py-1">
          <LockIcon className="size-3.5" /> Read-only preview
        </span>
        <span>Saving makes your own private copy you can edit.</span>
      </div>

      <div className="lr-card mt-6 overflow-hidden">
        {words.length === 0 ? (
          <div className="px-6 py-14 text-center text-[13.5px] text-(--ink-3)">
            This list has no words yet.
          </div>
        ) : (
          words.map((w) => <WordRow key={w.id} word={w} chip="none" />)
        )}
      </div>

      {gateOpen && (
        <LoginGateDialog
          name={deck.name}
          returnTo={`/community/${deckId}`}
          onCancel={() => setGateOpen(false)}
        />
      )}
    </div>
  );
}

/** Shown when the previewed list went private or was deleted (`404`). */
function Unavailable() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/community"
        className="mb-4 inline-flex items-center gap-1 text-[13px] text-(--ink-3) hover:text-(--ink)"
      >
        <ChevronLeftIcon className="size-4" /> Community
      </Link>
      <div className="lr-card px-6 py-14 text-center">
        <span className="mb-4 inline-flex size-16 items-center justify-center rounded-[20px] bg-(--muted) text-(--ink-3)">
          <LockIcon className="size-7" />
        </span>
        <h3 className="font-heading text-lg font-bold text-(--ink)">
          This list is no longer available
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-(--ink-2)">
          The author may have made it private or removed it. Browse other lists in the community.
        </p>
        <Link href="/community" className="lr-btn lr-btn--soft lr-btn--md mt-5 inline-flex">
          Back to community
        </Link>
      </div>
    </div>
  );
}
