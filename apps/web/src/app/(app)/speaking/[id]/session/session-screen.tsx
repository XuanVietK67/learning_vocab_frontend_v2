"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  Loader2Icon,
  MicIcon,
  RotateCcwIcon,
  SendIcon,
  TriangleAlertIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { cefrBadge } from "@/lib/me/speaking/format";
import {
  endSessionAction,
  getReportAction,
  takeTurnAction,
} from "@/lib/me/speaking/session-actions";
import type {
  ReportStatus,
  SpeakingCorrection,
  SpeakingReport,
  SpeakingScenario,
  SpeakingSession,
} from "@/lib/me/speaking/types";
import { clearStart, readStart } from "../../_shared/handoff";
import { useDictation, useSpeechSynthesis } from "../../_shared/voice";
import { ReportView } from "./report-view";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  corrections: SpeakingCorrection[];
}

type ReportState =
  | { phase: "building" }
  | { phase: "ready"; report: SpeakingReport }
  | { phase: "failed"; message: string };

/**
 * The live, turn-based conversation (brief §4.3) — the centrepiece. Channels:
 * the AI's `reply` is spoken (violet bubbles + speaking orb), `corrections` are
 * the quiet amber teaching cards tucked under the learner's turn, and
 * `usedTargetWords` tick the header chips mint→done live. Strictly turn-based:
 * the composer locks while a turn is in flight. A failed turn (503) is not saved,
 * so the text is kept for an inline Retry.
 */
export function SessionScreen({
  scenario,
  sessionId,
}: {
  scenario: SpeakingScenario;
  sessionId: string | null;
}) {
  const router = useRouter();
  const badge = cefrBadge(scenario.cefrLevel);

  const [resolved, setResolved] = useState(false);
  const [session, setSession] = useState<SpeakingSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState<{ message: string; retry: boolean } | null>(null);
  const [capReached, setCapReached] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ending, setEnding] = useState(false);
  const [report, setReport] = useState<ReportState | null>(null);

  const idRef = useRef(0);
  const uid = (): string => `m${++idRef.current}`;
  const seededRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { speak, cancel, speaking, supported: ttsSupported } = useSpeechSynthesis();
  const { recording, start: startRec, stop: stopRec, supported: micSupported } =
    useDictation((text) => setDraft(text));

  // Resolve the handed-off session once on mount, seed the AI's turn 0, speak it.
  // This is a one-time sync from a sessionStorage entry (unavailable during SSR),
  // so seeding state in the effect is intentional, not a "you might not need an
  // effect" case.
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const found = sessionId ? readStart(sessionId) : null;
    /* eslint-disable react-hooks/set-state-in-effect */
    setSession(found);
    setResolved(true);
    if (found) {
      setMessages([{ id: uid(), role: "ai", text: found.openingLine, corrections: [] }]);
      if (!muted) speak(found.openingLine);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // run once for this sessionId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Keep the transcript pinned to the latest turn.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, inFlight]);

  const targets = session?.selectedWords ?? [];

  async function send(text: string) {
    if (!sessionId || inFlight || capReached) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    if (recording) stopRec();

    const userId = uid();
    setMessages((prev) => [...prev, { id: userId, role: "user", text: trimmed, corrections: [] }]);
    setDraft("");
    setInFlight(true);
    setError(null);

    const res = await takeTurnAction(sessionId, trimmed);
    setInFlight(false);

    if (!res.ok) {
      // The turn was not saved — drop the optimistic bubble and keep the text.
      setMessages((prev) => prev.filter((m) => m.id !== userId));
      setDraft(trimmed);
      if (res.kind === "capReached") setCapReached(true);
      setError({ message: res.message, retry: res.kind === "retry" });
      return;
    }

    setMessages((prev) =>
      prev
        .map((m) => (m.id === userId ? { ...m, corrections: res.turn.corrections } : m))
        .concat({ id: uid(), role: "ai", text: res.turn.reply, corrections: [] }),
    );
    if (res.turn.usedTargetWords.length > 0) {
      setUsed((prev) => {
        const next = new Set(prev);
        for (const word of res.turn.usedTargetWords) next.add(word.toLowerCase());
        return next;
      });
    }
    if (!muted) speak(res.turn.reply);
  }

  async function end() {
    if (!sessionId || ending) return;
    cancel();
    setEnding(true);
    setReport({ phase: "building" });
    const res = await endSessionAction(sessionId);
    clearStart(sessionId);
    setEnding(false);
    applyReport(res.ok ? res.envelope.reportStatus : "failed", res.ok ? res.envelope.report : null, res.ok ? null : res.message);
  }

  async function retryReport() {
    if (!sessionId) return;
    setReport({ phase: "building" });
    const res = await getReportAction(sessionId);
    applyReport(res.ok ? res.envelope.reportStatus : "failed", res.ok ? res.envelope.report : null, res.ok ? null : res.message);
  }

  function applyReport(status: ReportStatus | "failed", data: SpeakingReport | null, message: string | null) {
    if (status === "ready" && data) {
      setReport({ phase: "ready", report: data });
    } else {
      setReport({ phase: "failed", message: message ?? "We couldn't build your report this time." });
    }
  }

  function toggleMute() {
    setMuted((m) => {
      if (!m) cancel();
      return !m;
    });
  }

  const userTurns = messages.filter((m) => m.role === "user").length;

  // ---- report phase ---------------------------------------------------------
  if (report) {
    return (
      <div className="speak-shell speak-field min-h-full">
        <div className="mx-auto w-full max-w-[820px] px-5 pt-6 pb-20 sm:px-7">
          {report.phase === "building" && <ReportBuilding />}
          {report.phase === "failed" && (
            <ReportFailed message={report.message} onRetry={() => void retryReport()} />
          )}
          {report.phase === "ready" && (
            <ReportView
              scenario={scenario}
              report={report.report}
              turns={userTurns}
              onPracticeAgain={() => router.push(`/speaking/${scenario.id}`)}
            />
          )}
        </div>
      </div>
    );
  }

  // ---- recovery (no handed-off session) -------------------------------------
  if (resolved && !session) {
    return (
      <div className="app-shell speak-shell speak-field flex min-h-[calc(100vh-3.5rem)] flex-col justify-center px-4 py-10">
        <div className="lr-card lr-pop mx-auto w-full max-w-md p-9 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-(--violet-soft) text-(--violet)">
            <MicIcon className="size-7" />
          </div>
          <h1 className="serif text-2xl font-medium text-(--ink)">
            This conversation isn&apos;t open here
          </h1>
          <p className="mt-2 text-[15px] font-medium text-(--ink-2)">
            The page was refreshed or opened fresh, so the live transcript is gone.
            You can still build a report from it, or start the scene over.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            {sessionId && (
              <button
                type="button"
                onClick={() => void end()}
                disabled={ending}
                className="lr-btn lr-btn--primary lr-btn--md lr-btn--block"
              >
                {ending ? <Loader2Icon className="size-[18px] animate-spin" /> : null}
                Build my report
              </button>
            )}
            <Link
              href={`/speaking/${scenario.id}`}
              className="lr-btn lr-btn--ghost lr-btn--md lr-btn--block"
            >
              Start the scene over
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- live -----------------------------------------------------------------
  return (
    <div className="speak-shell speak-field h-[calc(100dvh-3.5rem)] lg:h-screen">
      <div className="mx-auto flex h-full w-full max-w-[900px] flex-col px-4 pt-4 pb-5 sm:px-6">
        {/* header */}
        <div className="lr-card speak-band shrink-0 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative size-[50px] shrink-0">
              <div
                className="grid size-[50px] place-items-center rounded-full text-white shadow-[0_8px_18px_-5px_rgba(123,108,255,0.55),inset_0_2px_4px_rgba(255,255,255,0.35)]"
                style={{
                  background:
                    "radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%)",
                }}
              >
                <MicIcon className="size-[22px]" />
              </div>
              {speaking && (
                <span className="absolute -inset-[5px] animate-[lr-ring_1.5s_ease-out_infinite] rounded-full border-[2.5px] border-(--violet) motion-reduce:hidden" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[17px] font-extrabold tracking-[-0.01em] text-(--ink)">
                  {scenario.aiRole}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                  style={{ background: badge.bg, color: badge.fg }}
                >
                  {scenario.cefrLevel ?? "Any"}
                </span>
              </div>
              <p className="truncate text-[13px] font-semibold text-(--ink-2)">
                {scenario.title}
              </p>
            </div>
            {ttsSupported && (
              <button
                type="button"
                onClick={toggleMute}
                aria-pressed={muted}
                aria-label={muted ? "Unmute voice" : "Mute voice"}
                className="lr-icon-btn"
              >
                {muted ? <VolumeXIcon className="size-[18px]" /> : <Volume2Icon className="size-[18px]" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => void end()}
              disabled={ending}
              className="lr-btn lr-btn--ghost lr-btn--sm"
            >
              {ending ? <Loader2Icon className="size-4 animate-spin" /> : null}
              End session
            </button>
          </div>

          {/* target chips */}
          {targets.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="lr-eyebrow">Targets</span>
              {targets.map((word) => {
                const done = used.has(word.toLowerCase());
                return done ? (
                  <span
                    key={word}
                    className="lr-pop inline-flex items-center gap-1.5 rounded-full bg-(--ok-soft) px-3 py-1.5 text-[13px] font-bold text-(--ok-ink)"
                  >
                    <CheckIcon className="size-3.5" strokeWidth={3} /> {word}
                  </span>
                ) : (
                  <span
                    key={word}
                    className="inline-flex items-center rounded-full bg-(--primary-soft) px-3 py-1.5 text-[13px] font-semibold text-(--primary-ink)"
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* transcript */}
        <div
          ref={scrollRef}
          aria-live="polite"
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 pt-5 pb-2"
        >
          {messages.map((message) =>
            message.role === "ai" ? (
              <AiBubble key={message.id} text={message.text} />
            ) : (
              <UserBubble key={message.id} text={message.text} corrections={message.corrections} />
            ),
          )}
          {inFlight && <TypingBubble />}
        </div>

        {/* notices */}
        {capReached && (
          <div className="mb-2 flex items-center gap-2.5 rounded-(--r-tile) bg-(--amber-soft) px-4 py-3 text-sm font-semibold text-(--warn-ink)">
            <TriangleAlertIcon className="size-4 shrink-0" />
            You&apos;ve reached the turn limit — end the session to get your report.
          </div>
        )}
        {error && !capReached && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-(--r-tile) bg-(--bad-soft) px-4 py-3 text-sm font-semibold text-(--bad-ink)">
            <span className="inline-flex items-center gap-2">
              <TriangleAlertIcon className="size-4 shrink-0" /> {error.message}
            </span>
            {error.retry && (
              <button
                type="button"
                onClick={() => void send(draft)}
                className="inline-flex items-center gap-1.5 rounded-full bg-(--bad-ink) px-3 py-1.5 text-[13px] font-bold text-white"
              >
                <RotateCcwIcon className="size-3.5" /> Retry
              </button>
            )}
          </div>
        )}

        {/* composer */}
        <div className="lr-card shrink-0 flex items-center gap-4 px-4 py-3.5">
          <button
            type="button"
            onClick={() => (recording ? stopRec() : startRec())}
            disabled={!micSupported || inFlight || capReached}
            aria-pressed={recording}
            aria-label={recording ? "Stop recording" : "Record your reply"}
            title={micSupported ? undefined : "Voice input isn't supported here — type instead"}
            className={cn("lr-mic shrink-0", recording && "recording")}
            style={{ width: 76, height: 76 }}
          >
            <MicIcon className="size-7" />
            <span className="pulse" />
          </button>
          <div className="flex flex-1 flex-col gap-2">
            <p
              className={cn(
                "text-[13px] font-bold",
                recording ? "text-(--bad)" : "text-(--ink-3)",
              )}
            >
              {recording
                ? "Listening… tap the mic to stop"
                : capReached
                  ? "Turn limit reached — end the session"
                  : micSupported
                    ? "Tap to speak, or type your reply"
                    : "Type your reply"}
            </p>
            <div className="flex items-center gap-2.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(draft);
                  }
                }}
                disabled={inFlight || capReached}
                placeholder="…or type your reply"
                aria-label="Your reply"
                className="lr-input flex-1 py-3! text-base!"
              />
              <button
                type="button"
                onClick={() => void send(draft)}
                disabled={inFlight || capReached || !draft.trim()}
                aria-label="Send"
                className="grid size-[50px] shrink-0 place-items-center rounded-full bg-(--primary) text-white shadow-[var(--sh-primary)] transition-transform hover:not-disabled:-translate-y-0.5 disabled:opacity-40"
              >
                {inFlight ? (
                  <Loader2Icon className="size-5 animate-spin" />
                ) : (
                  <SendIcon className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** AI message — violet, left-aligned, with a small speaking-orb avatar. */
function AiBubble({ text }: { text: string }) {
  return (
    <div className="lr-in flex max-w-[80%] items-end gap-2.5">
      <span
        className="grid size-[34px] shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_-3px_rgba(123,108,255,0.5)]"
        style={{ background: "radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%)" }}
      >
        <MicIcon className="size-[15px]" />
      </span>
      <div className="rounded-[18px_18px_18px_5px] bg-(--violet-soft) px-4 py-3 text-base leading-relaxed font-medium text-(--ink)">
        {text}
      </div>
    </div>
  );
}

/** Learner message — mint, right-aligned — with any corrections tucked beneath. */
function UserBubble({ text, corrections }: { text: string; corrections: SpeakingCorrection[] }) {
  return (
    <div className="lr-in flex max-w-[80%] flex-col items-end gap-2 self-end">
      <div className="rounded-[18px_18px_5px_18px] bg-(--primary-soft) px-4 py-3 text-base leading-relaxed font-semibold text-(--primary-ink)">
        {text}
      </div>
      {corrections.map((correction, i) => (
        <div
          key={`${correction.userSaid}-${i}`}
          className="max-w-[420px] rounded-[6px_16px_16px_6px] border-l-4 border-(--amber) bg-(--amber-soft) px-4 py-3"
        >
          <p className="lr-eyebrow flex items-center gap-1.5 text-(--warn-ink)!">A softer way</p>
          <p className="mt-1.5 text-sm text-(--ink-2) line-through decoration-[#d9b56a]">
            {correction.userSaid}
          </p>
          <p className="mt-0.5 text-[15px] font-bold text-(--ink)">{correction.better}</p>
          <p className="mt-1.5 text-[13px] leading-snug text-(--warn-ink)">{correction.why}</p>
        </div>
      ))}
    </div>
  );
}

/** The AI "thinking" indicator while a turn is in flight. */
function TypingBubble() {
  return (
    <div className="flex items-end gap-2.5">
      <span
        className="grid size-[34px] shrink-0 place-items-center rounded-full text-white"
        style={{ background: "radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%)" }}
      >
        <MicIcon className="size-[15px]" />
      </span>
      <div className="flex gap-1.5 rounded-[18px_18px_18px_5px] bg-(--violet-soft) px-[18px] py-4">
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            className="size-2 rounded-full bg-(--violet) motion-reduce:animate-none"
            style={{ animation: `lr-blink 1.2s infinite ${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/** "Listening back over the conversation" while the report model runs. */
function ReportBuilding() {
  return (
    <div className="lr-card px-8 py-14 text-center">
      <div
        className="mx-auto grid size-16 place-items-center rounded-full text-white shadow-[0_8px_18px_-5px_rgba(123,108,255,0.55)]"
        style={{ background: "radial-gradient(120% 120% at 35% 25%, #a99bff, var(--violet) 70%)" }}
      >
        <MicIcon className="size-7" />
      </div>
      <h1 className="serif mt-5 text-[28px] font-medium text-(--ink)">Building your report…</h1>
      <p className="mt-1.5 font-medium text-(--ink-2)">Listening back over the conversation.</p>
      <div className="relative mx-auto mt-6 h-3 max-w-[340px] overflow-hidden rounded-full bg-[#e2ebe6]">
        <span className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#e2ebe6_25%,#eef4f0_37%,#e2ebe6_63%)] bg-[length:200%_100%] motion-safe:animate-[lr-sheen_1.3s_linear_infinite]" />
      </div>
    </div>
  );
}

/** Report build failed — retryable without re-ending (brief §5). */
function ReportFailed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="lr-card lr-pop px-8 py-14 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-(--bad-soft) text-(--bad-ink)">
        <TriangleAlertIcon className="size-7" />
      </div>
      <h1 className="serif mt-5 text-[26px] font-medium text-(--ink)">
        Couldn&apos;t build your report
      </h1>
      <p className="mx-auto mt-2 max-w-sm font-medium text-(--ink-2)">{message}</p>
      <div className="mt-6 flex flex-col items-center gap-2.5">
        <button type="button" onClick={onRetry} className="lr-btn lr-btn--primary lr-btn--md">
          <RotateCcwIcon className="size-[18px]" /> Try again
        </button>
        <Link href="/speaking" className="lr-btn lr-btn--ghost lr-btn--sm">
          Back to scenarios
        </Link>
      </div>
    </div>
  );
}
