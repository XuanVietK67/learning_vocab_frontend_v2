"use client";

import { useEffect, useRef } from "react";
import { Volume2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AudioButtonProps {
  src: string;
  /** Play once on mount (used by listening questions). */
  autoPlay?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
}

const SIZES: Record<NonNullable<AudioButtonProps["size"]>, string> = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-10.5 [&_svg]:size-5",
  lg: "size-15 [&_svg]:size-7",
};

/** A circular play control for a pronunciation/sentence clip. Browser-only leaf. */
export function AudioButton({
  src,
  autoPlay = false,
  label = "Play audio",
  size = "md",
  variant = "solid",
}: AudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
    if (autoPlay) {
      // Autoplay may be blocked until the user interacts; ignore rejection.
      void audioRef.current.play().catch(() => {});
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src, autoPlay]);

  function play() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        play();
      }}
      aria-label={label}
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition active:scale-90",
        SIZES[size],
        variant === "solid"
          ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(19,169,123,0.45)]"
          : "text-foreground hover:text-primary",
      )}
    >
      <Volume2Icon strokeWidth={2.1} />
    </button>
  );
}
