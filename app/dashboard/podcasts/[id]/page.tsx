"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { Play, Pause, Download, Trash2, Edit3, Mic2, AudioLines } from "lucide-react";

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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F5F7]">
        <div className="h-5 w-5 rounded-full animate-pulse bg-[#C7C7CC]" />
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F5F7]">
        <div className="text-center">
          <h2 className="text-[#1D1D1F] font-semibold">Podcast not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F5F7]">
      <nav className="flex items-center justify-between border-b border-[#D2D2D7] bg-white px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <span className="flex items-center gap-1 text-sm font-medium">
            <span className="h-3 w-3 text-[#86868B]">
              <ListMusicIcon />
            </span>
            My podcasts
          </span>
        </Button>
        <div className="flex gap-2">
          <Badge tone="neutral">{podcast.language}</Badge>
          <Badge tone={podcast.audio_path ? "success" : "neutral"}>
            {podcast.audio_path ? "Audio ready" : "Script only"}
          </Badge>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight mb-2">
              {podcast.title}
            </h1>
            <p className="text-[#86868B] text-sm">{podcast.description || ""}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/podcasts/${id}/edit`)}>
              <Edit3 className="h-4 w-4 mr-1" /> Edit script
            </Button>
            {podcast.audio_path ? (
              <Button size="sm" onClick={() => {}}>
                <Download className="h-4 w-4 mr-1" /> Download WAV
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#D2D2D7] shadow-sm p-6">
              <h2 className="font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                <Mic2 className="h-4 w-4" /> Script & speakers
              </h2>
              <div className="space-y-3">
                {(podcast.podcast_speakers as any[] | []).map((s: any, i: number) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#D2D2D7] bg-[#F9F9FA]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D2D2D7] bg-white text-[#007AFF] text-xs font-medium">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1D1D1F]">{s.speaker_name}</p>
                      <p className="text-xs text-[#86868B]">{s.speaker_role}</p>
                    </div>
                    <Badge tone="neutral">{s.voice_id || "default"}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#D2D2D7] shadow-sm p-6">
              <h2 className="font-semibold text-[#1D1D1F] mb-4">Dialogue segments</h2>
              <div className="space-y-2">
                {(podcast.podcast_segments as any[] | []).map((seg: any, i: number) => (
                  <div key={seg.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#D2D2D7] bg-white">
                    <span className="w-8 text-xs font-mono text-[#86868B]">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1">
                      <p className="text-sm text-[#1D1D1F]">{seg.heading}</p>
                      <p className="text-xs text-[#86868B] line-clamp-2">{seg.dialogue}</p>
                    </div>
                    <Badge tone="neutral">{seg.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#D2D2D7] shadow-sm p-6">
              <h2 className="font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                <AudioLines className="h-4 w-4" /> Audio player
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007AFF] text-white"
                >
                  {playing ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  )}
                </button>
                <div className="flex-1 space-y-2">
                  <div className="h-1 w-full rounded-full bg-[#D2D2D7]">
                    <div className="h-full rounded-full bg-[#007AFF] w-1/2" />
                  </div>
                  <div className="flex justify-between text-xs text-[#86868B]">
                    <span>0:00</span>
                    <span>0:00</span>
                  </div>
                </div>
                {podcast.audio_path ? (
                  <Button size="sm" onClick={() => {}}>
                    <Download className="h-3.5 w-3.5" /> WAV
                  </Button>
                ) : null}
              </div>
              <p className="mt-4 text-xs text-[#86868B]">
                {podcast.audio_path ? "Audio is ready to play." : "Generate audio to hear your episode."}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D2D2D7] shadow-sm p-6">
              <h2 className="font-semibold text-[#1D1D1F] mb-4">Actions</h2>
              <div className="space-y-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/dashboard/podcasts/${id}/edit`)}
                >
                  <Edit3 className="h-4 w-4 mr-1" /> Edit script
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#FF3B30] hover:bg-[#FFF2F2]"
                  onClick={() => {
                    if (window.confirm("Delete this podcast?")) {
                      void fetch(`/api/podcasts/${id}`, { method: "DELETE" }).then(() => router.push("/dashboard"));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListMusicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
