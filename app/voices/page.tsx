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
    <div className="mx-auto max-w-[1000px] px-6 py-10 lg:px-9">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
            Voice catalogue
          </span>
        </div>
        <h1 className="text-balance font-display text-[32px] leading-[1.12] text-foreground sm:text-[40px]">
          Voice studio
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Every voice below comes from Sarvam Bulbul&apos;s official catalogue. Preview a real
          generated sample before casting it in an episode.
        </p>
      </header>

      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {LANGUAGES.map((option) => (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguageCode(option.code)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors duration-150",
              languageCode === option.code
                ? "border-ring bg-primary/10 text-foreground"
                : "border-input bg-secondary text-muted-foreground hover:border-ring hover:text-foreground",
            )}
          >
            {option.label}
            <span className="text-[10px] text-muted-foreground">{option.native}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-input bg-secondary px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-card text-primary">
            <Mic2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {language.label} · {voices.length} curated voice{voices.length === 1 ? "" : "s"}
            </p>
            <p className="text-[11px] text-muted-foreground">
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

      <div className="mt-6">
        {voices.length === 0 ? (
          <EmptyState
            icon={<AudioLines className="h-5 w-5" />}
            title="No voices in this filter"
            description="This language catalogue has no voices in the selected category yet. Switch to All."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {voices.map((voice) => (
              <article
                key={voice.id}
                className="flex flex-col rounded-xl border border-input bg-card shadow hover:shadow-sm transition-colors duration-150"
              >
                <div className="flex items-start justify-between p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20">
                      {voice.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{voice.name}</p>
                      <p className="text-[11px] capitalize text-muted-foreground">
                        {voice.gender} · {voice.style}
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral" size="sm">{language.code}</Badge>
                </div>

                <div className="border-t border-accent px-5 py-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
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

                <div className="border-t border-accent px-5 pt-3 pb-4">
                  <code className="block truncate rounded-md border border-input bg-secondary px-2.5 py-2 font-mono text-[10px] text-muted-foreground">
                    {voice.id}
                  </code>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
        The v4 Flash catalogue publishes 222 persona voices across Hindi, English, English–Hindi,
        Bengali, Gujarati, Kannada, Marathi, Punjabi, Tamil and Telugu. Malayalam routes to Bulbul
        v3, which documents that language. Previews are generated live and consume Sarvam credits.
      </p>
    </div>
  );
}
