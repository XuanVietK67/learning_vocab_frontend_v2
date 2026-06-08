import Link from "next/link";
import { TagIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/admin/types";
import { PickerHead } from "./picker-head";

interface TopicPickerProps {
  topics: Topic[];
}

const TINTS = [
  "bg-(--primary-soft) text-(--primary-ink)",
  "bg-(--violet-soft) text-(--violet)",
  "bg-(--sky-soft) text-[#176e93]",
  "bg-(--amber-soft) text-(--amber-2)",
];

/** Topic selection step shown before a `mode=topic` session can start. */
export function TopicPicker({ topics }: TopicPickerProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-150 flex-col justify-center px-4 py-8">
      <div className="learn-anim-in">
        <PickerHead
          eyebrow="By topic"
          title="Pick a theme"
          sub="We’ll build a session around words from this topic."
        />

        {topics.length === 0 ? (
          <p className="text-(--ink-2)">No topics are available yet.</p>
        ) : (
          <div className="lr-stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
            {topics.map((topic, i) => (
              <Link
                key={topic.slug}
                href={`/learn?mode=topic&topicSlug=${topic.slug}`}
                className="learn-card flex flex-col items-start gap-3 p-4 transition hover:-translate-y-0.5"
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-2xl",
                    TINTS[i % TINTS.length],
                  )}
                >
                  <TagIcon className="size-5.5" />
                </span>
                <span className="font-extrabold">{topic.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
