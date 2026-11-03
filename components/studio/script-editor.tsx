"use client";

import * as React from "react";
import { Check, MessageSquarePlus, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { Badge, Button, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

const AVATAR_TONES = [
  "border-[#4B3D6E] bg-[#2A223C] text-[#C4B5FD]",
  "border-[#2E5560] bg-[#172C31] text-[#7DD3E8]",
  "border-[#5A4526] bg-[#2C2314] text-[#E5B567]",
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ScriptEditor() {
  const { script, updateSegment, removeSegment, addSegment, regenerateSegmentText } = useStudio();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [draftHeading, setDraftHeading] = React.useState("");
  const [rewritingId, setRewritingId] = React.useState<string | null>(null);

  if (!script) return null;

  const words = script.segments.reduce(
    (sum, segment) => sum + segment.text.trim().split(/\s+/).filter(Boolean).length,
    0,
  );

  const startEditing = (id: string, text: string, heading: string) => {
    setEditingId(id);
    setDraft(text);
    setDraftHeading(heading);
  };

  const save = (id: string) => {
    updateSegment(id, { text: draft.trim(), heading: draftHeading.trim() || "Segment" });
    setEditingId(null);
  };

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-medium tracking-[0.18em] text-[#6D6D7B]">03</span>
          <h2 className="text-[13.5px] font-semibold text-text-primary">Script editor</h2>
          <Badge tone="neutral">{script.segments.length} turns</Badge>
          <Badge tone="neutral">{words.toLocaleString()} words</Badge>
        </div>
        <Button size="sm" variant="secondary" onClick={addSegment}>
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Add turn
        </Button>
      </div>

      <div className="space-y-3 p-4">
        {script.segments.map((segment, index) => {
          const speakerIndex = Math.max(
            0,
            script.speakers.findIndex((speaker) => speaker.id === segment.speaker),
          );
          const speaker = script.speakers[speakerIndex] ?? script.speakers[0];
          const editing = editingId === segment.id;
          const rewriting = rewritingId === segment.id;

          return (
            <article
              key={segment.id}
              className={cn(
                "group rounded-xl border bg-[#15151B] transition-colors",
                editing ? "border-[#4C4468]" : "border-[#2A2A34] hover:border-[#3A3A46]",
              )}
            >
              <div className="flex flex-wrap items-center gap-2.5 border-b border-[#24242D] px-3.5 py-2.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                    AVATAR_TONES[speakerIndex % AVATAR_TONES.length],
                  )}
                >
                  {initials(speaker?.name ?? "Host")}
                </span>
                <Select
                  value={segment.speaker}
                  onChange={(event) => updateSegment(segment.id, { speaker: event.target.value })}
                  className="h-7 w-[118px] border-transparent bg-transparent px-1 text-[11.5px] hover:border-border"
                >
                  {script.speakers.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>

                {editing ? (
                  <input
                    value={draftHeading}
                    onChange={(event) => setDraftHeading(event.target.value)}
                    className="h-7 min-w-[120px] flex-1 rounded-md border border-border bg-[#131318] px-2 text-[11.5px] text-text-primary outline-none focus:border-[#57506F]"
                    placeholder="Segment heading"
                    maxLength={120}
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-[#8B8B99]">
                    {segment.heading}
                  </span>
                )}

                <span className="text-[10px] tabular-nums text-[#5F5F6C]">
                  {segment.text.length.toLocaleString()} chars
                </span>

                <div className="flex items-center gap-0.5">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => save(segment.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-success hover:bg-[#1B2B24]"
                        aria-label="Save changes"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-2"
                        aria-label="Cancel editing"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          setRewritingId(segment.id);
                          await regenerateSegmentText(segment.id);
                          setRewritingId(null);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#7E7E8D] hover:bg-surface-2 hover:text-primary disabled:opacity-40"
                        aria-label="Rewrite with AI"
                        title="Rewrite this turn with Sarvam-105B"
                        disabled={rewriting}
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", rewriting && "animate-spin")} />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditing(segment.id, segment.text, segment.heading)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#7E7E8D] hover:bg-surface-2 hover:text-text-primary"
                        aria-label="Edit segment"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSegment(segment.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#7E7E8D] hover:bg-[#2A191D] hover:text-error"
                        aria-label="Delete segment"
                        disabled={script.segments.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="px-4 py-3.5">
                {editing ? (
                  <>
                    <Textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={4}
                      maxLength={4000}
                      className="min-h-[92px] border-[#353542] bg-[#111116] text-[13px] leading-7"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#5F5F6C]">{draft.length} / 4,000</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => save(segment.id)}>
                          Save turn
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="whitespace-pre-wrap text-[13px] leading-7 text-[#D4D4DE]">
                    {segment.text || (
                      <span className="italic text-[#616170]">
                        Empty turn — edit to add dialogue.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </article>
          );
        })}

        <button
          type="button"
          onClick={addSegment}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#35353F] py-3 text-[11.5px] text-[#6F6F7D] transition-colors hover:border-[#4A4560] hover:text-primary"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Add another turn
        </button>
      </div>
    </section>
  );
}
