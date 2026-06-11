import { SparklesIcon } from "lucide-react";

import type { StatsCounts } from "@/lib/me/types";

import {
  countsTotal,
  ProgressDonut,
  ProgressLegend,
  SectionHead,
} from "./widgets";

/**
 * Progress breakdown (§7.2): a mint-ramp donut over the SRS lifecycle counts
 * with a legend. Falls back to an empty "garden" card when the user has no
 * words yet (brand-new state).
 */
export function ProgressGarden({ counts }: { counts: StatsCounts }) {
  if (countsTotal(counts) === 0) return <EmptyProgress />;

  return (
    <section className="lr-card grid grid-cols-1 items-center gap-9 p-[30px] shadow-[var(--sh-md)] md:grid-cols-[auto_1fr]">
      <div className="flex justify-center">
        <ProgressDonut counts={counts} size={186} stroke={24} />
      </div>
      <div>
        <SectionHead
          eyebrow="Progress"
          title="Your vocabulary garden"
          sub="Words move from new → learning → review → mastered as you study."
        />
        <ProgressLegend counts={counts} cols={2} />
      </div>
    </section>
  );
}

function EmptyProgress() {
  return (
    <section className="lr-card flex items-center gap-[18px] p-[30px] text-(--ink-2)">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#d8f3e9,var(--primary-soft))] text-(--primary-ink)">
        <SparklesIcon size={26} />
      </span>
      <div>
        <h3 className="serif mb-1 text-[22px] font-semibold text-(--ink)">
          Your garden is empty — for now
        </h3>
        <p className="text-sm">
          Learn your first words and watch this fill with mint.
        </p>
      </div>
    </section>
  );
}
