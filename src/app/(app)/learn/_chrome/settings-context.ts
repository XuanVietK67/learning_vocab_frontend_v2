"use client";

import { createContext, useContext } from "react";

/** Client-only display preferences for the study card (not persisted server-side). */
export interface LearnSettings {
  /** Auto-play the word/sentence audio when a new card appears. */
  autoplay: boolean;
  /** Show the IPA phonetic line on flashcards. */
  showPhonetic: boolean;
  /** Show the decorative image tile on flashcards. */
  showImage: boolean;
  /** Play the stage-clear interstitial between rounds (off → instant swap). */
  stageTransitions: boolean;
}

export const DEFAULT_LEARN_SETTINGS: LearnSettings = {
  autoplay: false,
  showPhonetic: true,
  showImage: true,
  stageTransitions: true,
};

export const SETTING_LABELS: Record<keyof LearnSettings, string> = {
  autoplay: "Auto-play audio",
  showPhonetic: "Show phonetic",
  showImage: "Show image",
  stageTransitions: "Stage celebrations",
};

const LearnSettingsContext = createContext<LearnSettings>(DEFAULT_LEARN_SETTINGS);

export const LearnSettingsProvider = LearnSettingsContext.Provider;

/** Read the active display preferences from inside any question leaf. */
export function useLearnSettings(): LearnSettings {
  return useContext(LearnSettingsContext);
}
