"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  KeyboardIcon,
  MicIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
  TriangleAlertIcon,
  Volume2Icon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { PronunciationPrompt } from "@/lib/me/learn/types";
import type {
  PhonemeLabel,
  PhonemeScore,
  PronunciationScore,
} from "@/lib/me/pronunciation/types";
import type { QuizQuestionProps } from "./types";
import { AudioButton } from "./_shared/audio-button";
import { useWavRecorder } from "./_shared/use-wav-recorder";
import { scorePronunciationAction } from "../pronunciation-actions";
import { useLearnSettings } from "../_chrome/settings-context";

type Props = QuizQuestionProps & {
  prompt: PronunciationPrompt;
  /** The item's signed vocabulary id — scored by `/v1/pronunciation/score`. */
  vocabularyId: string;
};

/**
 * Record → score → result card for the acoustic `pronunciation` question. The
 * learner records the word (captured as WAV — see {@link useWavRecorder}), we
 * score it via `POST /v1/pronunciation/score`, and render the per-phoneme
 * breakdown as the hero. The chosen attempt's `attemptId` is reported as the
 * answer; the shared footer's Check commits it. Keyboard entry is the always-
 * available fallback so a bad mic or a downed scorer never traps the learner.
 *
 * NOTE: the backend change that grades a submitted `attemptId` is planned, not
 * shipped — until then the grade is a placeholder (see
 * docs/api/learn_pronunciation_question.md). `SUBMIT_ATTEMPT` marks the mode;
 * we report the attempt regardless so the session always advances.
 */
const SUBMIT_ATTEMPT = process.env.NEXT_PUBLIC_PRONUNCIATION_SUBMIT_ATTEMPT === "true";

type Phase =
  | "record"
  | "recording"
  | "scoring"
  | "result"
  | "recError"
  | "serviceDown"
  | "keyboard";

/* ---------- band → copy + colour (overall headline; thresholds are display only) ---------- */
function band(score: number): PhonemeLabel {
  if (score >= 75) return "good";
  if (score >= 45) return "practice";
  return "wrong";
}

interface BandStyle {
  line: string;
  ink: string;
  fill: string;
  word: string;
  sub: string;
}
const BAND: Record<PhonemeLabel, BandStyle> = {
  good: {
    line: "var(--ok)",
    ink: "var(--ok-ink)",
    fill: "var(--ok-soft)",
    word: "Great",
    sub: "Crisp and clear — keep it up.",
  },
  practice: {
    line: "var(--amber-2)",
    ink: "#8a5a00",
    fill: "var(--amber-soft)",
    word: "Getting there",
    sub: "Close. A couple of sounds to sharpen.",
  },
  wrong: {
    line: "var(--bad)",
    ink: "var(--bad-ink)",
    fill: "var(--bad-soft)",
    word: "Let’s try again",
    sub: "Listen back, then give it another go.",
  },
};

/** Per-tile colour vars consumed by `.ph-tile`. */
function tileVars(label: PhonemeLabel): React.CSSProperties {
  const b = BAND[label];
  return {
    ["--tl-line" as string]: b.line,
    ["--tl-ink" as string]: b.ink,
    ["--tl-fill" as string]: b.fill,
  };
}

/** Shape multipliers for the live level meter bars (symmetric, lively). */
const METER_SHAPE = [
  0.3, 0.5, 0.7, 0.55, 0.85, 1, 0.9, 1, 0.7, 0.95, 0.6, 0.8, 0.5, 0.65, 0.4, 0.3,
];

/* ====================  constant header  ==================== */
function PronHeader({
  word,
  ipa,
  showPhonetic,
  audioUrl,
  compact,
}: {
  word: string;
  ipa: string | null;
  showPhonetic: boolean;
  audioUrl: string | null;
  compact: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center" style={{ gap: compact ? 8 : 12 }}>
      {!compact && <div className="lr-eyebrow">Say the word</div>}
      <div className="lr-word" style={{ fontSize: compact ? 38 : 52 }}>
        {word}
      </div>
      <div className="flex items-center gap-3.5">
        {ipa && showPhonetic && (
          <div className="lr-ipa" style={{ fontSize: compact ? 19 : 23 }}>
            /{ipa}/
          </div>
        )}
        {audioUrl && <AudioButton src={audioUrl} size="sm" label="Play reference pronunciation" />}
      </div>
    </div>
  );
}

/* ---------- escape hatch (keyboard fallback) ---------- */
function KeyboardHatch({ onKeyboard, disabled }: { onKeyboard: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="ph-linklike inline-flex items-center gap-1.5"
      onClick={onKeyboard}
      disabled={disabled}
    >
      <KeyboardIcon className="size-4" /> Use keyboard
    </button>
  );
}

/* ====================  A — record  ==================== */
function RecordState({
  onStart,
  onKeyboard,
  disabled,
}: {
  onStart: () => void;
  onKeyboard: () => void;
  disabled: boolean;
}) {
  return (
    <div className="lr-stagger flex flex-1 flex-col items-center justify-center" style={{ gap: 22 }}>
      <div style={{ height: 44 }} />
      <button type="button" className="lr-mic" onClick={onStart} disabled={disabled} aria-label="Start recording">
        <MicIcon className="size-8" strokeWidth={2.1} />
      </button>
      <div className="text-[14.5px] font-bold tracking-[-0.01em] text-(--ink-2)">Tap to record</div>
      <KeyboardHatch onKeyboard={onKeyboard} disabled={disabled} />
    </div>
  );
}

/* ====================  A — recording  ==================== */
function RecordingState({ level, onStop }: { level: number; onStop: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 22 }}>
      <div className="ph-levels" aria-hidden="true">
        {METER_SHAPE.map((m, i) => (
          <i key={i} style={{ height: 4 + level * m * 36 }} />
        ))}
      </div>
      <button type="button" className="lr-mic recording" onClick={onStop} aria-label="Stop recording">
        <span className="pulse" />
        <SquareIcon className="size-7" />
      </button>
      <div className="text-[14.5px] font-bold tracking-[-0.01em] text-(--ink-2)">Tap to stop</div>
    </div>
  );
}

/* ====================  A′ — scoring  ==================== */
function ScoringState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 22 }}>
      <div style={{ height: 44 }} />
      <div className="ph-scoring">
        <div className="ph-spinner" />
        <div className="absolute text-(--primary)">
          <MicIcon className="size-7" strokeWidth={2.1} />
        </div>
      </div>
      <div className="text-[15px] font-bold tracking-[-0.01em] text-(--ink-2)">
        Scoring your pronunciation…
      </div>
    </div>
  );
}

/* ---------- circular overall gauge ---------- */
function Gauge({ score, label }: { score: number; label: PhonemeLabel }) {
  const C = 2 * Math.PI * 52;
  const [off, setOff] = useState(C);
  useEffect(() => {
    const id = window.setTimeout(() => setOff(C * (1 - score / 100)), 80);
    return () => clearTimeout(id);
  }, [score, C]);
  const b = BAND[label];
  return (
    <div className="ph-gauge lr-pop">
      <svg width="116" height="116" viewBox="0 0 116 116">
        <circle cx="58" cy="58" r="52" fill="none" stroke="var(--learn-field-2)" strokeWidth="10" />
        <circle
          cx="58"
          cy="58"
          r="52"
          fill="none"
          stroke={b.line}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.3,0.9,0.3,1)" }}
        />
      </svg>
      <div className="gnum" style={{ flexDirection: "column" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 600, color: b.ink, lineHeight: 1 }}>
          {score}
        </div>
        <div className="text-[10.5px] font-extrabold tracking-[0.1em] text-(--ink-3) uppercase" style={{ marginTop: 2 }}>
          / 100
        </div>
      </div>
    </div>
  );
}

/* ---------- one phoneme tile ---------- */
function PhonemeTile({
  ph,
  active,
  onTap,
}: {
  ph: PhonemeScore;
  active: boolean;
  onTap: () => void;
}) {
  const b = BAND[ph.label];
  const labelText = ph.label === "good" ? "good" : ph.label === "practice" ? "needs practice" : "off";
  return (
    <button
      type="button"
      className={cn("ph-tile", active && "is-active")}
      style={tileVars(ph.label)}
      onClick={onTap}
      aria-label={`${ph.phone}, ${ph.score} out of 100, ${labelText}`}
    >
      <span className="ph-icon" style={{ color: b.line }}>
        {ph.label === "good" ? (
          <CheckIcon className="size-3.5" strokeWidth={3.4} />
        ) : ph.label === "practice" ? (
          <MinusIcon className="size-3.5" strokeWidth={3} />
        ) : (
          <XIcon className="size-3.5" strokeWidth={3.2} />
        )}
      </span>
      <span className="ph-glyph" style={{ color: b.ink }}>
        {ph.phone}
      </span>
      <span className="ph-meter">
        <i style={{ width: `${ph.score}%`, background: b.line }} />
      </span>
      <span className="ph-score" style={{ color: b.ink }}>
        {ph.score}
      </span>
    </button>
  );
}

/* ====================  B — result (hero)  ==================== */
function ResultState({
  score,
  playing,
  progress,
  activePh,
  onPlayMine,
  onTapPh,
  onTryAgain,
  disabled,
}: {
  score: PronunciationScore;
  playing: boolean;
  progress: number;
  activePh: number;
  onPlayMine: () => void;
  onTapPh: (i: number) => void;
  onTryAgain: () => void;
  disabled: boolean;
}) {
  const lbl = band(score.overallScore);
  const b = BAND[lbl];
  const noisy = score.audioQuality.clipping || score.audioQuality.snr_db < 12;
  return (
    <div className="flex flex-1 flex-col items-center" style={{ gap: 18 }}>
      {/* summary */}
      <div className="flex flex-col items-center text-center" style={{ gap: 4 }}>
        <Gauge score={score.overallScore} label={lbl} />
        <div className="lr-word" style={{ fontSize: 30, lineHeight: 1.12, whiteSpace: "nowrap", color: b.ink, marginTop: 8 }}>
          {b.word}
        </div>
        <div className="text-[14.5px] font-medium text-(--ink-2)" style={{ maxWidth: 300, marginTop: 2 }}>
          {b.sub}
        </div>
      </div>

      {/* phoneme breakdown — the hero */}
      <div className="flex w-full flex-col" style={{ gap: 9, marginTop: 2 }}>
        <div className="flex items-center justify-between">
          <div className="lr-eyebrow">Sound breakdown</div>
          <div className="text-[12px] font-semibold text-(--ink-3)">tap a sound to replay</div>
        </div>
        <div className="ph-strip">
          {score.phonemes.map((ph, i) => (
            <PhonemeTile key={i} ph={ph} active={activePh === i} onTap={() => onTapPh(i)} />
          ))}
        </div>
        <div className="ph-track">
          <i
            style={{
              width: `${playing ? progress * 100 : 0}%`,
              transition: playing ? "width 0.08s linear" : "width 0.25s ease",
            }}
          />
        </div>
      </div>

      {/* replay */}
      <div className="flex flex-col items-center" style={{ gap: 7, marginTop: 2 }}>
        <button
          type="button"
          className={cn("lr-orb violet", playing && "playing")}
          onClick={onPlayMine}
          aria-label={playing ? "Pause my recording" : "Play my recording"}
          aria-pressed={playing}
        >
          <span className="ring r1" />
          <span className="ring r2" />
          {playing ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
        </button>
        <div className="text-[12.5px] font-bold text-(--violet)">Your take</div>
      </div>

      {noisy && (
        <div className="ph-notice ph-notice--amber w-full">
          <span className="mt-px shrink-0 text-(--amber-2)">
            <TriangleAlertIcon className="size-4.5" />
          </span>
          <span>A bit of background noise came through. Re-record somewhere quieter for a more reliable score.</span>
        </div>
      )}

      <button
        type="button"
        className="lr-btn lr-btn--ghost lr-btn--md"
        onClick={onTryAgain}
        disabled={disabled}
        style={{ marginTop: 2 }}
      >
        <RotateCcwIcon className="size-4" /> Try again
      </button>
    </div>
  );
}

/* ====================  E1 — recording error  ==================== */
function RecErrorState({
  message,
  onRetry,
  onKeyboard,
  disabled,
}: {
  message: string;
  onRetry: () => void;
  onKeyboard: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 18 }}>
      <button type="button" className="lr-mic" onClick={onRetry} disabled={disabled} aria-label="Record again">
        <MicIcon className="size-8" strokeWidth={2.1} />
      </button>
      <div className="ph-notice ph-notice--amber" style={{ maxWidth: 340 }}>
        <span className="mt-px shrink-0 text-(--amber-2)">
          <TriangleAlertIcon className="size-4.5" />
        </span>
        <span>{message}</span>
      </div>
      <KeyboardHatch onKeyboard={onKeyboard} disabled={disabled} />
    </div>
  );
}

/* ====================  E2 — service down  ==================== */
function ServiceDownState({
  onRetry,
  onKeyboard,
  disabled,
}: {
  onRetry: () => void;
  onKeyboard: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 18 }}>
      <div className="grid size-22 place-items-center rounded-full bg-(--card-2) text-(--ink-3) shadow-[var(--sh-sm)]">
        <Volume2Icon className="size-9" />
      </div>
      <div className="flex flex-col items-center text-center" style={{ gap: 6 }}>
        <div className="lr-word" style={{ fontSize: 24, lineHeight: 1.15, whiteSpace: "nowrap" }}>
          Scoring is offline
        </div>
        <div className="text-[14px] font-medium text-(--ink-2)" style={{ maxWidth: 320 }}>
          We couldn’t reach the pronunciation coach. Try again, or answer by keyboard.
        </div>
      </div>
      <div className="flex w-full flex-col items-center" style={{ gap: 10, maxWidth: 300 }}>
        <button type="button" className="lr-btn lr-btn--soft lr-btn--md lr-btn--block" onClick={onRetry} disabled={disabled}>
          <RotateCcwIcon className="size-4" /> Retry
        </button>
        <button type="button" className="lr-btn lr-btn--ghost lr-btn--md lr-btn--block" onClick={onKeyboard} disabled={disabled}>
          <KeyboardIcon className="size-4" /> Use keyboard instead
        </button>
      </div>
    </div>
  );
}

/* ====================  C — keyboard fallback  ==================== */
function KeyboardState({
  value,
  status,
  onChange,
  onBackToVoice,
  disabled,
}: {
  value: string;
  status: "idle" | "correct" | "wrong";
  onChange: (v: string) => void;
  onBackToVoice: () => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="lr-stagger flex w-full flex-1 flex-col items-center justify-center" style={{ gap: 18 }}>
      <div className="lr-eyebrow">Type what you’d say</div>
      <input
        ref={ref}
        className={cn("lr-input text-center", status === "correct" && "is-correct", status === "wrong" && "is-wrong")}
        placeholder="Type the word…"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="Type what you'd say"
      />
      <button type="button" className="ph-linklike inline-flex items-center gap-1.5" onClick={onBackToVoice} disabled={disabled}>
        <MicIcon className="size-4" /> Back to voice
      </button>
    </div>
  );
}

/* ====================  main  ==================== */
export function PronunciationQuestion({ prompt, vocabularyId, disabled, result, onAnswerChange }: Props) {
  const settings = useLearnSettings();
  const recorder = useWavRecorder();
  const revealed = result !== null;

  const [phase, setPhase] = useState<Phase>("record");
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [kbValue, setKbValue] = useState("");

  // replay ("Your take")
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePh, setActivePh] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const tapTimer = useRef<number | null>(null);

  // keyboard fallback grade (lenient transcript-vs-lemma is server-side; this
  // only tints the field after Check reveals the answer).
  const kbStatus: "idle" | "correct" | "wrong" = !revealed
    ? "idle"
    : kbValue.trim().toLowerCase() === prompt.lemma.toLowerCase()
      ? "correct"
      : "wrong";

  /* report the answer up to the shared footer */
  useEffect(() => {
    if (phase === "result" && score) onAnswerChange(score.attemptId);
    else if (phase === "keyboard") onAnswerChange(kbValue.trim() || null);
    else onAnswerChange(null);
  }, [phase, score, kbValue, onAnswerChange]);

  /* build a replayable Audio element from the recorded clip */
  const stopReplay = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setProgress(0);
    setActivePh(-1);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [recordedBlob, stopReplay]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tapTimer.current) clearTimeout(tapTimer.current);
    },
    [],
  );

  const playMine = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      stopReplay();
      return;
    }
    if (tapTimer.current) clearTimeout(tapTimer.current);
    audio.currentTime = 0;
    void audio.play().catch(() => {});
    setPlaying(true);
    const tick = () => {
      const a = audioRef.current;
      if (!a) return;
      const dur = a.duration && isFinite(a.duration) ? a.duration : score?.audioQuality.duration_sec ?? 1;
      const t = a.currentTime;
      setProgress(dur > 0 ? Math.min(1, t / dur) : 0);
      setActivePh(score?.phonemes.findIndex((p) => t >= p.start_sec && t < p.end_sec) ?? -1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [playing, score, stopReplay]);

  const tapPh = useCallback(
    (i: number) => {
      if (playing) stopReplay();
      setActivePh(i);
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapTimer.current = window.setTimeout(() => setActivePh(-1), 1400);
    },
    [playing, stopReplay],
  );

  /* ---- record / score flow ---- */
  const scoreClip = useCallback(
    async (blob: Blob | null) => {
      if (!blob) {
        setErrorMsg("That recording didn’t come through — tap to try again.");
        setPhase("recError");
        return;
      }
      const form = new FormData();
      form.append("audio", blob, `${prompt.lemma || "word"}.wav`);
      form.append("vocabularyId", vocabularyId);
      const res = await scorePronunciationAction(form);
      if (res.ok) {
        setScore(res.score);
        setPhase("result");
      } else if (res.kind === "serviceDown") {
        setPhase("serviceDown");
      } else {
        setErrorMsg(res.message);
        setPhase("recError");
      }
    },
    [prompt.lemma, vocabularyId],
  );

  const startRecording = useCallback(async () => {
    setScore(null);
    setRecordedBlob(null);
    stopReplay();
    const ok = await recorder.start();
    if (ok) {
      setPhase("recording");
    } else {
      setErrorMsg("We couldn’t access your microphone. Check permissions, or use the keyboard.");
      setPhase("recError");
    }
  }, [recorder, stopReplay]);

  const stopRecording = useCallback(async () => {
    const blob = await recorder.stop();
    setRecordedBlob(blob);
    setPhase("scoring");
    await scoreClip(blob);
  }, [recorder, scoreClip]);

  const goKeyboard = useCallback(() => {
    stopReplay();
    recorder.reset();
    setPhase("keyboard");
  }, [recorder, stopReplay]);

  const backToVoice = useCallback(() => {
    setKbValue("");
    setPhase("record");
  }, []);

  const lock = disabled || revealed;

  let body: React.ReactNode;
  if (phase === "recording") {
    body = <RecordingState level={recorder.level} onStop={stopRecording} />;
  } else if (phase === "scoring") {
    body = <ScoringState />;
  } else if (phase === "result" && score) {
    body = (
      <ResultState
        score={score}
        playing={playing}
        progress={progress}
        activePh={activePh}
        onPlayMine={playMine}
        onTapPh={tapPh}
        onTryAgain={startRecording}
        disabled={lock}
      />
    );
  } else if (phase === "recError") {
    body = <RecErrorState message={errorMsg} onRetry={startRecording} onKeyboard={goKeyboard} disabled={lock} />;
  } else if (phase === "serviceDown") {
    body = <ServiceDownState onRetry={startRecording} onKeyboard={goKeyboard} disabled={lock} />;
  } else if (phase === "keyboard") {
    body = (
      <KeyboardState
        value={kbValue}
        status={kbStatus}
        onChange={setKbValue}
        onBackToVoice={backToVoice}
        disabled={lock}
      />
    );
  } else {
    body = <RecordState onStart={startRecording} onKeyboard={goKeyboard} disabled={lock} />;
  }

  const compactHeader = phase === "result";
  const showHeader = phase !== "serviceDown";

  return (
    <div className="flex flex-1 flex-col" data-grading={SUBMIT_ATTEMPT ? "acoustic" : "placeholder"}>
      {showHeader && (
        <PronHeader
          word={prompt.lemma}
          ipa={prompt.ipa}
          showPhonetic={settings.showPhonetic}
          audioUrl={prompt.audioUrl}
          compact={compactHeader}
        />
      )}
      <div className="flex flex-1 flex-col" style={{ marginTop: showHeader ? (compactHeader ? 14 : 6) : 0 }}>
        {body}
      </div>
    </div>
  );
}
