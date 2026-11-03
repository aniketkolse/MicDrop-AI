"use client";

import { base64ToArrayBuffer, encodeWav } from "@/lib/audio-export";
import type { PodcastScript, PodcastSettings } from "@/types/podcast";

export type AudioProgress =
  | { type: "segment"; index: number; status: "generating" | "done" | "failed"; message?: string }
  | { type: "phase"; phase: "voices" | "mixing" | "encoding" }
  | { type: "complete"; blob: Blob };

interface ProduceOptions {
  script: PodcastScript;
  settings: PodcastSettings;
  musicFile: File | null;
  onProgress: (event: AudioProgress) => void;
  cache?: Map<number, AudioBuffer[]>;
  signal?: AbortSignal;
}

async function decodeBase64Audio(
  context: AudioContext,
  base64: string,
): Promise<AudioBuffer> {
  const arrayBuffer = base64ToArrayBuffer(base64);
  return context.decodeAudioData(arrayBuffer.slice(0));
}

export async function synthesizeSegment(
  text: string,
  language: string,
  voiceId: string,
  pace: number,
  context: AudioContext,
  signal?: AbortSignal,
): Promise<AudioBuffer[]> {
  const response = await fetch("/api/generate-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, voiceId, pace }),
    signal,
  });
  const payload = (await response.json().catch(() => null)) as
    | { audios?: string[]; error?: string }
    | null;
  if (!response.ok) {
    throw new Error(payload?.error || `Voice generation failed (HTTP ${response.status}).`);
  }
  if (!payload?.audios?.length) throw new Error("Voice generation returned no audio.");
  const buffers: AudioBuffer[] = [];
  for (const base64 of payload.audios) {
    buffers.push(await decodeBase64Audio(context, base64));
  }
  return buffers;
}

function concatenate(
  context: BaseAudioContext,
  buffers: AudioBuffer[],
  gapSeconds = 0.32,
): AudioBuffer {
  const sampleRate = buffers[0]?.sampleRate ?? 22050;
  const maxChannels = Math.min(2, Math.max(1, ...buffers.map((b) => b.numberOfChannels)));
  const gapFrames = Math.floor(gapSeconds * sampleRate);
  const totalFrames =
    buffers.reduce((sum, buffer) => sum + buffer.length, 0) + gapFrames * Math.max(0, buffers.length - 1);

  const output = context.createBuffer(maxChannels, Math.max(1, totalFrames), sampleRate);
  let offset = 0;
  buffers.forEach((buffer, index) => {
    for (let channel = 0; channel < maxChannels; channel++) {
      const source = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1));
      output.copyToChannel(source, channel, offset);
    }
    offset += buffer.length;
    if (index < buffers.length - 1) offset += gapFrames;
  });
  return output;
}

async function mixMusic(
  narration: AudioBuffer,
  musicFile: File,
  musicGain: number,
): Promise<AudioBuffer> {
  const context = new AudioContext();
  try {
    const musicBuffer = await context.decodeAudioData(await musicFile.arrayBuffer());
    const totalFrames = narration.length + Math.floor(narration.sampleRate * 1.2);
    const offline = new OfflineAudioContext(2, totalFrames, narration.sampleRate);

    const narrationSource = offline.createBufferSource();
    narrationSource.buffer = narration;
    narrationSource.connect(offline.destination);
    narrationSource.start(0);

    const musicSource = offline.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;
    const gain = offline.createGain();
    const clamped = Math.max(0, Math.min(1, musicGain)) * 0.45;
    // Fade in music over first second, then hold, then fade out at end
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(clamped, Math.min(1, narration.duration));
    gain.gain.setValueAtTime(clamped, Math.max(0, narration.duration - 1.2));
    gain.gain.linearRampToValueAtTime(0.0001, narration.duration + 0.4);
    musicSource.connect(gain).connect(offline.destination);
    musicSource.start(0);

    return await offline.startRendering();
  } finally {
    void context.close();
  }
}

/**
 * Apply a soft limiter to prevent clipping when mixing narration and music.
 * Samples above 0.85 are softly compressed to avoid harsh digital clipping.
 */
function applySoftLimiter(buffer: AudioBuffer): void {
  const threshold = 0.85;
  const knee = 0.1;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      let sample = data[i];
      if (sample > threshold) {
        const over = sample - threshold;
        sample = threshold + (over * knee) / (over + knee);
      } else if (sample < -threshold) {
        const over = Math.abs(sample) - threshold;
        sample = -(threshold + (over * knee) / (over + knee));
      }
      data[i] = Math.max(-1, Math.min(1, sample));
    }
  }
}

export async function produceEpisodeAudio({
  script,
  settings,
  musicFile,
  onProgress,
  cache,
  signal,
}: ProduceOptions): Promise<Blob> {
  const context = new AudioContext();
  try {
    const decoded: AudioBuffer[] = [];

    for (let index = 0; index < script.segments.length; index++) {
      if (signal?.aborted) throw new Error("Generation cancelled.");
      const cached = cache?.get(index);
      if (cached?.length) {
        decoded.push(...cached);
        onProgress({ type: "segment", index, status: "done" });
        continue;
      }

      const segment = script.segments[index];
      const speakerIndex = script.speakers.findIndex((s) => s.id === segment.speaker);
      const voiceId =
        script.speakers[speakerIndex]?.voiceId ??
        settings.voiceIds[speakerIndex] ??
        settings.voiceIds[0];

      if (!voiceId) throw new Error(`No voice selected for ${segment.speaker}.`);

      onProgress({ type: "segment", index, status: "generating" });
      try {
        const buffers = await synthesizeSegment(
          segment.text,
          script.language,
          voiceId,
          settings.pace,
          context,
          signal,
        );
        cache?.set(index, buffers);
        decoded.push(...buffers);
        onProgress({ type: "segment", index, status: "done" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Segment failed.";
        onProgress({ type: "segment", index, status: "failed", message });
        throw error;
      }
    }

    if (decoded.length === 0) throw new Error("No audio was generated.");

    onProgress({ type: "phase", phase: "voices" });
    let finalBuffer = concatenate(context, decoded);

    if (musicFile) {
      onProgress({ type: "phase", phase: "mixing" });
      finalBuffer = await mixMusic(finalBuffer, musicFile, settings.musicVolume ?? 0.2);
    }

    // Apply soft limiter to prevent clipping from narration + music mix
    applySoftLimiter(finalBuffer);

    onProgress({ type: "phase", phase: "encoding" });
    const blob = encodeWav(finalBuffer);
    onProgress({ type: "complete", blob });
    return blob;
  } finally {
    void context.close();
  }
}

