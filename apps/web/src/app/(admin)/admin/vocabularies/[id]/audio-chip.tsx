"use client";

import { useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";

/** Equalizer bar heights (px) when playing. */
const BARS = [6, 11, 7, 13, 8];

/**
 * Compact pronunciation player for the hero identity strip. Renders nothing when
 * there's no audio. Drives a real `<audio>` element; the equalizer is decorative.
 */
export function AudioChip({ url }: { url: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!url) return null;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Play pronunciation"
      className="inline-flex h-7 items-center gap-2 rounded-full border border-border bg-card pr-3 pl-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <audio
        ref={audioRef}
        src={url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <span className="grid size-[18px] place-items-center rounded-full bg-primary text-primary-foreground">
        {playing ? <PauseIcon className="size-2.5" /> : <PlayIcon className="size-2.5" />}
      </span>
      {playing ? "Playing…" : "Audio"}
      <span aria-hidden className="flex h-3.5 items-center gap-0.5">
        {BARS.map((h, i) => (
          <span
            key={i}
            className="w-0.5 rounded-full bg-muted-foreground transition-[height,opacity] duration-200"
            style={{
              height: playing ? h : 4,
              opacity: playing ? 0.9 : 0.45,
              transitionDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </span>
    </button>
  );
}
