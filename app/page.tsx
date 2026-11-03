"use client";

import Link from "next/link";
import { ListMusic, Sparkles, Mic2, AudioLines } from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { CreateWorkspace } from "@/components/studio/create-workspace";
import { EpisodeWorkspace } from "@/components/studio/episode-workspace";
import { Button } from "@/components/ui";

export default function StudioPage() {
  const { script, episodeId } = useStudio();

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-10 lg:px-9 lg:py-14">
      {!script ? (
        <>
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
                MicDrop studio
              </span>
            </div>
            <h1 className="text-balance font-display text-[44px] leading-[1.05] text-foreground sm:text-[56px] lg:text-[64px]">
              Your next podcast starts here.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Turn a topic, prompt, or document into an editable, multilingual, multi-speaker
              episode with real voices — then render a downloadable WAV in the browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard/create">
                <Button size="lg" className="w-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create a podcast
                </Button>
              </Link>
              <Link href="/episodes">
                <Button variant="ghost" size="lg" className="w-auto">
                  <ListMusic className="h-4 w-4" />
                  Explore your library
                </Button>
              </Link>
            </div>
          </header>

          {episodeId ? (
            <EpisodeWorkspace />
          ) : (
            <section className="mt-12 border-t border-accent pt-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
                    Your episodes
                  </span>
                </div>
                <Link href="/episodes" className="text-sm font-medium text-primary hover:underline">
                  View all →
                </Link>
              </div>
              <EmptyEpisodes />
            </section>
          )}

          <CreateWorkspace />
        </>
      ) : (
        <EpisodeWorkspace />
      )}
    </div>
  );
}

function EmptyEpisodes() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-accent/40 bg-secondary/30 p-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
        <AudioLines className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No episodes yet</h3>
      <p className="mt-2 max-w-sm text-muted-foreground text-sm leading-relaxed">
        Create your first episode and it will appear here. Your audio never leaves this device.
      </p>
      <div className="mt-8">
        <Link href="/dashboard/create">
          <Button size="sm">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Create your first podcast
          </Button>
        </Link>
      </div>
    </div>
  );
}
