"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AudioLines,
  CalendarDays,
  Download,
  Loader2,
  Play,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { Badge, Button, EmptyState, Input } from "@/components/ui";
import {
  deleteEpisode,
  getEpisodeAudio,
  listEpisodes,
} from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";
import type { EpisodeMeta } from "@/types/podcast";

interface SupabasePodcast {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  language: string;
  status: string;
  audio_path: string | null;
  podcast_speakers: any[];
  podcast_segments: any[];
}

function toEpisodeMeta(p: SupabasePodcast): EpisodeMeta {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    createdAt: new Date(p.created_at).getTime(),
    duration: 0,
    language: (p.language as any) ?? "en-IN",
    speakerNames: p.podcast_speakers.map((s) => s.speaker_name),
    style: "casual",
    script: {
      title: p.title,
      description: p.description ?? "",
      duration: 0,
      language: (p.language as any) ?? "en-IN",
      speakers: p.podcast_speakers.map((s) => ({
        id: s.id,
        name: s.speaker_name,
        role: s.speaker_role,
        voiceId: s.voice_id,
      })),
      segments: p.podcast_segments.map((s) => ({
        id: s.id,
        heading: s.heading,
        speaker: s.speaker_id || "host1",
        text: s.dialogue,
      })),
      researchNote: "Synced from Supabase.",
    },
    settings: {
      sourceType: "topic",
      topic: p.title,
      sourceText: "",
      duration: 5,
      language: (p.language as any) ?? "en-IN",
      speakerCount: (p.podcast_speakers.length as unknown as 1 | 2 | 3),
      style: "casual",
      audience: "general",
      depth: "standard",
      pace: 1,
      voiceIds: p.podcast_speakers.map((s) => s.voice_id ?? ""),
      musicEnabled: false,
      musicVolume: 0.16,
    },
    hasAudio: Boolean(p.audio_path),
  };
}

export default function EpisodesPage() {
  const router = useRouter();
  const {
    loadEpisode,
    loadEpisodeFromSupabase,
    episodeId,
    resetStudio,
    notify,
    isAuthenticated,
  } = useStudio();
  const [episodes, setEpisodes] = React.useState<EpisodeMeta[]>([]);
  const [supabaseEpisodes, setSupabaseEpisodes] = React.useState<SupabasePodcast[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [workingId, setWorkingId] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const res = await fetch("/api/podcasts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const pods: SupabasePodcast[] = data.podcasts ?? [];
          setSupabaseEpisodes(pods);
          const meta = pods.map(toEpisodeMeta);
          setEpisodes(meta);
        } else {
          const local = await listEpisodes();
          setEpisodes(local);
          setSupabaseEpisodes([]);
        }
      } else {
        const local = await listEpisodes();
        setEpisodes(local);
        setSupabaseEpisodes([]);
      }
    } catch {
      notify("error", "Could not read the episode library.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, notify]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const openEpisode = async (meta: EpisodeMeta, isSupabase = false) => {
    setWorkingId(meta.id);
    try {
      if (isSupabase && isAuthenticated) {
        const data = await loadEpisodeFromSupabase(meta.id);
        if (data) {
          router.push("/");
          return;
        }
      }
      const audio = await getEpisodeAudio(meta.id);
      loadEpisode(meta, audio);
      router.push("/");
    } catch {
      notify("error", "Could not open that episode.");
    } finally {
      setWorkingId(null);
    }
  };

  const downloadEpisode = async (meta: EpisodeMeta, isSupabase = false) => {
    setWorkingId(meta.id);
    try {
      if (isSupabase && isAuthenticated && meta.hasAudio) {
        const res = await fetch(`/api/podcasts/${meta.id}/audio`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.signedUrl) {
            window.location.href = data.signedUrl;
            setWorkingId(null);
            return;
          }
        }
        notify("info", "No audio available for download.");
        setWorkingId(null);
        return;
      }
      const audio = await getEpisodeAudio(meta.id);
      if (!audio) {
        notify("info", "This episode has a script but no rendered audio yet.");
        setWorkingId(null);
        return;
      }
      const url = URL.createObjectURL(audio);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${meta.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.wav`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      notify("error", "Could not download that episode.");
    } finally {
      setWorkingId(null);
    }
  };

  const removeEpisode = async (meta: EpisodeMeta, isSupabase = false) => {
    if (!window.confirm(`Delete “${meta.title}”? This cannot be undone.`)) return;
    setWorkingId(meta.id);
    try {
      if (isSupabase && isAuthenticated) {
        const res = await fetch(`/api/podcasts/${meta.id}`, {
          method: "DELETE",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Delete failed");
      } else {
        await deleteEpisode(meta.id);
        if (meta.id === episodeId) resetStudio();
      }
      await refresh();
      notify("success", "Episode deleted.");
    } catch {
      notify("error", "Could not delete that episode.");
    } finally {
      setWorkingId(null);
    }
  };

  const allEpisodes = isAuthenticated ? supabaseEpisodes.map(toEpisodeMeta) : episodes;

  const filtered = allEpisodes.filter((episode) =>
    `${episode.title} ${episode.description} ${episode.speakerNames.join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10 lg:px-9">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
              {isAuthenticated ? "Cloud library" : "Local archive"}
            </span>
          </div>
          <h1 className="text-balance font-display text-[32px] leading-[1.12] text-foreground sm:text-[40px]">
            My episodes
          </h1>
          <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
            {isAuthenticated
              ? "Stored in Supabase. Accessible across devices when signed in."
              : "Stored in this browser with IndexedDB. Your audio never leaves the device."}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search episodes…"
              className="h-9 pl-9 text-sm"
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => void refresh()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5">
              <path d="M1 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4" />
              <polyline points="8 17 12 13 16 17" />
              <polyline points="16 11 12 14 8 14" />
            </svg>
            Refresh
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading library…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<AudioLines className="h-5 w-5" />}
            title={allEpisodes.length === 0 ? "No episodes yet" : "No matching episodes"}
            description={
              allEpisodes.length === 0
                ? isAuthenticated
                  ? "Create your first podcast and it will be saved to the cloud."
                  : "Generate a script, render the voices, and your first episode will be saved here automatically."
                : "Try a different search term, or create a new episode."
            }
            action={
              <Button variant="primary" onClick={() => router.push("/")}>
                Create an episode
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-accent">
            {filtered.map((episode) => {
              const isSupabase = isAuthenticated && !episodes.includes(episode);
              return (
                <article
                  key={episode.id}
                  className="flex items-center gap-4 rounded-xl border border-input bg-card shadow p-5 hover:bg-accent/30 transition-colors duration-150 cursor-pointer group"
                  onClick={() => void openEpisode(episode, isSupabase && isAuthenticated)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <AudioLines className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {episode.title}
                    </h2>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                      {episode.description || "No description yet."}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(episode.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {episode.speakerNames.join(", ") || "Solo"}
                      </span>
                      <span className="flex items-center gap-1">
                        <AudioLines className="h-3 w-3" />
                        {episode.hasAudio ? "Audio ready" : "Script only"}
                      </span>
                    </div>
                  </div>
                  <Badge tone={episode.hasAudio ? "primary" : "neutral"} size="sm">
                    {episode.hasAudio ? "audio ready" : "script only"}
                  </Badge>
                  <div className="flex gap-2">
                    {episode.hasAudio ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          void downloadEpisode(episode, isSupabase && isAuthenticated);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1.5" />
                        WAV
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-destructive hover:bg-destructive/5 border-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeEpisode(episode, isSupabase && isAuthenticated);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
