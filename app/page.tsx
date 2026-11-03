"use client";

import { AudioLines, ListMusic, Mic2 } from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { CreateWorkspace } from "@/components/studio/create-workspace";
import { EpisodeWorkspace } from "@/components/studio/episode-workspace";

export default function StudioPage() {
  const { script } = useStudio();

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 lg:px-9 lg:py-8">
      {!script ? (
        <>
          <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6F6F7D]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                AI podcast studio
              </div>
              <h1 className="mt-3 font-display text-[38px] leading-[1.02] text-text-primary sm:text-[48px]">
                Turn a thought into
                <br className="hidden sm:block" /> a show.
              </h1>
              <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-text-secondary">
                Give MicDrop a topic or a document. Sarvam writes a real conversation, cast it with
                Indian-language voices, and produce a downloadable episode — in minutes.
              </p>
            </div>

            <div className="hidden w-full max-w-[300px] rounded-xl border border-border bg-surface p-4 md:block">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#6D6D7B]">
                  Studio signal
                </span>
                <span className="flex items-center gap-1 text-[9.5px] text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> ready
                </span>
              </div>
              <div className="mt-3 flex h-8 items-end gap-[3px]">
                {[0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.45, 0.8, 0.6, 0.95, 0.4, 0.7, 0.55, 0.85, 0.3].map(
                  (height, index) => (
                    <span
                      key={index}
                      className="w-full rounded-sm bg-[#3B334F]"
                      style={{ height: `${height * 100}%` }}
                    />
                  ),
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[9.5px] text-[#6F6F7D]">
                <span className="flex items-center gap-1">
                  <ListMusic className="h-3 w-3" /> script
                </span>
                <span className="flex items-center gap-1">
                  <Mic2 className="h-3 w-3" /> voices
                </span>
                <span className="flex items-center gap-1">
                  <AudioLines className="h-3 w-3" /> WAV
                </span>
              </div>
            </div>
          </header>
          <CreateWorkspace />
        </>
      ) : (
        <EpisodeWorkspace />
      )}
    </div>
  );
}
