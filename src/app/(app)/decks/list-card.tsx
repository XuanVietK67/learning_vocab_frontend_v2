"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon, ClipboardListIcon, GraduationCapIcon, ListIcon, Trash2Icon } from "lucide-react";

import { Menu } from "@/components/app/menu";
import { languageLabel } from "@/lib/languages";
import type { DeckSummary } from "@/lib/me/types";

/** Decorative accent derived deterministically from the deck id (not persisted). */
const ACCENTS = ["#12bd8a", "#1f9fd1", "#7b6cff", "#ff8c1e", "#f1456a"];
export function deckAccent(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

export function ListCard({
  deck,
  onBulkImport,
  onDelete,
}: {
  deck: DeckSummary;
  onBulkImport: (deck: DeckSummary) => void;
  onDelete: (deck: DeckSummary) => void;
}) {
  const router = useRouter();
  const accent = deckAccent(deck.id);
  const open = () => router.push(`/decks/${deck.id}`);

  return (
    <div
      onClick={open}
      className="lr-card hoverlift flex cursor-pointer flex-col overflow-hidden"
    >
      <div className="h-1.5" style={{ background: accent }} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-[12px]"
            style={{ background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent }}
          >
            <ListIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading truncate text-[15.5px] font-semibold tracking-tight text-(--ink)">
              {deck.name}
            </p>
            <p className="mt-0.5 truncate text-[12.5px] text-(--ink-3)">
              {deck.description || "No description"}
            </p>
          </div>
          <Menu
            items={[
              { label: "Bulk import words", icon: ClipboardListIcon, onClick: () => onBulkImport(deck) },
              { label: "Open list", icon: ArrowRightIcon, onClick: open },
              { label: "Delete list", icon: Trash2Icon, danger: true, onClick: () => onDelete(deck) },
            ]}
          />
        </div>
        <div className="mt-4 flex items-center gap-3 text-[12.5px] text-(--ink-3)">
          <span className="tnum inline-flex items-center gap-1.5">
            <ListIcon className="size-3.5" /> {deck.vocabCount} {deck.vocabCount === 1 ? "word" : "words"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GraduationCapIcon className="size-3.5" /> {languageLabel(deck.language)}
          </span>
        </div>
      </div>
    </div>
  );
}
