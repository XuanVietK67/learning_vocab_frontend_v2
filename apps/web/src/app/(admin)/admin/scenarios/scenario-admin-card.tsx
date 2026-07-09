"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon, PencilIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { cefrBadge, topicLabel } from "@/lib/me/speaking/format";
import { publishScenarioAction, retireScenarioAction } from "@/lib/admin/scenarios/actions";
import type { AdminScenario } from "@/lib/admin/scenarios/types";

const STATUS: Record<AdminScenario["status"], { cls: string; label: string }> = {
  draft: { cls: "sc-pill--draft", label: "Draft" },
  published: { cls: "sc-pill--live", label: "Live" },
  retired: { cls: "sc-pill--retired", label: "Retired" },
};

/** One scenario row in the admin gallery, with its lifecycle controls (brief §3.1). */
export function ScenarioAdminCard({ scenario }: { scenario: AdminScenario }) {
  const router = useRouter();
  const badge = cefrBadge(scenario.cefrLevel);
  const status = STATUS[scenario.status];
  const [pending, startTransition] = useTransition();
  const [confirmRetire, setConfirmRetire] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setConfirmRetire(false);
      router.refresh();
    });
  }

  return (
    <div className="lr-card flex flex-col p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={cn("sc-pill", status.cls)}>{status.label}</span>
        <span
          className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
          style={{ background: badge.bg, color: badge.fg }}
        >
          {scenario.cefrLevel ?? "Any"}
        </span>
        <span className="lr-chip lr-chip--violet text-[12.5px]">
          {topicLabel(scenario.topic)}
        </span>
      </div>

      <h2 className="serif text-[22px] leading-[1.12] font-medium tracking-[-0.01em] text-(--ink)">
        {scenario.title}
      </h2>
      <p className="mt-1.5 line-clamp-2 text-sm leading-snug font-medium text-(--ink-2)">
        {scenario.setting}
      </p>

      {error && <p className="mt-3 text-[13px] font-semibold text-(--bad-ink)">{error}</p>}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-(--line) pt-4">
        <span className="text-[13px] font-bold text-(--ink-3)">
          {scenario.estTurns ? `~${scenario.estTurns} turns · ` : ""}v{scenario.version}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/scenarios/${scenario.id}`}
            className="lr-btn lr-btn--soft lr-btn--sm"
          >
            <PencilIcon className="size-3.5" /> Edit
          </Link>

          {scenario.status !== "published" && (
            <button
              type="button"
              onClick={() => run(() => publishScenarioAction(scenario.id))}
              disabled={pending}
              className="lr-btn lr-btn--primary lr-btn--sm"
            >
              {pending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
              Publish
            </button>
          )}

          {scenario.status !== "retired" &&
            (confirmRetire ? (
              <button
                type="button"
                onClick={() => run(() => retireScenarioAction(scenario.id))}
                disabled={pending}
                className="lr-btn lr-btn--sm bg-(--bad-soft) text-(--bad-ink)"
              >
                {pending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
                Confirm retire
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRetire(true)}
                disabled={pending}
                className="lr-btn lr-btn--ghost lr-btn--sm"
              >
                Retire
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
