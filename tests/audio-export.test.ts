import { describe, it, expect, beforeAll } from "vitest";
import { encodeWav } from "@/lib/audio-export";

// jsdom doesn't have AudioBuffer; mock it for WAV encoder tests
beforeAll(() => {
  const channels = new Map();
  (globalThis as any).AudioBuffer = class AudioBuffer {
    numberOfChannels: number;
    length: number;
    sampleRate: number;
    duration: number;
    private _channels: Float32Array[];

    constructor(opts: { numberOfChannels: number; length: number; sampleRate: number }) {
      this.numberOfChannels = opts.numberOfChannels;
      this.length = opts.length;
      this.sampleRate = opts.sampleRate;
      this.duration = opts.length / opts.sampleRate;
      this._channels = [];
      for (let i = 0; i < opts.numberOfChannels; i++) {
        this._channels.push(new Float32Array(opts.length));
      }
    }

    getChannelData(channel: number): Float32Array {
      return this._channels[channel];
    }

    copyToChannel(source: Float32Array, channel: number, start = 0): void {
      this._channels[channel].set(source, start);
    }
  };
});

describe("audio-export", () => {
  it("encodes a silent mono buffer to valid WAV", async () => {
    const sampleRate = 22050;
    const duration = 1;
    const length = sampleRate * duration;
    const buffer = new AudioBuffer({
      numberOfChannels: 1,
      length,
      sampleRate,
    });
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) channel[i] = 0;

    const blob = encodeWav(buffer);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBeGreaterThan(44); // at least the header

    const array = new Uint8Array(await blob.arrayBuffer());
    // RIFF header
    expect(String.fromCharCode(...array.slice(0, 4))).toBe("RIFF");
    // WAVE marker
    expect(String.fromCharCode(...array.slice(8, 12))).toBe("WAVE");
    // fmt chunk
    expect(String.fromCharCode(...array.slice(12, 16))).toBe("fmt ");
    // data chunk
    expect(String.fromCharCode(...array.slice(36, 40))).toBe("data");
  });

  it("encodes stereo correctly", () => {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 22050,
      sampleRate: 22050,
    });
    const blob = encodeWav(buffer);
    expect(blob.type).toBe("audio/wav");
  });
});
