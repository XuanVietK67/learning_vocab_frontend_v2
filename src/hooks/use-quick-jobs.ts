"use client";

/**
 * Client-side tracker for in-flight AI enrichment work, persisted to
 * localStorage. The backend has no "list my jobs/batches" endpoint — you can
 * only poll a known id — so we remember the ids the admin started here. This
 * makes async work survive navigation: the Jobs page and the sidebar badge read
 * from this store, and the single/bulk flows mirror their progress into it.
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "lexikon.quickJobs";
const EVENT = "lexikon:quickJobs";

/** A tracked single-word job. */
export interface TrackedJob {
  kind: "single";
  id: string;
  label: string;
  language: string;
  /** Target language for sense translations; equals `language` when skipped. */
  translationLanguage?: string;
  status: "pending" | "completed" | "empty" | "failed";
  resultCount: number;
  createdAt: number;
}

/** A tracked bulk import batch. */
export interface TrackedBatch {
  kind: "bulk";
  id: string;
  label: string;
  topics: string[];
  total: number;
  completed: number;
  failed: number;
  pending: number;
  createdAt: number;
}

export type TrackedItem = TrackedJob | TrackedBatch;

function read(): TrackedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrackedItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: TrackedItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

/** True while the item still has work running. */
export function isActive(item: TrackedItem): boolean {
  return item.kind === "single"
    ? item.status === "pending"
    : item.completed + item.failed < item.total;
}

/** Insert or update a tracked item by id (most recent first). */
export function upsertTracked(item: TrackedItem): void {
  const items = read();
  const i = items.findIndex((x) => x.id === item.id);
  if (i === -1) items.unshift(item);
  else items[i] = item;
  write(items.slice(0, 50));
}

/** Drop a tracked item by id. */
export function removeTracked(id: string): void {
  write(read().filter((x) => x.id !== id));
}

/**
 * Live view of the tracked items. Re-reads on cross-tab `storage` events and
 * same-tab updates dispatched by the helpers above.
 */
export function useQuickJobs(): {
  items: TrackedItem[];
  activeCount: number;
  remove: (id: string) => void;
  clearFinished: () => void;
} {
  const [items, setItems] = useState<TrackedItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const remove = useCallback((id: string) => removeTracked(id), []);
  const clearFinished = useCallback(
    () => write(read().filter(isActive)),
    [],
  );

  return {
    items,
    activeCount: items.filter(isActive).length,
    remove,
    clearFinished,
  };
}
