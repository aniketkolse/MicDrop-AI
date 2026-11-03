"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { Play, Pause, Download, Trash2, Edit3, Mic2, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PodcastPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [podcast, setPodcast] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    void fetch(`/api/podcasts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPodcast(data.podcast);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="h-5 w-5 rounded-full animate-ping border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Podcast not found</h2>
        </div>
      </div>
    );
  }

  const speakers = podcast.podcast_speakers as any[] | [];
  const segments = podcast.podcast_segments as any[] | [];

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between border-b border-input bg-card/80 backdrop-blur px-6 py-4 sticky top-0 z-20">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <ListMusicIcon className="h-3.5 w-3.5 text-muted-foreground" />
            My podcasts
          </span>
        </Button>
        <div className="flex gap-2">
          <Badge tone="neutral" size="sm">{podcast.language}</Badge>
          <Badge tone={podcast.audio_path ? "primary" : "neutral"} size="sm">
            {podcast.audio_path ? "Audio ready" : "Script only"}
          </Badge>
        </div>
      </nav>

      <div className="mx-auto max-w-[1000px] px-6 py-10 lg:px-9">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-balance font-display text-[32px] leading-[1.12] text-foreground sm:text-[40px]">
              {podcast.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
              {podcast.description || ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/podcasts/${id}/edit`)}>
              <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit script
            </Button>
            {podcast.audio_path ? (
              <a
                href={`/api/podcasts/${id}/audio`}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-input bg-secondary px-3 text-sm font-medium text-foreground hover:bg-accent/50"
              >
                <Download className="h-3.5 w-3.5" />
                Download WAV
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-input bg-card shadow">
              <div className="border-b border-accent px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mic2 className="h-3.5 w-3.5" /> Script & speakers
                </h2>
              </div>
              <div className="divide-y divide-accent p-5">
                {speakers.length > 0 ? (
                  speakers.map((s: any, i: number) => (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-3 rounded-lg">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{s.speaker_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{s.speaker_role}</p>
                      </div>
                      <Badge tone="neutral" size="sm">{s.voice_id || "default"}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">No speakers assigned.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-input bg-card shadow">
              <div className="border-b border-accent px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Dialogue segments</h2>
              </div>
              <div className="divide-y divide-accent p-5">
                {segments.length > 0 ? (
                  segments.map((seg: any, i: number) => (
                    <div key={seg.id} className="flex items-start gap-3 px-3 py-3 rounded-lg">
                      <span className="mt-0.5 w-8 shrink-0 text-[11px] font-mono text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{seg.heading}</p>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{seg.dialogue}</p>
                      </div>
                      <Badge tone="neutral" size="sm">{seg.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">No dialogue segments.</p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-input bg-card shadow p-6">
              <h2 className="flex items-center gap-2 mb-5 text-sm font-semibold text-foreground">
                <AudioLines className="h-3.5 w-3.5" /> Audio player
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.04] active:scale-95 shadow"
                >
                  {playing ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  )}
                </button>
                <div className="flex-1 space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={playing ? 50 : 0}
                    onChange={() => {}}
                    className="flex-1 h-1.5 cursor-pointer appearance-none rounded-full bg-accent/40 accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>0:00</span>
                    <span>0:00</span>
                  </div>
                </div>
                {podcast.audio_path ? (
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1.5" /> WAV
                  </Button>
                ) : null}
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                {podcast.audio_path ? "Audio is ready to play." : "Generate audio to hear your episode."}
              </p>
            </section>

            <section className="rounded-xl border border-input bg-card shadow p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Actions</h2>
              <div className="space-y-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/podcasts/${id}/edit`)}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit script
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/5 border-destructive/20"
                  onClick={() => {
                    if (window.confirm("Delete this podcast?")) {
                      void fetch(`/api/podcasts/${id}`, { method: "DELETE" }).then(() => router.push("/dashboard"));
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListMusicIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
