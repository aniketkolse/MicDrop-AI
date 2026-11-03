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
  saveEpisode,
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
    if (
      !window.confirm(`Delete “${meta.title}”? This cannot be undone.`)
    )
      return;
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
    <div className="mx-auto max-w-[1120px] px-4 py-6 lg:px-9 lg:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6F6F7D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            {isAuthenticated ? "Cloud library" : "Local archive"}
          </div>
          <h1 className="mt-2.5 font-display text-[36px] leading-none text-[#1C1917] sm:text-[42px]">
            My episodes
          </h1>
          <p className="mt-2 text-[#78716C] text-sm">
            {isAuthenticated
              ? "Stored in Supabase. Accessible across devices when signed in."
              : "Stored in this browser with IndexedDB. Your audio never leaves the device."}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#696978]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search episodes…"
              className="h-9 pl-8 text-[12px]"
            />
          </div>
          <Button size="sm" variant="secondary" onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
      </header>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#78716C]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading library…
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((episode) => {
              const isSupabase = isAuthenticated && !episodes.includes(episode);
              return (
                <article
                  key={episode.id}
                  className="group flex flex-col rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-8 hover:border-[#7C3AED]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E5E4] bg-[#F8F9FC] text-[#7C3AED]">
                      <AudioLines className="h-5 w-5" />
                    </div>
                    <Badge tone={episode.hasAudio ? "success" : "neutral"} size="sm">
                      {episode.hasAudio ? "audio ready" : "script only"}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-[#1C1917] leading-tight mb-3 group-hover:text-[#7C3AED] font-serif">
                    {episode.title}
                  </h2>
                  <p className="text-[#78716C] text-sm line-clamp-2 mb-6">
                    {episode.description || "No description yet."}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
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

                  <div className="mt-auto pt-6">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        loading={workingId === episode.id}
                        onClick={() =>
                          void openEpisode(episode, isSupabase && isAuthenticated)
                      }
                      >
                        <Play className="h-3 w-3 fill-current" /> Open
                      </Button>
                      {episode.hasAudio ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void downloadEpisode(episode, isSupabase && isAuthenticated)}
                        >
                          <Download className="h-3 w-3" /> WAV
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto text-[#DC2626] hover:bg-[#FFF5F5] border-[#FCA5A5]"
                        onClick={() => void removeEpisode(episode, isSupabase && isAuthenticated)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
