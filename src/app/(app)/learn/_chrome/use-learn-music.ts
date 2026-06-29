"use client";

import { useEffect, useRef } from "react";

/** Looping background track for the study loop — lives in `public/`, served from root. */
const MUSIC_SRC = "/funny_sound.mp3";

/** Kept soft so it sits under the feedback cues, never over them. */
const MUSIC_VOLUME = 0.35;

/**
 * Plays a looping background track while a learn session is in progress: it
 * starts when the session goes live, and `loop` replays the clip every time it
 * ends so the music carries on until the session finishes (or the user leaves).
 * Playback is a no-op while `enabled` is false, before mount, or when the file
 * is missing / autoplay is blocked — it only ever colours the session, so a
 * silent fallback is fine.
 *
 * @param enabled  the Background music toggle
 * @param active   true while a question is on screen (paused on done/empty/exit)
 */
export function useLearnMusic(enabled: boolean, active: boolean): void {
  // One reusable looping <audio>, built on the client after mount.
  const elRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const el = new Audio(MUSIC_SRC);
    el.preload = "auto";
    el.loop = true;
    el.volume = MUSIC_VOLUME;
    elRef.current = el;
    return () => {
      el.pause();
      elRef.current = null;
    };
  }, []);

  // Play while the session is live and the toggle is on; pause otherwise. When
  // the session ends, rewind so the next one starts the track from the top.
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (enabled && active) {
      void el.play().catch(() => {});
    } else {
      el.pause();
      if (!active) el.currentTime = 0;
    }
  }, [enabled, active]);
}
