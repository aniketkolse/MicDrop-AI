"use client";

import * as React from "react";
import { Download, Gauge, Pause, Play, Volume2 } from "lucide-react";
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
    <div className="fixed inset-x-0 bottom-14 z-50 border-t border-[#34343F] bg-[#141419]/98 backdrop-blur lg:bottom-0 lg:left-[236px]">
      <div className="h-[2px] w-full bg-[#26262F]">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-3 lg:gap-5 lg:px-8">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={player.playing ? "Pause episode" : "Play episode"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-[#17121F] transition-transform hover:scale-[1.04] active:scale-95"
        >
          {player.playing ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>

        <div className="hidden w-44 shrink-0 md:block">
          <p className="truncate text-[12.5px] font-medium text-text-primary">{script.title}</p>
          <p className="mt-0.5 truncate text-[10.5px] text-text-secondary">
            {script.speakers.map((s) => s.name).join(" · ")}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular-nums text-text-secondary">
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
          <span className="w-9 shrink-0 font-mono text-[10px] tabular-nums text-text-secondary">
            {formatTime(player.duration)}
          </span>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          <Volume2 className="h-3.5 w-3.5 text-text-secondary" />
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

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setRateOpen((open) => !open)}
            className="flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-2 px-2 text-[11px] text-text-secondary hover:text-text-primary"
            aria-label="Playback speed"
          >
            <Gauge className="h-3.5 w-3.5" />
            {player.rate.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}×
          </button>
          {rateOpen ? (
            <div className="absolute bottom-10 right-0 z-10 w-28 rounded-lg border border-border bg-surface p-1 shadow-xl">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setRate(rate);
                    setRateOpen(false);
                  }}
                  className="block w-full rounded-md px-2.5 py-1.5 text-left text-[11.5px] text-text-secondary hover:bg-surface-2 hover:text-text-primary"
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
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 text-[11.5px] text-text-secondary transition-colors hover:border-[#454553] hover:text-text-primary"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">WAV</span>
        </a>
      </div>
    </div>
  );
}
