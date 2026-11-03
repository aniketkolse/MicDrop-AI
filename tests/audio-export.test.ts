import { describe, it, expect } from "vitest";
import { encodeWav } from "@/lib/audio-export";

// Mock AudioBuffer for jsdom compatibility
beforeAllSetup();

function beforeAllSetup() {
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
}

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
    expect(blob.size).toBeGreaterThan(44);

    const array = new Uint8Array(await blob.arrayBuffer());
    expect(String.fromCharCode(...array.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...array.slice(8, 12))).toBe("WAVE");
    expect(String.fromCharCode(...array.slice(12, 16))).toBe("fmt ");
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

  it("encodes audio with actual samples", () => {
    const sampleRate = 22050;
    const length = sampleRate;
    const buffer = new AudioBuffer({
      numberOfChannels: 1,
      length,
      sampleRate,
    });
    const channel = buffer.getChannelData(0);
    // Generate a sine wave
    for (let i = 0; i < length; i++) {
      channel[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
    }

    const blob = encodeWav(buffer);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBe(44 + length * 2); // header + 16-bit samples
  });
});
