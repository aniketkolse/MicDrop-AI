"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { updatePodcast } from "@/lib/services/podcasts";
import { Button, Badge, Textarea, Select } from "@/components/ui";
import { Mic2, RefreshCw, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [script, setScript] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    void fetch(`/api/podcasts/${id}`)
      .then((r) => r.json())
      .then((data) => setScript(data.podcast));
  }, [id]);

  const handleSave = async () => {
    if (!script) return;
    setSaving(true);
    try {
      await updatePodcast(id, { script });
      router.push(`/dashboard/podcasts/${id}`);
    } catch (err: any) {
      alert(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!script) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="h-5 w-5 rounded-full animate-ping border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const speakers = script.speakers as any[] | [];
  const segments = script.segments as any[] | [];

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between border-b border-input bg-card/80 backdrop-blur px-6 py-4 sticky top-0 z-20">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/podcasts/${id}`)}>
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            Back to episode
          </span>
        </Button>
        <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Script editor
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-9">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-balance font-display text-[28px] leading-[1.15] text-foreground sm:text-[36px]">
            {script.title}
          </h1>
          <Button
            onClick={handleSave}
            className="h-10 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            loading={saving}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save
          </Button>
        </div>

        <div className="grid gap-6">
          <section className="rounded-xl border border-input bg-card shadow">
            <div className="border-b border-accent px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Mic2 className="h-3.5 w-3.5" />
                Speakers
              </div>
            </div>
            <div className="divide-y divide-accent p-5">
              {speakers.length > 0 ? (
                speakers.map((s: any, i: number) => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-3 rounded-lg">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      {s.name || s.speaker_name || `Host ${i + 1}`.slice(0, 1)}
                    </span>
                    <Select
                      value={s.voice_id || "default"}
                      onChange={() => {}}
                      className="flex-1 text-[11px]"
                    >
                      <option value="default">Default voice</option>
                    </Select>
                  </div>
                ))
              ) : (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">No speakers.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-input bg-card shadow">
            <div className="border-b border-accent px-5 py-4">
              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>Segments</span>
                <Badge tone="neutral" size="sm">{segments?.length || 0}</Badge>
              </div>
            </div>
            <div className="divide-y divide-accent p-5">
              {segments.length > 0 ? (
                segments.map((seg: any, i: number) => (
                  <div key={seg.id} className="px-3 py-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{seg.heading}</span>
                      <span className="text-[10px] text-muted-foreground">{seg.speaker}</span>
                    </div>
                    <Textarea
                      rows={3}
                      value={seg.dialogue || seg.text || ""}
                      onChange={() => {}}
                      className="text-sm border-transparent bg-transparent focus:border-transparent focus:ring-0"
                    />
                  </div>
                ))
              ) : (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">No segments.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
