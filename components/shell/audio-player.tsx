"use client";

import * as React from "react";
import { Download, Pause, Play, Volume2, Gauge, RefreshCw, Sparkles } from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { formatTime } from "@/lib/utils";
import { Slider } from "@/components/ui";

export function AudioPlayer() {
  const { audioUrl, script, player, togglePlay, seek, setVolume, setRate } = useStudio();
  const [rateOpen, setRateOpen] = React.useState(false);

  if (!audioUrl || !script) return null;

  const slug = script.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "micdrop-episode";

  const progress = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E7E5E4] bg-white/90 backdrop-blur-xl lg:bottom-auto lg:left-[272px] lg:h-full lg:w-[340px] lg:border-r lg:border-t-0 lg:rounded-none lg:shadow-none">
      <div className="h-[2px] w-full bg-[#E7E5E4]">
        <div
          className="h-full bg-[#7C3AED] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mx-auto max-w-[1240px] items-center gap-5 px-6 py-4 lg:flex lg:px-8 lg:py-6">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={player.playing ? "Pause episode" : "Play episode"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white transition-transform hover:scale-[1.04] active:scale-95 shadow-luxury"
        >
          {player.playing ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          )}
        </button>

        <div className="hidden w-64 shrink-0 lg:block">
          <p className="truncate text-sm font-semibold text-[#1C1917]">{script.title}</p>
          <p className="mt-1 text-[11px] text-[#78716C]">
            {script.speakers.map((s) => s.name).join(" · ")}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="w-9 shrink-0 text-right font-mono text-[11px] tabular-nums text-[#78716C]">
            {formatTime(player.currentTime)}
          </span>
          <Slider
            aria-label="Seek"
            min={0}
            max={player.duration || 0}
            step={0.1}
            value={Math.min(player.currentTime, player.duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            className="flex-1"
          />
          <span className="w-9 shrink-0 font-mono text-[11px] tabular-nums text-[#78716C]">
            {formatTime(player.duration)}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Volume2 className="h-3.5 w-3.5 text-[#78716C]" />
          <Slider
            aria-label="Volume"
            min={0}
            max={1}
            step={0.01}
            value={player.volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-20"
          />
        </div>

        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setRateOpen((open) => !open)}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E7E5E4] bg-[#F8F9FC] px-2.5 text-[11px] text-[#1C191F] hover:bg-[#F3F4F6]"
            aria-label="Playback speed"
          >
            <Gauge className="h-3.5 w-3.5" />
            {player.rate.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}×
          </button>
          {rateOpen ? (
            <div className="absolute bottom-[56px] right-0 z-10 w-32 rounded-xl border border-[#E7E5E4] bg-white shadow-lg p-1">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setRate(rate);
                    setRateOpen(false);
                  }}
                  className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] text-[#1C1917] hover:bg-[#F3F4F6]"
                >
                  {rate}×
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <a
          href={audioUrl}
          download={`${slug}.wav`}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[#E7E5E4] bg-[#F8F9FC] px-3 text-[11px] font-medium text-[#1C1917] hover:bg-[#F3F4F6]"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">WAV</span>
        </a>
      </div>
    </div>
  );
}
