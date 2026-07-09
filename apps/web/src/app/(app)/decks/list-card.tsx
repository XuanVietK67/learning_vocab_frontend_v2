"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  ClipboardListIcon,
  GlobeIcon,
  GraduationCapIcon,
  ListIcon,
  LockIcon,
  Trash2Icon,
} from "lucide-react";

import { Menu, type MenuItem } from "@/components/app/menu";
import { VisibilityBadge } from "@/components/app/visibility-badge";
import { languageLabel } from "@/lib/languages";
import type { DeckSummary } from "@/lib/me/types";

/** Decorative accent derived deterministically from the deck id (not persisted). */
const ACCENTS = ["#12bd8a", "#1f9fd1", "#7b6cff", "#ff8c1e", "#f1456a"];
export function deckAccent(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

/**
 * One list card. In `owner` mode it links to the editable list and carries a `⋯`
 * menu (bulk import / share / delete). In `community` mode it links to the public
 * read-only preview, drops the menu, and labels its badge "Community" (design §5.2).
 */
export function ListCard({
  deck,
  mode = "owner",
  onBulkImport,
  onDelete,
  onShareToggle,
}: {
  deck: DeckSummary;
  mode?: "owner" | "community";
  onBulkImport?: (deck: DeckSummary) => void;
  onDelete?: (deck: DeckSummary) => void;
  onShareToggle?: (deck: DeckSummary, makePublic: boolean) => void;
}) {
  const router = useRouter();
  const accent = deckAccent(deck.id);
  const isCommunity = mode === "community";
  const isSystem = deck.visibility === "system";
  const open = () => router.push(isCommunity ? `/community/${deck.id}` : `/decks/${deck.id}`);

  const showMenu = !isCommunity && !isSystem;
  const menuItems: MenuItem[] = [];
  if (showMenu) {
    if (onBulkImport)
      menuItems.push({
        label: "Bulk import words",
        icon: ClipboardListIcon,
        onClick: () => onBulkImport(deck),
      });
    menuItems.push({ label: "Open list", icon: ArrowRightIcon, onClick: open });
    if (onShareToggle)
      menuItems.push(
        deck.visibility === "public"
          ? {
              label: "Make private",
              icon: LockIcon,
              onClick: () => onShareToggle(deck, false),
            }
          : {
              label: "Share to community",
              icon: GlobeIcon,
              onClick: () => onShareToggle(deck, true),
            },
      );
    if (onDelete)
      menuItems.push({
        label: "Delete list",
        icon: Trash2Icon,
        danger: true,
        onClick: () => onDelete(deck),
      });
  }

  return (
    <div onClick={open} className="lr-card hoverlift flex cursor-pointer flex-col overflow-hidden">
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
          <div className="flex shrink-0 items-center gap-1">
            <VisibilityBadge
              visibility={deck.visibility}
              ownerId={deck.ownerId}
              community={isCommunity}
            />
            {showMenu && menuItems.length > 0 && <Menu items={menuItems} />}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-[12.5px] text-(--ink-3)">
          <div className="flex items-center gap-3">
            <span className="tnum inline-flex items-center gap-1.5">
              <ListIcon className="size-3.5" /> {deck.vocabCount}{" "}
              {deck.vocabCount === 1 ? "word" : "words"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GraduationCapIcon className="size-3.5" /> {languageLabel(deck.language)}
            </span>
            {deck.cefrLevel && <span>{deck.cefrLevel}</span>}
          </div>
          {isCommunity && deck.author && (
            <span className="shrink-0 font-semibold text-(--primary-ink)">by @{deck.author}</span>
          )}
        </div>
      </div>
    </div>
  );
}
