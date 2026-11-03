"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createPodcastRecord } from "@/lib/services/podcasts";
import { Button, Input, Select, Textarea, Label, Segmented } from "@/components/ui";
import { LANGUAGES, STYLES, AUDIENCES, DEPTHS } from "@/lib/voices";
import { Sparkles, FileText, Mic2, Layout } from "lucide-react";

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F5F7]">
      <nav className="flex items-center justify-between border-b border-[#D2D2D7] bg-white px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <span className="flex items-center gap-1 text-sm font-medium">
            <span className="h-3 w-3 text-[#86868B]">
              <Mic2 className="h-3 w-3" />
            </span>
            Back to studio
          </span>
        </Button>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
          Create podcast
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Podcast title</Label>
            <Input
              placeholder="e.g. The future of Indian language AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="What is this episode about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
                {STYLES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
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

          <div className="space-y-2">
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
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                placeholder="Enter your podcast topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
          ) : sourceType === "document" ? (
            <div className="space-y-2 border border-[#D2D2D7] rounded-2xl bg-white p-4">
              <FileText className="mb-3 h-5 w-5 text-[#86868B]" />
              <Label>Upload document (PDF · DOCX · TXT)</Label>
              <input type="file" accept=".pdf,.docx,.txt" className="block w-full text-sm text-[#86868B]" />
            </div>
          ) : (
            <div className="space-y-2">
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
            className="w-full h-11 bg-[#007AFF] text-white text-sm font-medium rounded-xl hover:bg-[#0066CC] disabled:opacity-50"
            loading={loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create podcast
          </Button>
        </form>
      </div>
    </div>
  );
}
