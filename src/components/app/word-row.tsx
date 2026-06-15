"use client";

import { useState } from "react";
import { Volume2Icon, VolumeOffIcon, XIcon } from "lucide-react";

import type { MyWord } from "@/lib/me/types";
import { cn } from "@/lib/utils";

/** Short part-of-speech label shown next to the lemma. */
const POS_ABBR: Record<string, string> = {
  noun: "n.",
  verb: "v.",
  adjective: "adj.",
  adverb: "adv.",
  pronoun: "pron.",
  preposition: "prep.",
  conjunction: "conj.",
  interjection: "interj.",
  phrase: "phr.",
  other: "—",
};

/** First-sense gloss (falling back to its definition) for the row subtitle. */
export function wordGloss(word: MyWord): string | null {
  const s = word.senses?.[0];
  return s?.gloss?.trim() || s?.definition?.trim() || null;
}

/** First-sense, first translation for the row subtitle. */
export function wordTranslation(word: MyWord): string | null {
  return word.senses?.[0]?.translations?.[0]?.translation?.trim() || null;
}

/** Speaker that pulses while audio is still generating, then becomes playable. */
function SpeakerButton({ audioUrl, lemma }: { audioUrl: string | null; lemma: string }) {
  const [playing, setPlaying] = useState(false);

  if (!audioUrl) {
    return (
      <span
        title="Audio is generating — it'll appear shortly"
        className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-full text-(--ink-3)"
      >
        <VolumeOffIcon className="size-[18px]" />
      </span>
    );
  }

  return (
    <button
      type="button"
      title={`Play ${lemma}`}
      onClick={() => {
        setPlaying(true);
        const audio = new Audio(audioUrl);
        audio.addEventListener("ended", () => setPlaying(false));
        void audio.play().catch(() => setPlaying(false));
      }}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-(--ink) transition-colors hover:bg-(--primary-soft)",
        playing && "bg-(--primary-soft)",
      )}
    >
      <Volume2Icon className="size-[18px]" />
    </button>
  );
}

/**
 * One word in My Words / a list. Renders lemma · POS · IPA · CEFR · gloss /
 * translation, a "Private" chip, an audio-pending speaker, and (when the parent
 * passes `onRemove`) a remove affordance. `highlight` tints rows that just
 * streamed in.
 */
export function WordRow({
  word,
  highlight,
  onRemove,
  chip = "private",
}: {
  word: MyWord;
  highlight?: boolean;
  onRemove?: () => void;
  /** The trailing pill. `"private"` (default) shows "Private"; `"none"` hides it
   *  (e.g. a community preview of someone else's list). */
  chip?: "private" | "none";
}) {
  const gloss = wordGloss(word);
  const translation = wordTranslation(word);

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 border-b border-(--line) px-4 py-3.5 last:border-b-0 transition-colors",
        highlight && "bg-(--ok-soft)/40",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-heading text-[16px] font-semibold tracking-tight text-(--ink)">
            {word.lemma}
          </span>
          <span className="text-[13px] text-(--ink-3) italic">
            {POS_ABBR[word.partOfSpeech] ?? word.partOfSpeech}
          </span>
          {word.ipa && <span className="lr-ipa text-[13px]">{word.ipa}</span>}
          {word.cefrLevel && (
            <span className="rounded-md border border-(--line-2) px-1.5 py-px text-[10.5px] font-bold text-(--ink-2)">
              {word.cefrLevel}
            </span>
          )}
        </div>
        {(gloss || translation) && (
          <p className="mt-0.5 truncate text-[13px] text-(--ink-3)">
            {gloss}
            {gloss && translation && " · "}
            {translation && <span className="text-(--ink-2)">{translation}</span>}
          </p>
        )}
      </div>

      {chip === "private" && (
        <span className="hidden shrink-0 rounded-full bg-(--muted) px-2 py-0.5 text-[11px] font-semibold text-(--ink-3) sm:inline">
          Private
        </span>
      )}

      <SpeakerButton audioUrl={word.audioUrl} lemma={word.lemma} />

      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${word.lemma}`}
          onClick={onRemove}
          className="lr-icon-btn size-8 text-(--ink-3) hover:text-(--bad-ink)"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
