"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  MicIcon,
  MinusIcon,
  PauseIcon,
  PenLineIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
  SquareIcon,
  TriangleAlertIcon,
  Volume2Icon,
  XIcon,
} from "lucide-react";

import { AudioButton } from "@/app/(app)/learn/questions/_shared/audio-button";
import { useWavRecorder } from "@/app/(app)/learn/questions/_shared/use-wav-recorder";
import { scorePronunciationAction } from "@/app/(app)/learn/pronunciation-actions";
import type { PhonemeScore, PronunciationScore } from "@/lib/me/pronunciation/types";
import type { PracticeWord } from "@/lib/me/practice/types";
import { cn } from "@/lib/utils";
import type { PracticeMode } from "./mode-tabs";
import { bandCopy, bandOf, bandOfLabel, BAND_STYLE } from "./_shared/band";
import { ScoreGauge } from "./_shared/score-gauge";

type SpeakState =
  | "idle"
  | "recording"
  | "preview"
  | "scoring"
  | "result"
  | "denied"
  | "recError"
  | "tooShort"
  | "serviceDown";

/** Symmetric multipliers for the live level-meter bars (mirrors /learn). */
const METER_SHAPE = [0.3, 0.5, 0.7, 0.55, 0.85, 1, 0.9, 1, 0.7, 0.95, 0.6, 0.8, 0.5, 0.65, 0.4, 0.3];

/**
 * Mode B — say the word; an acoustic scorer returns an overall 0–100 plus a
 * per-phoneme breakdown. Unlike Write this is **synchronous** (the POST returns
 * the full result), so there's a brief spinner, not a poll. Records WAV via
 * {@link useWavRecorder} and scores via the shared `scorePronunciationAction`,
 * matching the /learn pronunciation card. The phoneme strip is the hero: each
 * sound is coloured by its `label` and tappable to replay just that span.
 */
export function SpeakMode({
  word,
  onSwitchMode,
  onScored,
}: {
  word: PracticeWord;
  onSwitchMode: (mode: PracticeMode) => void;
  onScored: (score: number) => void;
}) {
  const recorder = useWavRecorder();
  const [state, setState] = useState<SpeakState>("idle");
  const [result, setResult] = useState<PronunciationScore | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // replay of the user's own clip
  const [playing, setPlaying] = useState(false);
  const [activePh, setActivePh] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const spanStop = useRef<number | null>(null);

  const stopReplay = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setActivePh(-1);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (spanStop.current) clearTimeout(spanStop.current);
  }, []);

  // (No word-change reset here: practice-screen keys this subtree by
  // vocabularyId, so switching words remounts the panel with fresh state.)

  // Build a replayable Audio element from the captured clip.
  useEffect(() => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => stopReplay();
    return () => {
      audio.pause();
      audio.onended = null;
      URL.revokeObjectURL(url);
      audioRef.current = null;
    };
  }, [recordedBlob, stopReplay]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (spanStop.current) clearTimeout(spanStop.current);
    },
    [],
  );

  /* ---- record / score ---- */
  const startRec = useCallback(async () => {
    setResult(null);
    setRecordedBlob(null);
    stopReplay();
    const ok = await recorder.start();
    setState(ok ? "recording" : "denied");
  }, [recorder, stopReplay]);

  const stopRec = useCallback(async () => {
    const blob = await recorder.stop();
    if (!blob) {
      setErrorMsg("That recording didn’t come through — tap to try again.");
      setState("recError");
      return;
    }
    setRecordedBlob(blob);
    setState("preview");
  }, [recorder]);

  const score = useCallback(async () => {
    if (!recordedBlob) return;
    setState("scoring");
    const form = new FormData();
    form.append("audio", recordedBlob, `${word.lemma || "word"}.wav`);
    form.append("vocabularyId", word.vocabularyId);
    const res = await scorePronunciationAction(form);
    if (res.ok) {
      setResult(res.score);
      setState("result");
      onScored(res.score.overallScore);
    } else if (res.kind === "serviceDown") {
      setState("serviceDown");
    } else if (res.kind === "tooShort") {
      setErrorMsg(res.message);
      setState("tooShort");
    } else {
      setErrorMsg(res.message);
      setState("recError");
    }
  }, [recordedBlob, word.lemma, word.vocabularyId, onScored]);

  const reRecord = useCallback(() => {
    stopReplay();
    recorder.reset();
    setResult(null);
    setRecordedBlob(null);
    setState("idle");
  }, [recorder, stopReplay]);

  /* ---- replay the captured clip ---- */
  const playMine = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      stopReplay();
      return;
    }
    if (spanStop.current) clearTimeout(spanStop.current);
    audio.currentTime = 0;
    void audio.play().catch(() => {});
    setPlaying(true);
    const tick = () => {
      const a = audioRef.current;
      if (!a || !result) return;
      const t = a.currentTime;
      setActivePh(result.phonemes.findIndex((p) => t >= p.start_sec && t < p.end_sec));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [playing, result, stopReplay]);

  /** Tap a phoneme chip → seek to and replay just that sound's span. */
  const playSpan = useCallback(
    (i: number) => {
      const audio = audioRef.current;
      const ph = result?.phonemes[i];
      if (!audio || !ph) return;
      stopReplay();
      setActivePh(i);
      audio.currentTime = ph.start_sec;
      void audio.play().catch(() => {});
      const ms = Math.max(180, (ph.end_sec - ph.start_sec) * 1000 + 120);
      spanStop.current = window.setTimeout(() => {
        audio.pause();
        setActivePh(-1);
      }, ms);
    },
    [result, stopReplay],
  );

  /* ---------------- result (hero) ---------------- */
  if (state === "result" && result) {
    const band = bandOf(result.overallScore);
    const noisy = result.audioQuality.clipping || result.audioQuality.snr_db < 12;
    return (
      <div className="lr-card lr-pop p-7">
        <div className="mb-1 flex items-center justify-between">
          <span className="lr-eyebrow">Pronunciation</span>
          <span className={`lr-chip ${BAND_STYLE[band].chip}`}>{bandCopy(result.overallScore)}</span>
        </div>

        <div className="my-4.5 flex items-center gap-4">
          <ScoreGauge score={result.overallScore} size={124} />
          <div className="flex flex-1 flex-col gap-2">
            <div className="text-[14.5px] font-semibold text-(--ink-2)">Target reading</div>
            <div className="lr-ipa text-[22px]">/{result.transcriptPhonemes.join(" ")}/</div>
            <button
              type="button"
              onClick={playMine}
              className="mt-0.5 flex items-center gap-2.5 text-sm font-bold text-(--primary-ink)"
            >
              <span className={cn("lr-orb lr-orb--sm", playing && "playing")} aria-hidden>
                {playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
              </span>
              {playing ? "Playing…" : "Play my recording"}
            </button>
          </div>
        </div>

        <span className="lr-eyebrow">Sound by sound · tap to hear</span>
        <div className="ph-strip mt-2.5 flex-wrap">
          {result.phonemes.map((ph, i) => (
            <PhonemeTile key={i} ph={ph} active={activePh === i} onTap={() => playSpan(i)} />
          ))}
        </div>

        {noisy && (
          <div className="lr-chip lr-chip--amber mt-4.5 px-3.5 py-2.5">
            <TriangleAlertIcon className="size-4 shrink-0" />
            A bit of background noise came through — re-record somewhere quieter for a more reliable score.
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="lr-btn lr-btn--soft lr-btn--md" onClick={reRecord}>
            <RotateCcwIcon className="size-4" /> Re-record
          </button>
          <button type="button" className="lr-btn lr-btn--ghost lr-btn--md" onClick={() => onSwitchMode("write")}>
            <PenLineIcon className="size-4" /> Switch to Write
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- mic denied ---------------- */
  if (state === "denied") {
    return (
      <div className="lr-card p-9 text-center">
        <div className="mx-auto mb-3.5 grid size-14 place-items-center rounded-2xl bg-(--bad-soft) text-(--bad-ink)">
          <MicIcon className="size-7" />
        </div>
        <h3 className="text-[20px] font-extrabold">Enable your microphone to practice speaking</h3>
        <p className="mx-auto mt-1.5 mb-4.5 max-w-90 text-(--ink-2)">
          We couldn’t access your mic. Allow microphone access in your browser, then try again — or switch to Write.
        </p>
        <div className="flex justify-center gap-3">
          <button type="button" className="lr-btn lr-btn--primary lr-btn--md" onClick={() => setState("idle")}>
            <RotateCcwIcon className="size-4" /> Try again
          </button>
          <button type="button" className="lr-btn lr-btn--ghost lr-btn--md" onClick={() => onSwitchMode("write")}>
            <PenLineIcon className="size-4" /> Switch to Write
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- scorer offline ---------------- */
  if (state === "serviceDown") {
    return (
      <div className="lr-card p-9 text-center">
        <div className="mx-auto mb-3.5 grid size-14 place-items-center rounded-2xl bg-(--card-2) text-(--ink-3)">
          <Volume2Icon className="size-7" />
        </div>
        <h3 className="text-[20px] font-extrabold">Scoring is busy right now</h3>
        <p className="mx-auto mt-1.5 mb-4.5 max-w-90 text-(--ink-2)">
          We couldn’t reach the pronunciation coach. Try again in a moment, or switch to Write.
        </p>
        <div className="flex justify-center gap-3">
          <button type="button" className="lr-btn lr-btn--primary lr-btn--md" onClick={score}>
            <RotateCcwIcon className="size-4" /> Retry
          </button>
          <button type="button" className="lr-btn lr-btn--ghost lr-btn--md" onClick={() => onSwitchMode("write")}>
            <PenLineIcon className="size-4" /> Switch to Write
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- idle / recording / preview / scoring / errors ---------------- */
  const recording = state === "recording";
  return (
    <div className="lr-card px-7 pt-[30px] pb-7">
      <div className="mb-4 flex items-center justify-center gap-2.5 text-center">
        <MicIcon className="size-4.5 text-(--primary-ink)" />
        <span className="text-base font-bold">
          Say the word: <span className="serif italic">“{word.lemma}”</span>
        </span>
      </div>

      {word.audioUrl && (
        <div className="mb-4.5 flex items-center justify-center gap-2.5">
          <AudioButton src={word.audioUrl} size="sm" label="Hear it first" />
          <span className="text-[13.5px] font-semibold text-(--ink-2)">Hear it first</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-3.5">
        {recording ? (
          <div className="ph-levels" aria-hidden>
            {METER_SHAPE.map((m, i) => (
              <i key={i} style={{ height: 4 + recorder.level * m * 36 }} />
            ))}
          </div>
        ) : (
          <div className="h-10" />
        )}

        <button
          type="button"
          className={cn("lr-mic", recording && "recording")}
          onClick={recording ? stopRec : startRec}
          disabled={state === "scoring"}
          aria-label={recording ? "Stop recording" : "Start recording"}
          aria-pressed={recording}
        >
          {recording && <span className="pulse" />}
          {recording ? <SquareIcon className="size-7" /> : <MicIcon className="size-8" strokeWidth={2.1} />}
        </button>

        <span className="text-[14.5px] font-bold text-(--ink-2)">
          {state === "idle" && "Tap to record"}
          {recording && "Tap to stop"}
          {state === "preview" && "Recording ready"}
          {state === "scoring" && "Scoring…"}
          {state === "tooShort" && "Too short"}
          {state === "recError" && "Try again"}
        </span>
      </div>

      {state === "preview" && (
        <div className="mt-4.5 flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <button type="button" className="lr-btn lr-btn--ghost lr-btn--sm" onClick={playMine}>
              <PlayIcon className="size-4" /> Play
            </button>
            <button type="button" className="lr-btn lr-btn--ghost lr-btn--sm" onClick={reRecord}>
              <RotateCcwIcon className="size-4" /> Re-record
            </button>
          </div>
          <button type="button" className="lr-btn lr-btn--primary lr-btn--lg" onClick={score}>
            <SparklesIcon className="size-5" /> Score my pronunciation
          </button>
        </div>
      )}

      {state === "scoring" && (
        <div className="mt-4 flex items-center justify-center gap-2.5 text-sm font-semibold text-(--ink-2)">
          <span className="ph-spinner !size-5 !border-[3px]" /> Scoring your take…
        </div>
      )}

      {state === "tooShort" && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <span className="lr-chip lr-chip--bad">
            <TriangleAlertIcon className="size-3.5" /> {errorMsg || "Recording too short — hold a bit longer."}
          </span>
          <button type="button" className="lr-btn lr-btn--primary lr-btn--md" onClick={startRec}>
            <RotateCcwIcon className="size-4" /> Re-record
          </button>
        </div>
      )}

      {state === "recError" && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <span className="lr-chip lr-chip--amber">
            <TriangleAlertIcon className="size-3.5" /> {errorMsg || "Something went wrong with that take."}
          </span>
          <button type="button" className="lr-btn lr-btn--primary lr-btn--md" onClick={startRec}>
            <RotateCcwIcon className="size-4" /> Try again
          </button>
        </div>
      )}
    </div>
  );
}

/* ====================  one phoneme tile (mirrors /learn)  ==================== */
function PhonemeTile({ ph, active, onTap }: { ph: PhonemeScore; active: boolean; onTap: () => void }) {
  const style = BAND_STYLE[bandOfLabel(ph.label)];
  const tileVars = {
    ["--tl-line" as string]: style.line,
    ["--tl-ink" as string]: style.ink,
    ["--tl-fill" as string]: style.fill,
  } as React.CSSProperties;
  const labelText = ph.label === "good" ? "good" : ph.label === "practice" ? "needs practice" : "off";
  return (
    <button
      type="button"
      className={cn("ph-tile", active && "is-active")}
      style={tileVars}
      onClick={onTap}
      aria-label={`${ph.phone}, ${ph.score} out of 100, ${labelText}. Tap to replay.`}
    >
      <span className="ph-icon" style={{ color: style.line }}>
        {ph.label === "good" ? (
          <CheckIcon className="size-3.5" strokeWidth={3.4} />
        ) : ph.label === "practice" ? (
          <MinusIcon className="size-3.5" strokeWidth={3} />
        ) : (
          <XIcon className="size-3.5" strokeWidth={3.2} />
        )}
      </span>
      <span className="ph-glyph" style={{ color: style.ink }}>
        {ph.phone}
      </span>
      <span className="ph-meter">
        <i style={{ width: `${ph.score}%`, background: style.line }} />
      </span>
      <span className="ph-score" style={{ color: style.ink }}>
        {ph.score}
      </span>
    </button>
  );
}
