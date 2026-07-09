"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Records the mic to a **16 kHz mono WAV** Blob for the acoustic pronunciation
 * scorer. We can't use `MediaRecorder` — it produces `webm/opus`, which the
 * scoring service rejects (see docs/api/pronunciation_score.md §Client notes).
 * Instead we capture raw PCM via the Web Audio API, downsample to 16 kHz, and
 * hand-roll the WAV container.
 *
 * Browser-only (uses `AudioContext`/`getUserMedia`); call from a client
 * component. Exposes a smoothed RMS `level` for the live recording meter.
 */

const TARGET_SAMPLE_RATE = 16000;
const FRAME_SIZE = 4096;

export interface UseWavRecorder {
  recording: boolean;
  /** Smoothed RMS amplitude 0–1 while recording (drives the live meter). */
  level: number;
  /** Non-null when the mic couldn't be opened (permission denied, no device). */
  error: string | null;
  /** Open the mic and begin capturing. Resolves `false` (and sets `error`) if the mic can't be opened. */
  start: () => Promise<boolean>;
  /** Stop capturing; resolves the recorded WAV Blob (null if nothing captured). */
  stop: () => Promise<Blob | null>;
  /** Discard any capture and clear state (e.g. on Try again). */
  reset: () => void;
}

interface Pipeline {
  stream: MediaStream;
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  processor: ScriptProcessorNode;
  sink: GainNode;
}

export function useWavRecorder(): UseWavRecorder {
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pipeline = useRef<Pipeline | null>(null);
  const chunks = useRef<Float32Array[]>([]);
  const sourceRate = useRef<number>(TARGET_SAMPLE_RATE);

  const teardown = useCallback(() => {
    const p = pipeline.current;
    if (!p) return;
    pipeline.current = null;
    p.processor.onaudioprocess = null;
    try {
      p.source.disconnect();
      p.processor.disconnect();
      p.sink.disconnect();
    } catch {
      // nodes may already be detached
    }
    p.stream.getTracks().forEach((t) => t.stop());
    void p.ctx.close().catch(() => {});
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    chunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      sourceRate.current = ctx.sampleRate;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(FRAME_SIZE, 1, 1);
      // Mute the monitor path so the mic doesn't echo, but still pull audio
      // through the processor (Chrome won't fire onaudioprocess otherwise).
      const sink = ctx.createGain();
      sink.gain.value = 0;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        chunks.current.push(new Float32Array(input));
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        const rms = Math.sqrt(sum / input.length);
        // Light smoothing + a small boost so quiet speech still moves the meter.
        setLevel((prev) => prev * 0.6 + Math.min(1, rms * 3) * 0.4);
      };

      source.connect(processor);
      processor.connect(sink);
      sink.connect(ctx.destination);

      pipeline.current = { stream, ctx, source, processor, sink };
      setRecording(true);
      return true;
    } catch {
      setError("We couldn’t access your microphone. Check permissions, or use the keyboard.");
      setRecording(false);
      return false;
    }
  }, []);

  const stop = useCallback(async (): Promise<Blob | null> => {
    teardown();
    setRecording(false);
    setLevel(0);
    const captured = chunks.current;
    chunks.current = [];
    if (captured.length === 0) return null;

    const merged = mergeChunks(captured);
    const downsampled = downsample(merged, sourceRate.current, TARGET_SAMPLE_RATE);
    return encodeWav(downsampled, TARGET_SAMPLE_RATE);
  }, [teardown]);

  const reset = useCallback(() => {
    teardown();
    chunks.current = [];
    setRecording(false);
    setLevel(0);
    setError(null);
  }, [teardown]);

  // Release the mic if the question unmounts mid-recording.
  useEffect(() => teardown, [teardown]);

  return { recording, level, error, start, stop, reset };
}

function mergeChunks(chunks: Float32Array[]): Float32Array {
  let length = 0;
  for (const c of chunks) length += c.length;
  const out = new Float32Array(length);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/** Average-window resampler — fine for short single-word speech clips. */
function downsample(input: Float32Array, from: number, to: number): Float32Array {
  if (to >= from) return input;
  const ratio = from / to;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = end > start ? sum / (end - start) : input[start] ?? 0;
  }
  return out;
}

/** Wrap mono Float32 PCM as a 16-bit little-endian WAV Blob (`audio/wav`). */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // subchunk1 size (PCM)
  view.setUint16(20, 1, true); // audio format: PCM
  view.setUint16(22, 1, true); // channels: mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}
