"use client";

import * as React from "react";
import { AudioLines, Mic2, Sparkles } from "lucide-react";
import { VoicePreviewButton } from "@/components/voice-preview-button";
import { Badge, EmptyState, Segmented } from "@/components/ui";
import { getLanguage, LANGUAGES } from "@/lib/voices";
import { cn } from "@/lib/utils";

type GenderFilter = "all" | "female" | "male";

export default function VoicesPage() {
  const [languageCode, setLanguageCode] = React.useState("en-IN");
  const [gender, setGender] = React.useState<GenderFilter>("all");
  const language = getLanguage(languageCode);
  const voices = language.voices.filter(
    (voice) => gender === "all" || voice.gender === gender,
  );

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 lg:px-9 lg:py-8">
      <header>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6F6F7D]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Voice catalogue
        </div>
        <h1 className="mt-2.5 font-display text-[36px] leading-none text-text-primary sm:text-[42px]">
          Voice studio
        </h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-text-secondary">
          Every voice below comes from Sarvam Bulbul&apos;s official catalogue. Preview a real
          generated sample before casting it in an episode.
        </p>
      </header>

      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {LANGUAGES.map((option) => (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguageCode(option.code)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11.5px] transition-colors",
              languageCode === option.code
                ? "border-[#4A4266] bg-[#241F33] text-text-primary"
                : "border-border bg-surface text-[#8B8B99] hover:border-[#414150] hover:text-text-primary",
            )}
          >
            {option.label}
            <span className="text-[10px] text-[#6B6B7A]">{option.native}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3A3450] bg-[#221D30] text-primary">
            <Mic2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[12px] font-medium text-text-primary">
              {language.label} · {voices.length} curated voice{voices.length === 1 ? "" : "s"}
            </p>
            <p className="text-[10px] text-[#777785]">
              Model {language.model} · official speaker IDs, never invented
            </p>
          </div>
        </div>
        <Segmented
          size="sm"
          className="w-[220px]"
          options={[
            { value: "all" as const, label: "All" },
            { value: "female" as const, label: "Female" },
            { value: "male" as const, label: "Male" },
          ]}
          value={gender}
          onChange={setGender}
        />
      </div>

      <div className="mt-4">
        {voices.length === 0 ? (
          <EmptyState
            icon={<AudioLines className="h-5 w-5" />}
            title="No voices in this filter"
            description="This language catalogue has no voices in the selected category yet. Switch to All."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {voices.map((voice) => (
              <article
                key={voice.id}
                className="flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-[#3E3E4A]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3A3450] bg-[#241F33] text-[11px] font-semibold text-primary">
                      {voice.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium text-text-primary">{voice.name}</p>
                      <p className="text-[10px] capitalize text-[#777785]">
                        {voice.gender} · {voice.style}
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral">{language.code}</Badge>
                </div>

                <code className="mt-3 block truncate rounded-md border border-[#2A2A34] bg-[#131318] px-2 py-1.5 font-mono text-[9.5px] text-[#8C8C9B]">
                  {voice.id}
                </code>

                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[9.5px] text-[#5E5E6B]">
                    <Sparkles className="h-2.5 w-2.5" />
                    Real Bulbul sample
                  </span>
                  <VoicePreviewButton
                    language={language.code}
                    voiceId={voice.id}
                    withLabel
                    label={`Preview ${voice.name}`}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-[10px] leading-relaxed text-[#5E5E6B]">
        The v4 Flash catalogue publishes 222 persona voices across Hindi, English, English–Hindi,
        Bengali, Gujarati, Kannada, Marathi, Punjabi, Tamil and Telugu. Malayalam routes to Bulbul
        v3, which documents that language. Previews are generated live and consume Sarvam credits.
      </p>
    </div>
  );
}
