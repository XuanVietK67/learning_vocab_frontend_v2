"use client";

import { createContext, useContext } from "react";

/** Client-only display preferences for the study card (not persisted server-side). */
export interface LearnSettings {
  /** Auto-play the word/sentence audio when a new card appears. */
  autoplay: boolean;
  /** Play feedback cues: a ding on correct, soft tone on wrong, applause on a cleared round. */
  sound: boolean;
  /** Loop a background track while the session is in progress. */
  music: boolean;
  /** Show the IPA phonetic line on flashcards. */
  showPhonetic: boolean;
  /** Show the decorative image tile on flashcards. */
  showImage: boolean;
  /** Play the stage-clear interstitial between rounds (off → instant swap). */
  stageTransitions: boolean;
}

export const DEFAULT_LEARN_SETTINGS: LearnSettings = {
  autoplay: false,
  sound: true,
  music: true,
  showPhonetic: true,
  showImage: true,
  stageTransitions: true,
};

export const SETTING_LABELS: Record<keyof LearnSettings, string> = {
  autoplay: "Auto-play audio",
  sound: "Sound effects",
  music: "Background music",
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
