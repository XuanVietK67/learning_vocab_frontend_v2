"use client";

import { useState } from "react";

import { QuickAddScreen } from "./quick-add-screen";
import { ManualWordForm } from "./manual-word-form";

export interface TopicOption {
  slug: string;
  name: string;
}

type Mode =
  | { kind: "quick" }
  | { kind: "manual"; lemma: string; fromFailed: boolean };

/**
 * Switches between Quick add (default) and the manual full form without a full
 * navigation, carrying the typed lemma across when the user falls back from a
 * failed quick-add (the most important handoff in this feature).
 */
export function AddWordScreen({
  initialManual,
  initialLemma,
  appLanguage,
  nativeLanguage,
  topics,
}: {
  initialManual: boolean;
  initialLemma: string;
  appLanguage: string;
  nativeLanguage: string;
  topics: TopicOption[];
}) {
  const [mode, setMode] = useState<Mode>(
    initialManual
      ? { kind: "manual", lemma: initialLemma, fromFailed: Boolean(initialLemma) }
      : { kind: "quick" },
  );

  if (mode.kind === "manual") {
    return (
      <ManualWordForm
        prefillLemma={mode.lemma}
        fromFailed={mode.fromFailed}
        appLanguage={appLanguage}
        nativeLanguage={nativeLanguage}
        topics={topics}
        onBack={() => setMode({ kind: "quick" })}
      />
    );
  }

  return (
    <QuickAddScreen
      appLanguage={appLanguage}
      nativeLanguage={nativeLanguage}
      onOpenManual={(lemma, fromFailed) =>
        setMode({ kind: "manual", lemma, fromFailed })
      }
    />
  );
}
