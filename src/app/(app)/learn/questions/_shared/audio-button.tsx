"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AudioButtonProps {
  src: string;
  /** Play once on mount (used by listening questions). */
  autoPlay?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  /** Mint by default; violet marks the listening family. */
  tone?: "mint" | "violet";
}

const ICON_SIZE: Record<NonNullable<AudioButtonProps["size"]>, string> = {
  sm: "size-5.5",
  md: "size-7",
  lg: "size-9.5",
};

/**
 * Sprout audio orb — a circular play control that pulses concentric rings while
 * the clip plays. Browser-only leaf (uses `Audio`).
 */
export function AudioButton({
  src,
  autoPlay = false,
  label = "Play audio",
  size = "md",
  tone = "mint",
}: AudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const pulse = useCallback(() => {
    setPlaying(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPlaying(false), 1500);
  }, []);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    if (autoPlay) {
      // Autoplay may be blocked until the user interacts; ignore rejection.
      void audio
        .play()
        .then(pulse)
        .catch(() => {});
    }
    return () => {
      audio.pause();
      audioRef.current = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [src, autoPlay, pulse]);

  function play() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
    pulse();
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        play();
      }}
      className={cn(
        "lr-orb",
        size === "sm" && "lr-orb--sm",
        size === "lg" && "lr-orb--lg",
        tone === "violet" && "violet",
        playing && "playing",
      )}
    >
      <span className="ring r1" />
      <span className="ring r2" />
      <Volume2Icon className={ICON_SIZE[size]} strokeWidth={2.1} />
    </button>
  );
}
