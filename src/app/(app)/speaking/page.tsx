import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PlayIcon, SparklesIcon } from "lucide-react";

import { getMe } from "@/lib/auth/me";
import type { CefrLevel } from "@/lib/auth/types";
import { getPracticeTopics } from "@/lib/me/practice/queue";
import { listScenarios } from "@/lib/me/speaking/scenarios";
import { cefrBadge, posterWash, topicLabel } from "@/lib/me/speaking/format";
import type { SpeakingScenario } from "@/lib/me/speaking/types";
import { CatalogueFilters } from "./catalogue-filters";

export const metadata: Metadata = { title: "Speaking Room" };

const CEFR_SET = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

/**
 * The Speaking Room catalogue (brief §4.1). A `.speak-field` page with a
 * violet→sky `.speak-band` header and a grid of scenario "movie posters". Filters
 * are URL state; when the learner hasn't pinned a level we mark cards at their own
 * CEFR level as recommended (the API already orders those first). The `(app)`
 * layout supplies auth + `.app-shell`; we add the `.speak-shell` conversation scope.
 */
export default async function SpeakingPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; cefrLevel?: string }>;
}) {
  const { topic = "", cefrLevel = "" } = await searchParams;
  const pinnedLevel = CEFR_SET.has(cefrLevel) ? (cefrLevel as CefrLevel) : undefined;

  const [user, topics, page] = await Promise.all([
    getMe(),
    getPracticeTopics(),
    listScenarios({
      topic: topic || undefined,
      cefrLevel: pinnedLevel,
    }),
  ]);

  const myLevel = user?.proficiencyLevel ?? null;
  const scenarios = page.data;

  return (
    <div className="speak-shell speak-field min-h-full">
      <div className="mx-auto w-full max-w-[1140px] px-5 pt-6 pb-20 sm:px-7">
        {/* hero band */}
        <header className="lr-card speak-band relative mb-7 overflow-hidden px-7 py-8 sm:px-9">
          <p className="lr-eyebrow text-(--violet)!">Speaking Room</p>
          <h1 className="serif mt-1.5 max-w-xl text-[34px] leading-[1.04] font-medium tracking-[-0.01em] text-(--ink) sm:text-[42px]">
            Practise a real conversation.
          </h1>
          <p className="mt-2 max-w-[560px] text-[15px] font-medium text-(--ink-2) sm:text-base">
            Pick a scene, weave in your target words, and talk it through with an AI
            partner. It listens, replies, and quietly coaches.
          </p>
          <div className="mt-5">
            <CatalogueFilters topics={topics} topic={topic} cefrLevel={cefrLevel} />
          </div>
        </header>

        {scenarios.length === 0 ? (
          <CatalogueEmpty filtered={Boolean(topic || pinnedLevel)} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                recommended={
                  !pinnedLevel && myLevel !== null && scenario.cefrLevel === myLevel
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** One scenario poster — a Link; the hover lift is pure CSS (`.hoverlift`). */
function ScenarioCard({
  scenario,
  recommended,
}: {
  scenario: SpeakingScenario;
  recommended: boolean;
}) {
  const badge = cefrBadge(scenario.cefrLevel);

  return (
    <Link
      href={`/speaking/${scenario.id}`}
      className="lr-card hoverlift group flex flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-(--violet-soft)"
    >
      {/* poster */}
      <div
        className="relative flex h-[116px] items-end p-3.5"
        style={{ background: posterWash(scenario.id) }}
      >
        {recommended && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-extrabold text-(--primary-ink) shadow-[0_2px_8px_rgba(16,40,32,0.12)]">
            <SparklesIcon className="size-3" /> Recommended for you
          </span>
        )}
        <span
          className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[12px] font-extrabold"
          style={{ background: badge.bg, color: badge.fg }}
        >
          {scenario.cefrLevel ?? "Any"}
        </span>
        <span className="grid size-9 place-items-center rounded-full bg-white/85 text-(--violet) shadow-[0_4px_10px_-3px_rgba(123,108,255,0.5)] transition-transform group-hover:scale-105">
          <PlayIcon className="size-4 translate-x-px fill-current" />
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col px-[18px] pt-4 pb-5">
        <span className="lr-chip lr-chip--violet self-start text-[13px]">
          {topicLabel(scenario.topic)}
        </span>
        <h2 className="serif mt-2.5 text-[23px] leading-[1.1] font-medium tracking-[-0.01em] text-(--ink)">
          {scenario.title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-(--ink-2)">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-(--primary)" />
            You: {scenario.userRole}
          </span>
          <span className="text-(--primary-soft-2)">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-(--violet)" />
            AI: {scenario.aiRole}
          </span>
        </div>
        <p className="mt-2.5 line-clamp-2 text-sm font-medium text-(--ink-2)">
          {scenario.goal}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          {scenario.estTurns ? (
            <span className="text-[13px] font-bold text-(--ink-3)">
              ~{scenario.estTurns} turns
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary-soft) px-3.5 py-2 text-sm font-bold text-(--primary-ink)">
            Start <ArrowRightIcon className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Composed, colourful empty state — a path forward, never a bare "no results". */
function CatalogueEmpty({ filtered }: { filtered: boolean }) {
  return (
    <div className="lr-card flex flex-col items-center px-8 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-(--violet-soft) text-(--violet)">
        <SparklesIcon className="size-7" />
      </span>
      <h2 className="serif mt-5 text-2xl font-medium text-(--ink)">
        {filtered ? "No scenes match those filters" : "No scenes yet"}
      </h2>
      <p className="mt-2 max-w-sm text-[15px] font-medium text-(--ink-2)">
        {filtered
          ? "Try a different topic or level — new conversations are added often."
          : "Conversations are on their way. Check back soon to start talking."}
      </p>
      {filtered && (
        <Link href="/speaking" className="lr-btn lr-btn--soft lr-btn--md mt-6">
          Clear filters
        </Link>
      )}
    </div>
  );
}
