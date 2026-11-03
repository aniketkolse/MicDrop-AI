"use client";

import * as React from "react";
import { ArrowLeft, Languages, RefreshCw, Sparkles } from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { AudioPanel } from "@/components/studio/audio-panel";
import { ScriptEditor } from "@/components/studio/script-editor";
import { Badge, Button, Select } from "@/components/ui";
import { getLanguage, LANGUAGES, STYLES } from "@/lib/voices";

const AVATAR_TONES = [
  "border-[#4B3D6E] bg-[#2A223C] text-[#C4B5FD]",
  "border-[#2E5560] bg-[#172C31] text-[#7DD3E8]",
  "border-[#5A4526] bg-[#2C2314] text-[#E5B567]",
];

export function EpisodeWorkspace() {
  const {
    script,
    settings,
    resetStudio,
    regenerateScript,
    translateScript,
    busyScript,
    busyTranslation,
  } = useStudio();
  const [target, setTarget] = React.useState("");

  if (!script) return null;
  const language = getLanguage(script.language);
  const styleLabel = STYLES.find((style) => style.id === settings.style)?.label ?? settings.style;
  const translationTargets = LANGUAGES.filter((option) => option.code !== script.language);

  const confirmNew = () => {
    if (window.confirm("Start a new episode? The current episode stays in My Episodes.")) {
      resetStudio();
    }
  };

  const confirmRewrite = () => {
    if (
      window.confirm(
        "Rewrite the whole script with Sarvam-105B? Manual edits will be replaced. The episode stays in your library.",
      )
    ) {
      void regenerateScript();
    }
  };

  return (
    <div id="episode-workspace" className="animate-fade-up">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button size="sm" variant="ghost" onClick={confirmNew}>
          <ArrowLeft className="h-3.5 w-3.5" />
          New episode
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Select
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="h-8 w-[168px] text-[11.5px]"
              aria-label="Translate script to"
            >
              <option value="">Translate to…</option>
              {translationTargets.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} — {option.native}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="secondary"
              loading={busyTranslation}
              disabled={!target}
              onClick={() => target && void translateScript(target)}
            >
              <Languages className="h-3.5 w-3.5" />
              Translate
            </Button>
          </div>
          <Button size="sm" variant="secondary" loading={busyScript} onClick={confirmRewrite}>
            <RefreshCw className="h-3.5 w-3.5" />
            Rewrite script
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface px-5 py-5 lg:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="primary">
            <Sparkles className="h-2.5 w-2.5" />
            AI-generated script
          </Badge>
          <Badge tone="neutral">{language.label}</Badge>
          <Badge tone="neutral">{settings.duration} min</Badge>
          <Badge tone="neutral">{styleLabel}</Badge>
          <Badge tone="neutral">{script.speakers.length} speakers</Badge>
          <Badge tone="warning">No live web research</Badge>
        </div>

        <h1 className="mt-3 max-w-3xl font-display text-[32px] leading-[1.12] text-text-primary sm:text-[40px]">
          {script.title}
        </h1>
        <p className="mt-2.5 max-w-2xl text-[12.5px] leading-relaxed text-text-secondary">
          {script.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {script.speakers.map((speaker, index) => (
            <div key={speaker.id} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold ${AVATAR_TONES[index % AVATAR_TONES.length]}`}
              >
                {speaker.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="text-[11.5px] font-medium text-text-primary">{speaker.name}</p>
                <p className="text-[10px] text-[#777785]">{speaker.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[#4A3B20] bg-[#211D14] px-3.5 py-2.5">
          <p className="text-[10.5px] leading-relaxed text-[#D6B77A]">
            <span className="font-medium">Research disclosure:</span> {script.researchNote}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ScriptEditor />
        <AudioPanel />
      </div>
    </div>
  );
}
