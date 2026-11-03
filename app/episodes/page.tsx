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
import { deleteEpisode, getEpisodeAudio, listEpisodes } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";
import type { EpisodeMeta } from "@/types/podcast";

export default function EpisodesPage() {
  const router = useRouter();
  const { loadEpisode, episodeId, resetStudio, notify } = useStudio();
  const [episodes, setEpisodes] = React.useState<EpisodeMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [workingId, setWorkingId] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      setEpisodes(await listEpisodes());
    } catch {
      notify("error", "Could not read the local episode library in this browser.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const openEpisode = async (meta: EpisodeMeta) => {
    setWorkingId(meta.id);
    try {
      const audio = await getEpisodeAudio(meta.id);
      loadEpisode(meta, audio);
      router.push("/");
    } catch {
      notify("error", "Could not open that episode.");
    } finally {
      setWorkingId(null);
    }
  };

  const downloadEpisode = async (meta: EpisodeMeta) => {
    setWorkingId(meta.id);
    try {
      const audio = await getEpisodeAudio(meta.id);
      if (!audio) {
        notify("info", "This episode has a script but no rendered audio yet.");
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

  const removeEpisode = async (meta: EpisodeMeta) => {
    if (!window.confirm(`Delete “${meta.title}” from this browser? This cannot be undone.`)) return;
    setWorkingId(meta.id);
    try {
      await deleteEpisode(meta.id);
      if (meta.id === episodeId) resetStudio();
      setEpisodes((prev) => prev.filter((episode) => episode.id !== meta.id));
      notify("success", "Episode deleted.");
    } catch {
      notify("error", "Could not delete that episode.");
    } finally {
      setWorkingId(null);
    }
  };

  const filtered = episodes.filter((episode) =>
    `${episode.title} ${episode.description} ${episode.speakerNames.join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 lg:px-9 lg:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6F6F7D]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Local archive
          </div>
          <h1 className="mt-2.5 font-display text-[36px] leading-none text-text-primary sm:text-[42px]">
            My episodes
          </h1>
          <p className="mt-2 text-[12px] text-text-secondary">
            Stored in this browser with IndexedDB. Your audio never leaves the device.
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
          <div className="flex items-center justify-center py-24 text-text-secondary">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading library…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<AudioLines className="h-5 w-5" />}
            title={episodes.length === 0 ? "No episodes yet" : "No matching episodes"}
            description={
              episodes.length === 0
                ? "Generate a script, render the voices, and your first episode will be saved here automatically."
                : "Try a different search term, or create a new episode."
            }
            action={
              <Button variant="primary" onClick={() => router.push("/")}>
                Create an episode
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((episode) => (
              <article
                key={episode.id}
                className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-[#3E3E4A]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#6F6F7D]">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(episode.createdAt)}
                  </span>
                  <div className="flex gap-1.5">
                    <Badge tone={episode.hasAudio ? "success" : "neutral"}>
                      {episode.hasAudio ? "audio ready" : "script only"}
                    </Badge>
                    <Badge tone="neutral">{episode.language}</Badge>
                  </div>
                </div>

                <h2 className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug text-text-primary">
                  {episode.title}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-text-secondary">
                  {episode.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#777785]">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {episode.speakerNames.join(", ") || "Solo"}
                  </span>
                  <span className="flex items-center gap-1">
                    <AudioLines className="h-3 w-3" />
                    {formatTime(episode.duration)}
                  </span>
                  <span className="capitalize">{episode.style}</span>
                </div>

                <div className="mt-4 flex items-center gap-1.5 border-t border-[#26262F] pt-3">
                  <Button
                    size="sm"
                    variant="primary"
                    loading={workingId === episode.id}
                    onClick={() => void openEpisode(episode)}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!episode.hasAudio}
                    onClick={() => void downloadEpisode(episode)}
                  >
                    <Download className="h-3 w-3" />
                    WAV
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-[#777785] hover:text-error"
                    onClick={() => void removeEpisode(episode)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
