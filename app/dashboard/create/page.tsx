"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createPodcastRecord } from "@/lib/services/podcasts";
import { Button, Input, Select, Textarea, Label, Segmented } from "@/components/ui";
import { LANGUAGES, STYLES, AUDIENCES, DEPTHS } from "@/lib/voices";
import { Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [language, setLanguage] = React.useState("en-IN");
  const [style, setStyle] = React.useState("casual");
  const [sourceType, setSourceType] = React.useState<"topic" | "document" | "text">("topic");
  const [topic, setTopic] = React.useState("");
  const [sourceText, setSourceText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPodcastRecord({
        title,
        description,
        language,
        status: "draft",
        script: null,
      });
      router.push("/dashboard");
    } catch (err: any) {
      alert(err?.message || "Failed to create podcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between border-b border-input bg-card/80 backdrop-blur px-6 py-4 sticky top-0 z-20">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Mic2 className="h-3.5 w-3.5 text-muted-foreground" />
            Back to studio
          </span>
        </Button>
        <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Create podcast
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-9">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label>Podcast title</Label>
            <Input
              placeholder="e.g. The future of Indian language AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 text-base"
            />
          </div>

          <div className="space-y-3">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="What is this episode about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Label>Language</Label>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} — {l.native}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Style</Label>
              <Select value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
                {STYLES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Audience</Label>
              <Select
                value={AUDIENCES[0].id}
                onChange={() => {}}
                disabled
              >
                {AUDIENCES.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Source</Label>
            <Segmented
              options={[
                { value: "topic" as const, label: "Topic" },
                { value: "document" as const, label: "Document" },
                { value: "text" as const, label: "Paste text" },
              ]}
              value={sourceType}
              onChange={setSourceType}
            />
          </div>

          {sourceType === "topic" ? (
            <div className="space-y-3">
              <Label>Topic</Label>
              <Input
                placeholder="Enter your podcast topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="h-10 text-base"
              />
            </div>
          ) : sourceType === "document" ? (
            <div className="space-y-3 rounded-xl border border-input bg-secondary p-5">
              <FileTextLabel />
              <Label>Upload document (PDF · DOCX · TXT)</Label>
              <input type="file" accept=".pdf,.docx,.txt" className="block w-full text-sm text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Paste text</Label>
              <Textarea
                rows={6}
                placeholder="Paste your script or article text here..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            loading={loading}
          >
            <span className="flex items-center gap-1.5">
              Create podcast
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}

function FileTextLabel() {
  return (
    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
      <span className="h-4 w-4 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M16 13h3" />
          <path d="M16 17h3" />
        </svg>
      </span>
      Document
    </div>
  );
}
