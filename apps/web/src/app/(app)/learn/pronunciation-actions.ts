"use server";

/**
 * Server Action for acoustic pronunciation scoring. The HTTP client is
 * server-only (httpOnly-cookie tokens), so the interactive card reaches
 * `POST /v1/pronunciation/score` through here. The audio blob travels as
 * `multipart/form-data` — `authedRequest` forwards the `FormData` untouched and
 * lets the runtime set the multipart boundary (do NOT set `Content-Type`).
 *
 * See docs/api/pronunciation_score.md for the contract and error table.
 */
import { authedRequest, firstMessage } from "@/lib/api";
import type { PronunciationScore } from "@/lib/me/pronunciation/types";

/** Why a score request failed, mapped to how the card should respond. */
export type ScoreFailureKind =
  /** `400` + `audioQuality.too_short` (or "too short" message): tell them to hold longer. */
  | "tooShort"
  /** `400`/`404`: bad/oversized/wrong-type audio, or the word couldn't be phonemized. */
  | "badAudio"
  /** `503`: scorer unreachable/timed out — offer Retry or fall back to STT. */
  | "serviceDown"
  /** Anything else. */
  | "error";

export type ScoreResult =
  | { ok: true; score: PronunciationScore }
  | { ok: false; kind: ScoreFailureKind; message: string };

/**
 * Score one recorded word. `form` must carry `audio` (a WAV/FLAC/OGG Blob,
 * ≤ 5 MB) and exactly one of `vocabularyId` / `word` — for a learn item always
 * `vocabularyId`. Returns a discriminated result the card branches on.
 */
export async function scorePronunciationAction(form: FormData): Promise<ScoreResult> {
  if (!(form.get("audio") instanceof Blob)) {
    return { ok: false, kind: "badAudio", message: "No audio was recorded." };
  }
  if (!form.get("vocabularyId") && !form.get("word")) {
    return { ok: false, kind: "error", message: "Nothing to score." };
  }

  const res = await authedRequest<PronunciationScore>("/v1/pronunciation/score", {
    method: "POST",
    body: form,
  });

  if (res.ok && res.data) {
    return { ok: true, score: res.data };
  }

  const message = firstMessage(res.error);
  switch (res.status) {
    case 400: {
      const tooShort = /too short/i.test(message ?? "");
      return tooShort
        ? {
            ok: false,
            kind: "tooShort",
            message: "That was a little short — hold the button a beat longer and say the whole word.",
          }
        : {
            ok: false,
            kind: "badAudio",
            message: message ?? "Couldn’t read that recording — try again somewhere quieter.",
          };
    }
    case 404:
      return { ok: false, kind: "badAudio", message: "Couldn’t score that word — try again." };
    case 503:
      return {
        ok: false,
        kind: "serviceDown",
        message: "We couldn’t reach the pronunciation coach.",
      };
    default:
      return {
        ok: false,
        kind: "error",
        message: message ?? "Couldn’t score that recording. Try again.",
      };
  }
}
