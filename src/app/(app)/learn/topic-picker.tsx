"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";

import type { Topic } from "@/lib/admin/types";
import { TopicTile } from "./cards";
import { PickerHead } from "./picker-head";

interface TopicPickerProps {
  topics: Topic[];
}

/**
 * "See all" topic picker (`mode=topic`, no target yet). A searchable responsive
 * grid; each tile drops straight into a session for that topic.
 */
export function TopicPicker({ topics }: TopicPickerProps) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = query
    ? topics.filter((t) => t.name.toLowerCase().includes(query))
    : topics;

  return (
    <div className="learn-anim-in mx-auto w-full max-w-3xl px-5 pt-11 pb-24">
      <PickerHead
        eyebrow="By topic"
        title="Choose a topic"
        sub="Pick a theme — each one drops you straight into a session."
      />

      <div className="mt-5 flex items-center gap-3 rounded-[15px] border border-(--line) bg-(--learn-surface) px-4 py-3.5 shadow-(--sh-md) transition focus-within:border-(--primary) focus-within:shadow-[0_0_0_4px_var(--primary-soft)]">
        <SearchIcon className="size-[18px] shrink-0 text-(--ink-3)" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search topics…"
          aria-label="Search topics"
          className="w-full border-none bg-transparent text-[15px] text-(--ink) outline-none placeholder:text-(--ink-3)"
        />
      </div>

      {topics.length === 0 ? (
        <p className="mt-6 text-(--ink-2)">No topics are available yet.</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-[13px] text-(--ink-2)">No topics match “{q}”.</p>
      ) : (
        <>
          <div className="lr-stagger mt-5 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5">
            {list.map((topic, i) => (
              <TopicTile key={topic.slug} topic={topic} idx={i} fill />
            ))}
          </div>
          <div className="mt-6 text-[13px] font-medium text-(--ink-2)">
            {list.length} {list.length === 1 ? "topic" : "topics"}
          </div>
        </>
      )}
    </div>
  );
}
