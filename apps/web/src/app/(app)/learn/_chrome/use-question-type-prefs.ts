"use client";

import { useCallback, useState } from "react";

import type { QuestionType } from "@/lib/me/learn/types";
import {
  DEFAULT_ENABLED_TYPES,
  FILTERABLE_TYPES,
  type QuestionGroup,
} from "./question-groups";

const STORAGE_KEY = "learn:enabledQuestionTypes";

/** Read saved prefs (SSR-safe). Falls back to "all on" on miss/corruption, and
 * never returns an empty set — a session always has at least one quiz type. */
function loadEnabled(): QuestionType[] {
  if (typeof window === "undefined") return [...DEFAULT_ENABLED_TYPES];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_ENABLED_TYPES];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_ENABLED_TYPES];
    const valid = parsed.filter(
      (t): t is QuestionType => typeof t === "string" && FILTERABLE_TYPES.includes(t as QuestionType),
    );
    return valid.length ? valid : [...DEFAULT_ENABLED_TYPES];
  } catch {
    return [...DEFAULT_ENABLED_TYPES];
  }
}

function save(enabled: readonly QuestionType[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  } catch {
    /* private mode / quota — preference just won't persist */
  }
}

/** Tri-state of a group's member toggles. */
export type GroupState = "on" | "off" | "mixed";

export interface QuestionTypePrefs {
  /** The enabled filterable types (never empty; `flashcard` is always kept regardless). */
  enabled: QuestionType[];
  isOn: (type: QuestionType) => boolean;
  toggleType: (type: QuestionType) => void;
  groupState: (group: QuestionGroup) => GroupState;
  toggleGroup: (group: QuestionGroup) => void;
  reset: () => void;
}

/**
 * Persisted "which question types do I want" preference, backed by localStorage.
 * The guardrail lives here: every mutation refuses to drop the last enabled type
 * so a session can never be filtered down to flashcards-only.
 */
export function useQuestionTypePrefs(): QuestionTypePrefs {
  const [enabled, setEnabled] = useState<QuestionType[]>(loadEnabled);

  /** Apply a transform, refusing an empty result, and persist. */
  const commit = useCallback((next: (prev: QuestionType[]) => QuestionType[]) => {
    setEnabled((prev) => {
      const candidate = next(prev);
      const value = candidate.length ? candidate : prev;
      save(value);
      return value;
    });
  }, []);

  const isOn = useCallback((type: QuestionType) => enabled.includes(type), [enabled]);

  const toggleType = useCallback(
    (type: QuestionType) => {
      commit((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
      );
    },
    [commit],
  );

  const groupState = useCallback(
    (group: QuestionGroup): GroupState => {
      const on = group.types.filter((t) => enabled.includes(t)).length;
      if (on === 0) return "off";
      if (on === group.types.length) return "on";
      return "mixed";
    },
    [enabled],
  );

  const toggleGroup = useCallback(
    (group: QuestionGroup) => {
      commit((prev) => {
        const allOn = group.types.every((t) => prev.includes(t));
        return allOn
          ? prev.filter((t) => !group.types.includes(t))
          : [...new Set([...prev, ...group.types])];
      });
    },
    [commit],
  );

  const reset = useCallback(() => {
    const value = [...DEFAULT_ENABLED_TYPES];
    save(value);
    setEnabled(value);
  }, []);

  return { enabled, isOn, toggleType, groupState, toggleGroup, reset };
}
