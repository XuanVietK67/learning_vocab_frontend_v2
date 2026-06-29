"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Public paths for the study-loop feedback clips. Files live in `public/` and
 * are served from the site root. `celebrate` reuses the applause clip already
 * shipped; drop `correct.mp3` / `wrong.mp3` alongside it to enable those cues
 * (a missing file simply no-ops — see `play`).
 */
const SOUND_SRC = {
  correct: "/correct.mp3",
  wrong: "/wrong.mp3",
  celebrate: "/congratulation.mp3",
} as const;

type SoundName = keyof typeof SOUND_SRC;

/** Per-clip volume — keep the wrong cue soft (not punishing), applause fuller. */
const VOLUME: Record<SoundName, number> = {
  correct: 0.55,
  wrong: 0.4,
  celebrate: 0.7,
};

export interface LearnSounds {
  /** Short ding when a graded answer is correct. */
  playCorrect: () => void;
  /** Soft low tone when a graded answer is wrong. */
  playWrong: () => void;
  /** Applause when a question type (round) is cleared. */
  playCelebrate: () => void;
}

/**
 * Short audio cues for the guided learn loop, mirroring the on-card flash: a
 * ding on a correct answer, a soft tone on a wrong one, and applause when a
 * question type is cleared. Each clip is preloaded once and replayed from the
 * start so rapid answers never clip or lag. Playback is a no-op while `enabled`
 * is false, before mount, or when the file is missing — the cue only ever
 * supplements the visual feedback, it is never the sole signal.
 */
export function useLearnSounds(enabled: boolean): LearnSounds {
  // Read through a ref so the play callbacks stay stable across renders while
  // still seeing the latest toggle value.
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // One reusable <audio> element per clip, built on the client after mount.
  const elsRef = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});
  useEffect(() => {
    const els: Partial<Record<SoundName, HTMLAudioElement>> = {};
    for (const name of Object.keys(SOUND_SRC) as SoundName[]) {
      const el = new Audio(SOUND_SRC[name]);
      el.preload = "auto";
      el.volume = VOLUME[name];
      els[name] = el;
    }
    elsRef.current = els;
    return () => {
      for (const el of Object.values(els)) el.pause();
      elsRef.current = {};
    };
  }, []);

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return;
    const el = elsRef.current[name];
    if (!el) return;
    el.currentTime = 0;
    // Missing file or an autoplay block rejects the promise — ignore it; the
    // on-card flash already conveys the result.
    void el.play().catch(() => {});
  }, []);

  const playCorrect = useCallback(() => play("correct"), [play]);
  const playWrong = useCallback(() => play("wrong"), [play]);
  const playCelebrate = useCallback(() => play("celebrate"), [play]);

  return { playCorrect, playWrong, playCelebrate };
}
