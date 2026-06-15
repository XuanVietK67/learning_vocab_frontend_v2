"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";
import type { DeckSummary } from "@/lib/me/types";
import { DeckCard } from "./cards";
import { PickerHead } from "./picker-head";

interface DeckPickerProps {
  decks: DeckSummary[];
}

/**
 * "See all" deck picker (`mode=deck`, no target yet). A responsive grid of the
 * caller's decks with a language filter; each card starts a session.
 */
export function DeckPicker({ decks }: DeckPickerProps) {
  const languages = Array.from(new Set(decks.map((d) => d.language)));
  const [lang, setLang] = useState("all");
  const list = lang === "all" ? decks : decks.filter((d) => d.language === lang);

  return (
    <div className="learn-anim-in mx-auto w-full max-w-3xl px-5 pt-11 pb-24">
      <PickerHead
        eyebrow="Your decks"
        title="Your decks"
        sub="Saved word sets, newest first. Tap one to start studying."
      />

      {decks.length === 0 ? (
        <p className="mt-6 text-(--ink-2)">
          You don’t have any decks yet. Browse the community to add one.
        </p>
      ) : (
        <>
          {languages.length > 1 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip active={lang === "all"} onClick={() => setLang("all")}>
                All
              </Chip>
              {languages.map((code) => (
                <Chip
                  key={code}
                  active={lang === code}
                  onClick={() => setLang(code)}
                >
                  {languageLabel(code)}
                </Chip>
              ))}
            </div>
          )}

          <div className="lr-stagger mt-5 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
            {list.map((deck, i) => (
              <DeckCard key={deck.id} deck={deck} idx={i} fill />
            ))}
          </div>
          <div className="mt-6 text-[13px] font-medium text-(--ink-2)">
            {list.length} {list.length === 1 ? "deck" : "decks"}
            {lang !== "all" ? ` · ${languageLabel(lang)}` : ""}
          </div>
        </>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-[15px] py-2 text-[13.5px] font-semibold transition",
        active
          ? "border-transparent bg-(--primary) text-white shadow-(--sh-primary)"
          : "border-(--line) bg-(--learn-surface) text-(--ink-2) shadow-(--sh-sm) hover:border-(--line-2)",
      )}
    >
      {children}
    </button>
  );
}
