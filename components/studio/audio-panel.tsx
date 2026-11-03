"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Download,
  Loader2,
  Music2,
  Play,
  RefreshCw,
  Sparkles,
  Square,
  Upload,
  Volume2,
  XCircle,
} from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { VoicePreviewButton } from "@/components/voice-preview-button";
import { Badge, Button, Label, Select, Slider, Switch } from "@/components/ui";
import { readableBytes } from "@/lib/audio-export";
import { getLanguage } from "@/lib/voices";
import { cn, formatTime } from "@/lib/utils";

export function AudioPanel() {
  const {
    script,
    settings,
    generation,
    audioUrl,
    audioBlob,
    musicFile,
    setMusicFile,
    updateSettings,
    setSpeakerVoice,
    generateAudio,
    cancelGeneration,
    regenerateSegmentAudio,
    notify,
  } = useStudio();
  const [musicPreviewing, setMusicPreviewing] = React.useState(false);
  const musicAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const musicUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      musicAudioRef.current?.pause();
      if (musicUrlRef.current) URL.revokeObjectURL(musicUrlRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!musicFile) {
      musicAudioRef.current?.pause();
      setMusicPreviewing(false);
      if (musicUrlRef.current) {
        URL.revokeObjectURL(musicUrlRef.current);
        musicUrlRef.current = null;
      }
    }
  }, [musicFile]);

  if (!script) return null;

  const language = getLanguage(script.language);
  const done = generation.segments.filter((segment) => segment.status === "done").length;
  const failed = generation.segments.filter((segment) => segment.status === "failed");
  const percent =
    generation.total > 0
      ? Math.round((done / generation.total) * 100)
      : generation.phase === "done"
        ? 100
        : 0;

  const toggleMusicPreview = () => {
    if (!musicFile) return;
    if (musicPreviewing) {
      musicAudioRef.current?.pause();
      setMusicPreviewing(false);
      return;
    }
    if (!musicUrlRef.current) {
      musicUrlRef.current = URL.createObjectURL(musicFile);
    }
    const audio = musicAudioRef.current ?? new Audio();
    musicAudioRef.current = audio;
    audio.src = musicUrlRef.current;
    audio.volume = Math.min(1, settings.musicVolume * 2.4);
    audio.onended = () => setMusicPreviewing(false);
    void audio
      .play()
      .then(() => setMusicPreviewing(true))
      .catch(() => notify("error", "Could not preview that audio file."));
  };

  return (
    <section className="rounded-xl border border-input bg-card shadow xl:sticky xl:top-6 xl:self-start">
      <div className="flex items-center justify-between border-b border-accent px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            4
          </span>
          <h2 className="text-sm font-semibold text-foreground">Voice production</h2>
        </div>
        <Badge tone="primary" size="sm">{language.model}</Badge>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-lg border border-input bg-secondary p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
            Casting
          </span>
          <div className="mt-2.5 space-y-2">
            {script.speakers.map((speaker, index) => {
              const selected = speaker.voiceId ?? settings.voiceIds[index] ?? language.voices[0]?.id;
              return (
                <div key={speaker.id} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 truncate text-[10.5px] text-muted-foreground">
                    {speaker.name}
                  </span>
                  <Select
                    value={selected}
                    onChange={(event) => setSpeakerVoice(index, event.target.value)}
                    className="h-8 flex-1 text-[11px]"
                  >
                    {language.voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} · {voice.style}
                      </option>
                    ))}
                  </Select>
                  <VoicePreviewButton language={script.language} voiceId={selected} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Background music */}
        <div className="rounded-lg border border-input bg-secondary p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
              <Music2 className="h-3 w-3" /> Background music
            </span>
            <Switch
              checked={settings.musicEnabled && Boolean(musicFile)}
              onChange={(checked) => {
                if (!checked) {
                  updateSettings({ musicEnabled: false });
                } else if (musicFile) {
                  updateSettings({ musicEnabled: true });
                } else {
                  notify("info", "Upload a music file first.");
                }
              }}
              label="Enable background music"
            />
          </div>

          {musicFile ? (
            <>
              <div className="mt-2.5 flex items-center gap-2 rounded-md border border-input bg-accent px-2.5 py-2">
                <Music2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-[10.5px] text-muted-foreground">
                  {musicFile.name}
                </span>
                <button
                  type="button"
                  onClick={toggleMusicPreview}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary"
                  aria-label="Preview music"
                >
                  {musicPreviewing ? (
                    <Square className="h-2.5 w-2.5 fill-current" />
                  ) : (
                    <Play className="h-2.5 w-2.5 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMusicFile(null)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                  aria-label="Remove music"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2.5">
                <Label hint={`${Math.round(settings.musicVolume * 100)}%`}>Music bed level</Label>
                <Slider
                  min={0}
                  max={0.6}
                  step={0.01}
                  value={settings.musicVolume}
                  onChange={(event) => updateSettings({ musicVolume: Number(event.target.value) })}
                />
              </div>
            </>
          ) : (
            <label className="mt-2.5 flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-input py-2 text-[10.5px] text-muted-foreground hover:border-ring hover:text-primary">
              <Upload className="h-3 w-3" />
              Upload MP3 / WAV (20 MB)
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setMusicFile(file);
                  event.target.value = "";
                }}
              />
            </label>
          )}
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            Mixed in your browser with Web Audio. Use music you have rights to.
          </p>
        </div>

        {generation.total > 0 ? (
          <div className="rounded-lg border border-input bg-secondary p-3">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="text-muted-foreground">
                {generation.phase === "done"
                  ? "Render complete"
                  : generation.phase === "mixing"
                    ? "Mixing music bed…"
                    : generation.phase === "encoding"
                      ? "Encoding WAV…"
                      : generation.running
                        ? `Rendering ${Math.min(done + 1, generation.total)} of ${generation.total}`
                        : "Render paused"}
              </span>
              <span className="tabular-nums text-muted-foreground">{percent}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-accent/40">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300",
                  generation.phase === "error" ? "bg-destructive" : "bg-primary",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="mt-2.5 max-h-40 space-y-1 overflow-y-auto pr-1">
              {generation.segments.map((segment, index) => {
                const data = script.segments[segment.index];
                if (!data) return null;
                return (
                  <div
                    key={segment.segmentId}
                    className="flex items-center gap-2 rounded px-1 py-0.5 text-[10px]"
                  >
                    {segment.status === "done" ? (
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                    ) : segment.status === "generating" ? (
                      <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
                    ) : segment.status === "failed" ? (
                      <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />
                    ) : (
                      <Circle className="h-2.5 w-2.5 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className="w-4 shrink-0 tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{data.heading}</span>
                    {segment.status === "failed" ? (
                      <button
                        type="button"
                        onClick={() => void regenerateSegmentAudio(index)}
                        className="shrink-0 text-destructive hover:underline"
                      >
                        Retry
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={generation.running}
                        onClick={() => void regenerateSegmentAudio(index)}
                        title="Re-render this turn"
                        aria-label={`Re-render ${data.heading}`}
                        className="shrink-0 text-muted-foreground transition-colors duration-150 hover:text-primary disabled:opacity-30"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {generation.error ? (
              <p className="mt-2 rounded border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-[10px] leading-relaxed text-destructive">
                {generation.error}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={generation.running}
            onClick={() => void (generation.running ? cancelGeneration() : generateAudio())}
          >
            {generation.running ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop rendering
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {audioUrl ? "Regenerate audio" : "Generate audio"}
              </>
            )}
          </Button>
          <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
            Bulbul renders each turn separately. Completed turns are cached, so a retry only
            re-renders what failed.
          </p>
        </div>

        {audioUrl && audioBlob ? (
          <div className="rounded-lg border border-green-500/30 bg-green-50/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Episode audio ready
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-green-500">
              <span>{formatTime(script.duration)} planned</span>
              <span>{readableBytes(audioBlob.size)} WAV</span>
            </div>
            <a
              href={audioUrl}
              download={`${script.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.wav`}
              className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-green-500/50 bg-green-50/60 text-[11px] font-medium text-green-600 hover:bg-green-100/60"
            >
              <Download className="h-3 w-3" />
              Download WAV
            </a>
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-lg border border-input bg-secondary px-3 py-2">
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] leading-snug text-muted-foreground">
            {done > 0
              ? `${done} of ${generation.total} turns rendered · ${failed.length} failed`
              : "Every button performs a real Sarvam request."}
          </span>
        </div>
      </div>
    </section>
  );
}
