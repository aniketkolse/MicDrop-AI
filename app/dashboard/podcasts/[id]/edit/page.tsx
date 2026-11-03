"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { updatePodcast } from "@/lib/services/podcasts";
import { Button, Badge, Textarea, Select } from "@/components/ui";
import { Mic2, Sparkles, AudioLines, RefreshCw, Save } from "lucide-react";

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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F5F7]">
        <div className="h-5 w-5 rounded-full animate-pulse bg-[#C7C7CC]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F5F7]">
      <nav className="flex items-center justify-between border-b border-[#D2D2D7] bg-white px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/podcasts/${id}`)}>
          <span className="flex items-center gap-1 text-sm font-medium">
            Back to episode
          </span>
        </Button>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
          Script editor
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1D1D1F]">{script.title}</h1>
          <Button
            onClick={handleSave}
            className="h-10 bg-[#007AFF] text-white text-sm font-medium rounded-xl hover:bg-[#0066CC] disabled:opacity-50"
            loading={saving}
          >
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
        </div>

        <div className="grid gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-[#007AFF]" />
              <span className="text-sm font-medium text-[#1D1D1F]">Speakers</span>
            </div>
            <div className="grid gap-3">
              {(script.speakers as any[] | []).map((s: any, i: number) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[#D2D2D7] bg-white p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[#007AFF] text-xs font-medium">
                    {s.name || s.speaker_name || `Host ${i + 1}`}
                  </span>
                  <Select
                    value={s.voice_id || "default"}
                    onChange={() => {}}
                    className="flex-1 text-xs"
                  >
                    <option value="default">Default voice</option>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1D1D1F]">Segments</span>
              <Badge tone="neutral">{script.segments?.length || 0}</Badge>
            </div>
            <div className="space-y-2">
              {(script.segments as any[] | []).map((seg: any, i: number) => (
                <div key={seg.id} className="rounded-xl border border-[#D2D2D7] bg-white p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#1D1D1F]">{seg.heading}</span>
                    <span className="text-[10px] text-[#86868B]">{seg.speaker}</span>
                  </div>
                  <Textarea
                    rows={3}
                    value={seg.dialogue || seg.text || ""}
                    onChange={() => {}}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
