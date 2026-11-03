"use client";

import * as React from "react";
import { produceEpisodeAudio, type AudioProgress } from "@/lib/audio-processor";
import { deleteEpisodeAudio, saveEpisode, listEpisodes, getEpisode, getEpisodeAudio } from "@/lib/db";
import { defaultVoiceIds, getLanguage } from "@/lib/voices";
import { nanoid } from "@/lib/utils";
import type {
  Audience,
  EpisodeMeta,
  GenerationState,
  LanguageCode,
  PodcastScript,
  PodcastSettings,
  PodcastStyle,
  ScriptSegment,
  SegmentProgress,
  SourceType,
} from "@/types/podcast";

type SupabaseUser = { id: string; email?: string } | null;

const DEFAULT_SETTINGS: PodcastSettings = {
  sourceType: "topic",
  topic: "",
  sourceText: "",
  duration: 5,
  language: "en-IN",
  speakerCount: 2,
  style: "casual",
  audience: "general",
  depth: "standard",
  pace: 1,
  voiceIds: defaultVoiceIds("en-IN", 2),
  musicEnabled: false,
  musicVolume: 0.16,
};

const EMPTY_GENERATION: GenerationState = {
  running: false,
  segments: [],
  current: 0,
  total: 0,
  phase: "idle",
};

type Notice = { type: "success" | "error" | "info"; message: string } | null;

interface StudioContextValue {
  settings: PodcastSettings;
  script: PodcastScript | null;
  episodeId: string | null;
  createdAt: number | null;
  audioUrl: string | null;
  audioBlob: Blob | null;
  musicFile: File | null;
  generation: GenerationState;
  busyScript: boolean;
  busyTranslation: boolean;
  notice: Notice;
  player: {
    playing: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    rate: number;
  };
  user: SupabaseUser | null;
  isAuthenticated: boolean;
  supabaseReady: boolean;
  setAuthState: (user: SupabaseUser | null, isAuthenticated: boolean) => void;
  updateSettings: (patch: Partial<PodcastSettings>) => void;
  setSourceText: (text: string, fileName?: string) => void;
  createScript: () => Promise<void>;
  regenerateScript: () => Promise<void>;
  updateScript: (script: PodcastScript) => void;
  setSpeakerVoice: (index: number, voiceId: string) => void;
  updateSegment: (id: string, patch: Partial<ScriptSegment>) => void;
  addSegment: () => void;
  removeSegment: (id: string) => void;
  regenerateSegmentText: (id: string) => Promise<void>;
  translateScript: (targetLanguage: string) => Promise<void>;
  generateAudio: () => Promise<void>;
  regenerateSegmentAudio: (index: number) => Promise<void>;
  cancelGeneration: () => void;
  setMusicFile: (file: File | null) => void;
  loadEpisode: (meta: EpisodeMeta, audio: Blob | null) => void;
  loadEpisodeFromSupabase: (podcastId: string) => Promise<{ script: PodcastScript; settings: PodcastSettings } | null>;
  resetStudio: () => void;
  notify: (type: "success" | "error" | "info", message: string) => void;
  dismissNotice: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
}

const StudioContext = React.createContext<StudioContextValue | null>(null);

function initialGeneration(script: PodcastScript): GenerationState {
  return {
    running: false,
    segments: script.segments.map<SegmentProgress>((segment) => ({
      index: script.segments.findIndex((s) => s.id === segment.id),
      segmentId: segment.id,
      status: "pending",
    })),
    current: 0,
    total: script.segments.length,
    phase: "idle",
  };
}

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<PodcastSettings>(DEFAULT_SETTINGS);
  const [script, setScript] = React.useState<PodcastScript | null>(null);
  const [episodeId, setEpisodeId] = React.useState<string | null>(null);
  const [createdAt, setCreatedAt] = React.useState<number | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [musicFile, setMusicFileState] = React.useState<File | null>(null);
  const [generation, setGeneration] = React.useState<GenerationState>(EMPTY_GENERATION);
  const [busyScript, setBusyScript] = React.useState(false);
  const [busyTranslation, setBusyTranslation] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice>(null);
  const [user, setUser] = React.useState<SupabaseUser>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [supabaseReady, setSupabaseReady] = React.useState(false);
  const [playerState, setPlayerState] = React.useState({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    rate: 1,
  });

  const cacheRef = React.useRef(new Map<number, AudioBuffer[]>());
  const abortRef = React.useRef<AbortController | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = React.useRef<string | null>(null);
  const noticeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const scriptRef = React.useRef<PodcastScript | null>(null);
  const settingsRef = React.useRef(settings);

  React.useEffect(() => {
    scriptRef.current = script;
  }, [script]);
  React.useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Initialize Supabase auth state on mount
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({ id: data.user.id, email: data.user.email });
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Supabase not configured or session unavailable — continue in local-only mode
      } finally {
        if (!cancelled) setSupabaseReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const notify = React.useCallback((type: "success" | "error" | "info", message: string) => {
    setNotice({ type, message });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 6000);
  }, []);

  const dismissNotice = React.useCallback(() => setNotice(null), []);

  // --- Supabase sync (authenticated users) ---

  async function supabaseFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    return fetch(path, { ...options, headers });
  }

  async function createSupabasePodcast(script: PodcastScript, settings: PodcastSettings): Promise<string | null> {
    if (!isAuthenticated || !user) return null;
    try {
      const res = await supabaseFetch("/api/podcasts", {
        method: "POST",
        body: JSON.stringify({
          title: script.title,
          description: script.description,
          language: script.language,
          status: "script_ready",
          script,
          original_prompt: settings.sourceText?.slice(0, 2000) ?? settings.topic,
          source_type: settings.sourceType,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.podcast?.id ?? null;
    } catch {
      return null;
    }
  }

  async function syncSpeakersToSupabase(podcastId: string, script: PodcastScript): Promise<void> {
    if (!isAuthenticated || !user) return;
    try {
      // Delete existing speakers and re-create
      const existingRes = await supabaseFetch(`/api/podcasts/${podcastId}/speakers`);
      if (existingRes.ok) {
        const existing = await existingRes.json();
        for (const s of existing.speakers ?? []) {
          await supabaseFetch(`/api/podcasts/${podcastId}/speakers/${s.id}`, { method: "DELETE" });
        }
      }
      for (const speaker of script.speakers) {
        await supabaseFetch(`/api/podcasts/${podcastId}/speakers`, {
          method: "POST",
          body: JSON.stringify({
            speaker_name: speaker.name,
            speaker_role: speaker.role,
            voice_id: speaker.voiceId,
            language: script.language,
            speaking_rate: settings.pace,
          }),
        });
      }
    } catch {
      // Non-fatal: speakers sync failure shouldn't block the workflow
    }
  }

  async function syncSegmentsToSupabase(podcastId: string, script: PodcastScript): Promise<void> {
    if (!isAuthenticated || !user) return;
    try {
      const existingRes = await supabaseFetch(`/api/podcasts/${podcastId}/segments`);
      if (existingRes.ok) {
        const existing = await existingRes.json();
        for (const s of existing.segments ?? []) {
          await supabaseFetch(`/api/podcasts/${podcastId}/segments/${s.id}`, { method: "DELETE" });
        }
      }
      for (const [index, segment] of script.segments.entries()) {
        const speakerRecord = script.speakers.find((s) => s.id === segment.speaker);
        await supabaseFetch(`/api/podcasts/${podcastId}/segments`, {
          method: "POST",
          body: JSON.stringify({
            speaker_id: speakerRecord?.id ?? undefined,
            sequence_number: index + 1,
            heading: segment.heading,
            dialogue: segment.text,
            status: "pending",
          }),
        });
      }
    } catch {
      // Non-fatal
    }
  }

  async function updateSupabasePodcast(podcastId: string, updates: {
    title?: string;
    description?: string;
    script?: PodcastScript;
    status?: string;
    audio_path?: string;
  }): Promise<void> {
    if (!isAuthenticated || !user) return;
    try {
      await supabaseFetch(`/api/podcasts/${podcastId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    } catch {
      // Non-fatal
    }
  }

  async function loadFromSupabase(podcastId: string): Promise<{
    script: PodcastScript;
    settings: PodcastSettings;
  } | null> {
    if (!isAuthenticated || !user) return null;
    try {
      const res = await supabaseFetch(`/api/podcasts/${podcastId}`);
      if (!res.ok) return null;
      const data = await res.json();
      const podcast = data.podcast;
      if (!podcast) return null;

      const script: PodcastScript = {
        title: podcast.title,
        description: podcast.description,
        duration: podcast.duration_seconds ?? 300,
        language: podcast.language as PodcastScript["language"],
        speakers: (podcast.podcast_speakers as any[] | []).map((s: any) => ({
          id: s.id,
          name: s.speaker_name,
          role: s.speaker_role,
          voiceId: s.voice_id,
        })),
        segments: (podcast.podcast_segments as any[] | [])
          .sort((a: any, b: any) => a.sequence_number - b.sequence_number)
          .map((s: any) => {
            const speakerRecord = script.speakers.find((sp) => sp.id === s.speaker_id);
            return {
              id: s.id,
              heading: s.heading,
              speaker: speakerRecord?.id ?? speakerRecord?.name ?? "host1",
              text: s.dialogue,
            };
          }),
        researchNote: "Synced from Supabase.",
      };

      const settings: PodcastSettings = {
        sourceType: (podcast.source_type as SourceType) ?? "topic",
        topic: podcast.original_prompt ?? script.title,
        sourceText: podcast.original_prompt ?? "",
        duration: (((podcast.duration_seconds ?? 300) / 60) as unknown as 2 | 5 | 10 | 15),
        language: podcast.language as LanguageCode,
        speakerCount: script.speakers.length as unknown as 1 | 2 | 3,
        style: (podcast.conversation_style as PodcastStyle) ?? "casual",
        audience: (podcast.target_audience as Audience) ?? "general",
        depth: "standard",
        pace: 1,
        voiceIds: script.speakers.map((s) => s.voiceId ?? ""),
        musicEnabled: false,
        musicVolume: 0.16,
      };

      return { script, settings };
    } catch {
      return null;
    }
  }

  // One persistent audio element for the bottom player.
  React.useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    const syncTime = () =>
      setPlayerState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    const syncMeta = () =>
      setPlayerState((prev) => ({
        ...prev,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      }));
    const onEnd = () => setPlayerState((prev) => ({ ...prev, playing: false }));
    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncMeta);
    audio.addEventListener("durationchange", syncMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncMeta);
      audio.removeEventListener("durationchange", syncMeta);
      audio.removeEventListener("ended", onEnd);
      audio.src = "";
      audioRef.current = null;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const setAudio = React.useCallback((blob: Blob | null) => {
    const audio = audioRef.current;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (!blob) {
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setPlayerState((prev) => ({
        ...prev,
        playing: false,
        currentTime: 0,
        duration: 0,
      }));
      return;
    }
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setAudioBlob(blob);
    setAudioUrl(url);
    setPlayerState((prev) => ({ ...prev, playing: false, currentTime: 0, duration: 0 }));
    if (audio) {
      audio.src = url;
      audio.volume = playerState.volume;
      audio.playbackRate = playerState.rate;
      audio.load();
    }
  }, [playerState.volume, playerState.rate]);

  const updateSettings = React.useCallback((patch: Partial<PodcastSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.language && patch.language !== prev.language) {
        next.voiceIds = defaultVoiceIds(patch.language, prev.speakerCount);
      }
      if (patch.speakerCount && patch.speakerCount !== prev.speakerCount) {
        const base = defaultVoiceIds(next.language, patch.speakerCount);
        next.voiceIds = Array.from(
          { length: patch.speakerCount },
          (_, index) => prev.voiceIds[index] ?? base[index],
        );
      }
      return next;
    });
  }, []);

  const setSourceText = React.useCallback((text: string, fileName?: string) => {
    setSettings((prev) => ({ ...prev, sourceText: text, fileName }));
  }, []);

  const persist = React.useCallback(
    async (currentScript: PodcastScript, blob: Blob | null, clearAudio = false) => {
      if (!episodeId) return;
      const currentSettings = settingsRef.current;
      const meta: EpisodeMeta = {
        id: episodeId,
        title: currentScript.title,
        description: currentScript.description,
        createdAt: createdAt ?? Date.now(),
        duration: currentScript.duration,
        language: currentScript.language,
        speakerNames: currentScript.speakers.map((speaker) => speaker.name),
        style: currentSettings.style,
        script: currentScript,
        settings: currentSettings,
        hasAudio: Boolean(blob),
      };
      try {
        if (clearAudio) await deleteEpisodeAudio(episodeId);
        await saveEpisode(meta, blob ?? undefined);
      } catch {
        // Storage failures should not break generation; surface gently.
        notify("info", "Episode generated but could not be saved to the local library.");
      }

      // Sync to Supabase when authenticated
      if (isAuthenticated && user) {
        try {
          const res = await supabaseFetch("/api/podcasts", {
            method: "POST",
            body: JSON.stringify({
              title: currentScript.title,
              description: currentScript.description,
              language: currentScript.language,
              status: blob ? "completed" : "script_ready",
              script: currentScript,
              original_prompt: currentSettings.sourceText?.slice(0, 2000) ?? currentSettings.topic,
              source_type: currentSettings.sourceType,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const supabasePodcastId = data.podcast?.id;
            if (supabasePodcastId) {
              // Sync speakers and segments
              await syncSpeakersToSupabase(supabasePodcastId, currentScript);
              await syncSegmentsToSupabase(supabasePodcastId, currentScript);
              // Update episodeId to Supabase ID for future syncs
              setEpisodeId(supabasePodcastId);
            }
          }
        } catch {
          // Non-fatal: Supabase sync failure shouldn't block local workflow
        }
      }
    },
    [createdAt, episodeId, isAuthenticated, user, notify, supabaseFetch],
  );

  const createScript = React.useCallback(async () => {
    if (busyScript) return;
    const current = settingsRef.current;
    if (current.sourceType === "topic" && current.topic.trim().length < 3) {
      notify("error", "Add a topic before generating a script.");
      return;
    }
    if (current.sourceType !== "topic" && current.sourceText.trim().length < 20) {
      notify("error", "Add or upload enough source material first.");
      return;
    }

    setBusyScript(true);
    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...current,
          topic: current.topic.trim(),
          sourceText: current.sourceText.trim(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { script?: PodcastScript; error?: string }
        | null;
      if (!response.ok || !payload?.script) {
        throw new Error(payload?.error || "Script generation failed.");
      }

      const generated = payload.script;
      generated.speakers = generated.speakers.map((speaker, index) => ({
        ...speaker,
        voiceId: current.voiceIds[index] ?? current.voiceIds[0],
      }));

      const nextEpisodeId = episodeId ?? nanoid(12);
      const nextCreatedAt = createdAt ?? Date.now();
      setScript(generated);
      setEpisodeId(nextEpisodeId);
      setCreatedAt(nextCreatedAt);
      setGeneration(initialGeneration(generated));
      cacheRef.current.clear();
      setAudio(null);

      const meta: EpisodeMeta = {
        id: nextEpisodeId,
        title: generated.title,
        description: generated.description,
        createdAt: nextCreatedAt,
        duration: generated.duration,
        language: generated.language,
        speakerNames: generated.speakers.map((speaker) => speaker.name),
        style: current.style,
        script: generated,
        settings: current,
        hasAudio: false,
      };
      try {
        if (episodeId) await deleteEpisodeAudio(episodeId);
        await saveEpisode(meta);
      } catch {
        notify("info", "Script generated, but the local library is unavailable.");
      }

      notify("success", "Script ready. Review and edit the dialogue before generating audio.");

      // Sync to Supabase when authenticated
      if (isAuthenticated && user && episodeId) {
        try {
          const res = await supabaseFetch("/api/podcasts", {
            method: "POST",
            body: JSON.stringify({
              title: generated.title,
              description: generated.description,
              language: generated.language,
              status: "script_ready",
              script: generated,
              original_prompt: current.sourceText?.slice(0, 2000) ?? current.topic,
              source_type: current.sourceType,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const supabasePodcastId = data.podcast?.id;
            if (supabasePodcastId) {
              await syncSpeakersToSupabase(supabasePodcastId, generated);
              await syncSegmentsToSupabase(supabasePodcastId, generated);
              setEpisodeId(supabasePodcastId);
            }
          }
        } catch {
          // Non-fatal
        }
      }

      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          document.getElementById("episode-workspace")?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Script generation failed.");
    } finally {
      setBusyScript(false);
    }
  }, [busyScript, createdAt, episodeId, isAuthenticated, user, notify, setAudio, supabaseFetch]);

  const regenerateScript = React.useCallback(async () => {
    if (!scriptRef.current) return;
    await createScript();
  }, [createScript]);

  const updateScript = React.useCallback((next: PodcastScript) => {
    setScript(next);
    void persist(next, audioBlob, false);
  }, [audioBlob, persist]);

  const setSpeakerVoice = React.useCallback(
    (index: number, voiceId: string) => {
      setScript((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          speakers: prev.speakers.map((speaker, speakerIndex) =>
            speakerIndex === index ? { ...speaker, voiceId } : speaker,
          ),
        };
        void persist(next, null, true);
        return next;
      });
      setSettings((prev) => {
        const voiceIds = [...prev.voiceIds];
        voiceIds[index] = voiceId;
        return { ...prev, voiceIds };
      });
      cacheRef.current.clear();
      setAudio(null);
    },
    [persist, setAudio],
  );

  const updateSegment = React.useCallback(
    (id: string, patch: Partial<ScriptSegment>) => {
      setScript((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          segments: prev.segments.map((segment) =>
            segment.id === id ? { ...segment, ...patch } : segment,
          ),
        };
        void persist(next, null, true);
        return next;
      });
      cacheRef.current.clear();
      setAudio(null);
    },
    [persist, setAudio],
  );

  const addSegment = React.useCallback(() => {
    setScript((prev) => {
      if (!prev) return prev;
      const index = prev.segments.length;
      const next: PodcastScript = {
        ...prev,
        segments: [
          ...prev.segments,
          {
            id: `segment-${Date.now()}`,
            heading: "New segment",
            speaker: prev.speakers[index % prev.speakers.length].id,
            text: "",
          },
        ],
      };
      void persist(next, null, true);
      return next;
    });
    cacheRef.current.clear();
    setAudio(null);
  }, [persist, setAudio]);

  const removeSegment = React.useCallback(
    (id: string) => {
      setScript((prev) => {
        if (!prev || prev.segments.length <= 1) return prev;
        const next = { ...prev, segments: prev.segments.filter((s) => s.id !== id) };
        void persist(next, null, true);
        return next;
      });
      cacheRef.current.clear();
      setAudio(null);
    },
    [persist, setAudio],
  );

  const regenerateSegmentText = React.useCallback(
    async (id: string) => {
      const currentScript = scriptRef.current;
      if (!currentScript) return;
      try {
        const response = await fetch("/api/regenerate-segment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script: currentScript,
            segmentId: id,
            style: settingsRef.current.style,
            audience: settingsRef.current.audience,
            depth: settingsRef.current.depth,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | { segment?: Pick<ScriptSegment, "heading" | "text" | "speaker">; error?: string }
          | null;
        if (!response.ok || !payload?.segment) {
          throw new Error(payload?.error || "Could not rewrite this segment.");
        }
        setScript((prev) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            segments: prev.segments.map((segment) =>
              segment.id === id
                ? {
                    ...segment,
                    heading: payload.segment?.heading || segment.heading,
                    text: payload.segment?.text || segment.text,
                    speaker: prev.speakers.some((s) => s.id === payload.segment?.speaker)
                      ? (payload.segment?.speaker as string)
                      : segment.speaker,
                  }
                : segment,
            ),
          };
          void persist(next, null, true);
          return next;
        });
        cacheRef.current.clear();
        setAudio(null);
        notify("success", "Segment rewritten by Sarvam-105B.");
      } catch (error) {
        notify("error", error instanceof Error ? error.message : "Segment rewrite failed.");
      }
    },
    [notify, persist, setAudio],
  );

  const translateScript = React.useCallback(
    async (targetLanguage: string) => {
      const currentScript = scriptRef.current;
      if (!currentScript || busyTranslation) return;
      if (targetLanguage === currentScript.language) {
        notify("info", "The script is already in that language.");
        return;
      }
      setBusyTranslation(true);
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            segments: currentScript.segments.map((s) => ({ id: s.id, text: s.text })),
            sourceLanguage: currentScript.language,
            targetLanguage,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | { segments?: { id: string; text: string }[]; error?: string }
          | null;
        if (!response.ok || !payload?.segments) {
          throw new Error(payload?.error || "Translation failed.");
        }
        const translationMap = new Map(payload.segments.map((s) => [s.id, s.text]));
        const nextVoices = defaultVoiceIds(targetLanguage, currentScript.speakers.length);
        const nextScript: PodcastScript = {
          ...currentScript,
          language: targetLanguage as PodcastScript["language"],
          speakers: currentScript.speakers.map((speaker, index) => ({
            ...speaker,
            voiceId: nextVoices[index] ?? nextVoices[0],
          })),
          segments: currentScript.segments.map((segment) => ({
            ...segment,
            text: translationMap.get(segment.id) ?? segment.text,
          })),
        };
        setScript(nextScript);
        setSettings((prev) => ({
          ...prev,
          language: targetLanguage as PodcastSettings["language"],
          voiceIds: nextVoices,
        }));
        cacheRef.current.clear();
        setAudio(null);
        await persist(nextScript, null, true);
        notify("success", `Script translated to ${getLanguage(targetLanguage).label}. Voices reset for that language.`);
      } catch (error) {
        notify("error", error instanceof Error ? error.message : "Translation failed.");
      } finally {
        setBusyTranslation(false);
      }
    },
    [busyTranslation, notify, persist, setAudio],
  );

  const runAudioGeneration = React.useCallback(
    async (mode: "full" | "retry" | "segment", segmentIndex?: number) => {
      const currentScript = scriptRef.current;
      if (!currentScript || generation.running) return;
      if (mode === "full") cacheRef.current.clear();
      if (mode === "segment" && segmentIndex !== undefined) {
        cacheRef.current.delete(segmentIndex);
      }

      const abortController = new AbortController();
      abortRef.current = abortController;

      setGeneration({
        running: true,
        segments: currentScript.segments.map((segment, index) => ({
          index,
          segmentId: segment.id,
          status: cacheRef.current.has(index) ? "done" : "pending",
        })),
        current: cacheRef.current.size,
        total: currentScript.segments.length,
        phase: "voices",
      });

      try {
        const blob = await produceEpisodeAudio({
          script: currentScript,
          settings: settingsRef.current,
          musicFile: settingsRef.current.musicEnabled ? musicFile : null,
          cache: cacheRef.current,
          signal: abortController.signal,
          onProgress: (event: AudioProgress) => {
            if (event.type === "segment") {
              setGeneration((prev) => {
                const segments = prev.segments.map((segment) =>
                  segment.index === event.index
                    ? { ...segment, status: event.status, error: event.message }
                    : segment,
                );
                return {
                  ...prev,
                  segments,
                  current:
                    event.status === "done"
                      ? Math.max(prev.current, event.index + 1)
                      : prev.current,
                };
              });
            } else if (event.type === "phase") {
              setGeneration((prev) => ({ ...prev, phase: event.phase }));
            }
          },
        });

        setAudio(blob);
        setGeneration((prev) => ({
          ...prev,
          running: false,
          phase: "done",
          current: prev.total,
        }));
        await persist(currentScript, blob, false);
        notify("success", "Episode audio rendered. Press play to listen.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Audio generation failed.";
        setGeneration((prev) => ({ ...prev, running: false, phase: "error", error: message }));
        notify("error", message);
      } finally {
        abortRef.current = null;
      }
    },
    [generation.running, musicFile, notify, persist, setAudio],
  );

  const generateAudio = React.useCallback(async () => {
    await runAudioGeneration("full");
  }, [runAudioGeneration]);

  const regenerateSegmentAudio = React.useCallback(
    async (index: number) => {
      await runAudioGeneration("segment", index);
    },
    [runAudioGeneration],
  );

  const cancelGeneration = React.useCallback(() => {
    abortRef.current?.abort();
    setGeneration((prev) => ({ ...prev, running: false, phase: "error", error: "Cancelled." }));
  }, []);

  const setMusicFile = React.useCallback((file: File | null) => {
    if (file && file.size > 20 * 1024 * 1024) {
      notify("error", "Music file is larger than 20 MB.");
      return;
    }
    setMusicFileState(file);
    setSettings((prev) => ({ ...prev, musicEnabled: Boolean(file) }));
  }, [notify]);

  const loadEpisode = React.useCallback(
    (meta: EpisodeMeta, audio: Blob | null) => {
      abortRef.current?.abort();
      cacheRef.current.clear();
      setScript(meta.script);
      setSettings(meta.settings);
      setEpisodeId(meta.id);
      setCreatedAt(meta.createdAt);
      setGeneration(initialGeneration(meta.script));
      setMusicFileState(null);
      setAudio(audio);
    },
    [setAudio],
  );

  const loadEpisodeFromSupabase = React.useCallback(
    async (podcastId: string) => {
      if (!isAuthenticated || !user) return null;
      const data = await loadFromSupabase(podcastId);
      if (!data) return null;
      setScript(data.script);
      setSettings(data.settings);
      setEpisodeId(podcastId);
      setCreatedAt(Date.now());
      setGeneration(initialGeneration(data.script));
      setMusicFileState(null);
      setAudio(null);
      return data;
    },
    [isAuthenticated, user, loadFromSupabase, setAudio],
  );

  const resetStudio = React.useCallback(() => {
    abortRef.current?.abort();
    cacheRef.current.clear();
    setScript(null);
    setEpisodeId(null);
    setCreatedAt(null);
    setGeneration(EMPTY_GENERATION);
    setMusicFileState(null);
    setAudio(null);
    setSettings((prev) => ({
      ...prev,
      sourceType: "topic",
      topic: "",
      sourceText: "",
      fileName: undefined,
    }));
  }, [setAudio]);

  const play = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    void audio
      .play()
      .then(() => setPlayerState((prev) => ({ ...prev, playing: true })))
      .catch(() => notify("error", "Playback was blocked by the browser. Press play again."));
  }, [audioUrl, notify]);

  const pause = React.useCallback(() => {
    audioRef.current?.pause();
    setPlayerState((prev) => ({ ...prev, playing: false }));
  }, []);

  const togglePlay = React.useCallback(() => {
    if (playerState.playing) pause();
    else play();
  }, [pause, play, playerState.playing]);

  const seek = React.useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || seconds));
    setPlayerState((prev) => ({ ...prev, currentTime: audio.currentTime }));
  }, []);

  const setVolume = React.useCallback((volume: number) => {
    if (audioRef.current) audioRef.current.volume = volume;
    setPlayerState((prev) => ({ ...prev, volume }));
  }, []);

  const setRate = React.useCallback((rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    setPlayerState((prev) => ({ ...prev, rate }));
  }, []);

  const setAuthState = React.useCallback((user: SupabaseUser | null, isAuthenticated: boolean) => {
    setUser(user);
    setIsAuthenticated(isAuthenticated);
  }, []);

  const value: StudioContextValue = {
    settings,
    script,
    episodeId,
    createdAt,
    audioUrl,
    audioBlob,
    musicFile,
    generation,
    busyScript,
    busyTranslation,
    notice,
    player: playerState,
    user,
    isAuthenticated,
    supabaseReady,
    setAuthState,
    updateSettings,
    setSourceText,
    createScript,
    regenerateScript,
    updateScript,
    setSpeakerVoice,
    updateSegment,
    addSegment,
    removeSegment,
    regenerateSegmentText,
    translateScript,
    generateAudio,
    regenerateSegmentAudio,
    cancelGeneration,
    setMusicFile,
    loadEpisode,
    loadEpisodeFromSupabase,
    resetStudio,
    notify,
    dismissNotice,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setRate,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioContextValue {
  const context = React.useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside StudioProvider.");
  return context;
}
