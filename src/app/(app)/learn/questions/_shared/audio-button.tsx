"use client";

import { useEffect, useRef } from "react";
import { Volume2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AudioButtonProps {
  src: string;
  /** Play once on mount (used by listening questions). */
  autoPlay?: boolean;
  label?: string;
}

/** A play control for a pronunciation/sentence clip. Browser-only, so a leaf. */
export function AudioButton({ src, autoPlay = false, label = "Play audio" }: AudioButtonProps) {
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
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={play}
      aria-label={label}
    >
      <Volume2Icon />
    </Button>
  );
}
