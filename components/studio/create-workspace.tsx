"use client";

import * as React from "react";
import {
  ArrowRight,
  FileText,
  LibraryBig,
  Loader2,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import {
  Badge,
  Button,
  Label,
  Segmented,
  Select,
  Slider,
  Textarea,
  Input,
} from "@/components/ui";
import { VoicePreviewButton } from "@/components/voice-preview-button";
import { extractDocumentText, MAX_EXTRACTED_CHARS, type ExtractedDocument } from "@/lib/document-parser";
import { AUDIENCES, DEPTHS, getLanguage, LANGUAGES, STYLES } from "@/lib/voices";
import { cn } from "@/lib/utils";
import type { SourceType } from "@/types/podcast";

const SOURCE_TABS: { id: SourceType; label: string }[] = [
  { id: "topic", label: "Topic" },
  { id: "prompt", label: "Prompt" },
  { id: "document", label: "Document" },
  { id: "text", label: "Paste text" },
];

const TOPIC_IDEAS = [
  "Why AI voice is reshaping radio",
  "The hidden economics of attention",
  "India's next decade in space",
  "How music actually affects focus",
];

export function CreateWorkspace() {
  const { settings, updateSettings, setSourceText, createScript, busyScript, notify } = useStudio();
  const [extracting, setExtracting] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [documentInfo, setDocumentInfo] = React.useState<ExtractedDocument | null>(null);
  const [apiReady, setApiReady] = React.useState<boolean | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setApiReady(Boolean(data.configured)))
      .catch(() => setApiReady(false));
  }, []);

  const language = getLanguage(settings.language);
  const voices = language.voices;
  const selectedVoices = Array.from(
    { length: settings.speakerCount },
    (_, index) => settings.voiceIds[index] ?? voices[index % voices.length]?.id ?? voices[0]?.id,
  );

  const handleFile = React.useCallback(
    async (file: File) => {
      setExtracting(true);
      try {
        const extracted = await extractDocumentText(file);
        setDocumentInfo(extracted);
        updateSettings({ sourceType: "document" });
        setSourceText(extracted.text, extracted.fileName);
        notify(
          "success",
          `Extracted ${extracted.text.length.toLocaleString()} characters${extracted.pages ? ` from ${extracted.pages} pages` : ""}.`,
        );
      } catch (error) {
        notify("error", error instanceof Error ? error.message : "Could not read that document.");
      } finally {
        setExtracting(false);
      }
    },
    [notify, setSourceText, updateSettings],
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
      {/* Source material */}
      <section className="rounded-xl border border-input bg-card shadow">
        <div className="flex items-center justify-between border-b border-accent px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              1
            </span>
            <h2 className="text-sm font-semibold text-foreground">Source material</h2>
          </div>
          <Badge tone="neutral" size="sm">Step 1 of 3</Badge>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-4 gap-1 rounded-md border border-input bg-secondary p-[1px]">
            {SOURCE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateSettings({ sourceType: tab.id })}
                className={cn(
                  "flex h-7 items-center justify-center gap-1.5 rounded-md text-[11px] font-medium transition-colors duration-150",
                  settings.sourceType === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/50",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {settings.sourceType === "topic" && (
            <div className="space-y-3">
              <Label hint="3–500 characters">What is this episode about?</Label>
              <Input
                value={settings.topic}
                onChange={(event) => updateSettings({ topic: event.target.value })}
                placeholder="e.g. The quiet revolution in Indian language AI"
                maxLength={500}
                className="h-10 text-base"
              />
              <div className="flex flex-wrap gap-2">
                {TOPIC_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => updateSettings({ topic: idea })}
                    className="rounded-full border border-input bg-transparent px-3 py-1.5 text-[11px] text-muted-foreground transition-colors duration-150 hover:border-primary/50 hover:text-primary"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}

          {settings.sourceType === "prompt" && (
            <div className="space-y-3">
              <Label hint="Brief the showrunner. Up to 60,000 characters.">Write a detailed prompt</Label>
              <Textarea
                rows={9}
                value={settings.sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder="Explain the rise of Indic language models for a general audience. Focus on why voice matters, include a friendly debate about trade-offs, and end with practical implications for creators…"
                maxLength={MAX_EXTRACTED_CHARS}
                className="min-h-[200px]"
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {settings.sourceText.length.toLocaleString()} / 60,000
              </p>
            </div>
          )}

          {settings.sourceType === "document" && (
            <div className="space-y-3">
              <Label hint="PDF · DOCX · TXT · Max 10 MB. Parsed in your browser.">Upload a document</Label>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border px-5 py-10 text-center transition-colors duration-150",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-dashed border-input hover:border-ring hover:bg-accent/30",
                )}
              >
                {extracting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-foreground">Extracting text locally…</p>
                  </div>
                ) : documentInfo ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="mb-2 h-6 w-6 text-primary" />
                    <p className="max-w-full truncate text-sm font-medium text-foreground">
                      {documentInfo.fileName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {documentInfo.pages ? `${documentInfo.pages} pages · ` : ""}
                      {documentInfo.text.length.toLocaleString()} characters extracted
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Replace
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDocumentInfo(null);
                          setSourceText("", undefined);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Drop a file, or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Parsed in your browser. Nothing is uploaded until you generate.
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,text/plain"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </div>

              {documentInfo && (
                <div className="mt-4 space-y-2">
                  <Label hint={`${settings.sourceText.length.toLocaleString()} chars`}>
                    Review extracted text
                  </Label>
                  <Textarea
                    rows={8}
                    value={settings.sourceText}
                    onChange={(event) => setSourceText(event.target.value, documentInfo.fileName)}
                    maxLength={MAX_EXTRACTED_CHARS}
                    className="min-h-[160px] font-mono text-[11.5px] leading-relaxed text-muted-foreground"
                  />
                  {documentInfo.truncated ? (
                    <p className="text-[11px] text-amber-500">
                      Document exceeded the 60,000 character limit. Only the first section is used.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {settings.sourceType === "text" && (
            <div className="space-y-3">
              <Label hint="Up to 60,000 characters.">Paste existing text</Label>
              <Textarea
                rows={9}
                value={settings.sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder="Paste an article, notes, a chapter, or a transcript here…"
                maxLength={MAX_EXTRACTED_CHARS}
                className="min-h-[200px]"
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {settings.sourceText.length.toLocaleString()} / 60,000
              </p>
            </div>
          )}

          <div className="rounded-lg border border-input bg-secondary px-3 py-3">
            <div className="flex items-center gap-2">
              <LibraryBig className="h-3.5 w-3.5 shrink-0 text-primary" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-foreground">No live web research.</span> Sarvam-105B writes from
                its model knowledge and your source. The script is labelled accordingly — verify
                specific claims before publishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Episode controls */}
      <section className="rounded-xl border border-input bg-card shadow xl:sticky xl:top-6 xl:self-start">
        <div className="flex items-center justify-between border-b border-accent px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              2
            </span>
            <h2 className="text-sm font-semibold text-foreground">Episode controls</h2>
          </div>
          <Wand2 className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <Label hint={`${settings.duration} minutes`}>Duration</Label>
            <Segmented
              size="sm"
              options={[
                { value: 2 as const, label: "2m" },
                { value: 5 as const, label: "5m" },
                { value: 10 as const, label: "10m" },
                { value: 15 as const, label: "15m" },
              ]}
              value={settings.duration}
              onChange={(duration) => updateSettings({ duration })}
            />
          </div>

          <div className="space-y-2">
            <Label hint={language.native}>Language</Label>
            <Select
              value={settings.language}
              onChange={(event) =>
                updateSettings({ language: event.target.value as typeof settings.language })
              }
            >
              {LANGUAGES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} — {option.native}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Speakers</Label>
              <Segmented
                size="sm"
                options={[
                  { value: 1 as const, label: "Solo" },
                  { value: 2 as const, label: "Duo" },
                  { value: 3 as const, label: "Trio" },
                ]}
                value={settings.speakerCount}
                onChange={(speakerCount) => updateSettings({ speakerCount })}
              />
            </div>
            <div className="space-y-2">
              <Label>Depth</Label>
              <Segmented
                size="sm"
                options={DEPTHS.map((depth) => ({ value: depth.id, label: depth.label }))}
                value={settings.depth}
                onChange={(depth) => updateSettings({ depth: depth as typeof settings.depth })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conversation style</Label>
            <Select
              value={settings.style}
              onChange={(event) =>
                updateSettings({ style: event.target.value as typeof settings.style })
              }
            >
              {STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target audience</Label>
            <Select
              value={settings.audience}
              onChange={(event) =>
                updateSettings({ audience: event.target.value as typeof settings.audience })
              }
            >
              {AUDIENCES.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-lg border border-input bg-secondary p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
                Cast & voices
              </span>
              <span className="text-[10px] text-muted-foreground">{language.model}</span>
            </div>
            <div className="space-y-2">
              {selectedVoices.map((voiceId, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-[11px] text-muted-foreground">
                    Host {index + 1}
                  </span>
                  <Select
                    value={voiceId}
                    onChange={(event) => {
                      const next = [...selectedVoices];
                      next[index] = event.target.value;
                      updateSettings({ voiceIds: next });
                    }}
                    className="h-8 flex-1 text-[11px]"
                  >
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} · {voice.style}
                      </option>
                    ))}
                  </Select>
                  <VoicePreviewButton language={settings.language} voiceId={voiceId} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label hint={`${settings.pace.toFixed(2)}×`}>Speaking pace</Label>
            <Slider
              min={0.75}
              max={1.5}
              step={0.05}
              value={settings.pace}
              onChange={(event) => updateSettings({ pace: Number(event.target.value) })}
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Deliberate</span>
              <span>Brisk</span>
            </div>
          </div>

          {apiReady === false ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
              <div className="flex items-start gap-2 text-[11px] leading-relaxed text-destructive">
                <span className="flex shrink-0">
                  <span className="text-destructive">Sarvam key required.</span> Add{" "}
                  <code className="rounded bg-destructive/20 px-1 py-0.5 text-[10px]">
                    SARVAM_API_KEY
                  </code>{" "}
                  to <code className="rounded bg-destructive/20 px-1 py-0.5 text-[10px]">.env.local</code> or
                  Vercel environment variables. The pipeline is wired and will report the exact API error
                  until a valid key is present.
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={busyScript}
              onClick={() => void createScript()}
            >
              {busyScript ? "Writing the episode…" : "Generate script"}
              {!busyScript ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            Sarvam-105B writes the script. Bulbul v4 Flash performs each speaker. Nothing is
            simulated.
          </p>
        </div>
      </section>
    </div>
  );
}
