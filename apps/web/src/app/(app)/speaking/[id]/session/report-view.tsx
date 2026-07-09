"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, RotateCcwIcon } from "lucide-react";

import { cefrBadge } from "@/lib/me/speaking/format";
import type { SpeakingReport, SpeakingScenario } from "@/lib/me/speaking/types";

/**
 * The feedback report as a colourful results card (brief §4.3), not a grey
 * summary: a mint "you did it" hero, the target words you lit up vs. missed, the
 * same amber correction cards from the live coaching channel, and sky "what next"
 * chips that point back into Learn / Practice.
 */
export function ReportView({
  scenario,
  report,
  turns,
  onPracticeAgain,
}: {
  scenario: SpeakingScenario;
  report: SpeakingReport;
  turns: number;
  onPracticeAgain: () => void;
}) {
  const badge = cefrBadge(report.estimatedLevel ?? scenario.cefrLevel);
  const usedCount = report.targetWordsUsed.length;
  const targetTotal = usedCount + report.targetWordsMissed.length;

  return (
    <div className="lr-card lr-in overflow-hidden">
      {/* hero */}
      <div className="speak-band--mint px-7 pt-8 pb-7 sm:px-9">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="lr-eyebrow text-(--primary-ink)!">Session report</p>
            <h1 className="serif mt-2 max-w-[460px] text-[28px] leading-[1.12] font-medium tracking-[-0.01em] text-(--ink) sm:text-[32px]">
              {report.summary}
            </h1>
            <div className="mt-5 flex gap-7">
              <Stat value={String(turns)} label="turns spoken" tone="var(--primary)" />
              {targetTotal > 0 && (
                <Stat
                  value={`${usedCount}/${targetTotal}`}
                  label="targets used"
                  tone="var(--ok)"
                />
              )}
            </div>
          </div>
          <div className="shrink-0 text-center">
            <div
              className="grid size-[78px] place-items-center rounded-[22px]"
              style={{ background: badge.bg }}
            >
              <span
                className="serif text-[30px] font-semibold"
                style={{ color: badge.fg }}
              >
                {report.estimatedLevel ?? scenario.cefrLevel ?? "—"}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] font-bold text-(--ink-3)">estimated level</p>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="px-7 pt-6 pb-8 sm:px-9">
        {targetTotal > 0 && (
          <section>
            <p className="lr-eyebrow mb-3">Target words</p>
            <div className="flex flex-wrap gap-2">
              {report.targetWordsUsed.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 rounded-full bg-(--ok-soft) px-3.5 py-1.5 text-sm font-bold text-(--ok-ink)"
                >
                  <CheckIcon className="size-3.5" strokeWidth={3} /> {word}
                </span>
              ))}
              {report.targetWordsMissed.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center rounded-full border-[1.5px] border-dashed border-(--line-2) px-3.5 py-1.5 text-sm font-semibold text-(--ink-3)"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>
        )}

        {report.topMistakes.length > 0 && (
          <section className="mt-7">
            <p className="lr-eyebrow mb-3">Things to polish</p>
            <div className="flex flex-col gap-2.5">
              {report.topMistakes.map((mistake, i) => (
                <div
                  key={`${mistake.userSaid}-${i}`}
                  className="rounded-[6px_16px_16px_6px] border-l-4 border-(--amber) bg-(--amber-soft) px-4 py-3.5"
                >
                  <p className="text-sm text-(--ink-2) line-through decoration-[#d9b56a]">
                    {mistake.userSaid}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-(--ink)">{mistake.better}</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-(--warn-ink)">
                    {mistake.why}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {report.whatToPracticeNext.length > 0 && (
          <section className="mt-7">
            <p className="lr-eyebrow mb-3">What to practise next</p>
            <div className="flex flex-wrap gap-2">
              {report.whatToPracticeNext.map((next) => (
                <Link
                  key={next}
                  href="/practice"
                  className="inline-flex items-center gap-1.5 rounded-full bg-(--sky-soft) px-3.5 py-2 text-sm font-bold text-[#0f5e80] transition-transform hover:-translate-y-0.5"
                >
                  {next} <ArrowRightIcon className="size-3.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPracticeAgain}
            className="lr-btn lr-btn--primary lr-btn--lg"
          >
            <RotateCcwIcon className="size-5" /> Practise again
          </button>
          <Link href="/speaking" className="lr-btn lr-btn--ghost lr-btn--md">
            Back to scenarios
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div>
      <div className="serif tnum text-[30px] font-semibold" style={{ color: tone }}>
        {value}
      </div>
      <div className="text-[12px] font-bold tracking-[0.04em] text-(--ink-3)">{label}</div>
    </div>
  );
}
