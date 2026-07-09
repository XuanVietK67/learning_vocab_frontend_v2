/**
 * Shapes for acoustic pronunciation scoring (`/v1/pronunciation/*`). Mirrors
 * docs/api/pronunciation_score.md — keep in sync when the backend contract changes.
 *
 * A learner records themselves saying a target word; the backend forwards the
 * audio to a GOPT phoneme scorer and returns an overall `0–100` score plus a
 * per-phoneme breakdown labelled `good` / `practice` / `wrong`, then persists
 * the attempt. The learn `pronunciation` card renders this breakdown and submits
 * the returned `attemptId` as its answer.
 */

/** Coarse per-phoneme grade: `good` (≥75) · `practice` (45–74) · `wrong` (<45). */
export type PhonemeLabel = "good" | "practice" | "wrong";

/** One scored IPA phone, in left-to-right order within the clip. */
export interface PhonemeScore {
  /** The IPA glyph, e.g. `"θ"`. */
  phone: string;
  /** Integer 0–100. */
  score: number;
  label: PhonemeLabel;
  /** Aligned time span (seconds) of this phone within the recording. */
  start_sec: number;
  end_sec: number;
}

/** Signal-quality readout for the clip; drives the optional re-record warning. */
export interface AudioQuality {
  duration_sec: number;
  too_short: boolean;
  clipping: boolean;
  /** Signal-to-noise ratio in dB; lower means noisier. */
  snr_db: number;
}

/** Body of a successful `POST /v1/pronunciation/score` (`201`). */
export interface PronunciationScore {
  /** Submit this as `userAnswer` on `/v1/me/learn/answer`. */
  attemptId: string;
  word: string;
  /** Integer 0–100. */
  overallScore: number;
  /** Canonical espeak/IPA sequence the word was scored against. */
  transcriptPhonemes: string[];
  phonemes: PhonemeScore[];
  audioQuality: AudioQuality;
  modelVersion: string;
  /** ISO timestamp. */
  createdAt: string;
}
