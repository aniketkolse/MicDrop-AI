"use client";

import * as React from "react";
import { Check, MessageSquarePlus, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { Badge, Button, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

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
    <section className="rounded-xl border border-input bg-card shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-accent px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Script editor</h2>
          <Badge tone="neutral" size="sm">{script.segments.length} turns</Badge>
          <Badge tone="neutral" size="sm">{words.toLocaleString()} words</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={addSegment}>
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Add turn
        </Button>
      </div>

      <div className="divide-y divide-accent px-4 py-4 space-y-2">
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
                "group rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-150 hover:bg-accent/30",
                editing ? "border-ring" : "focus-within:border-ring",
              )}
            >
              <div className="flex flex-wrap items-center gap-2.5 border-b border-accent px-1 pb-2.5 mb-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20"
                >
                  {initials(speaker?.name ?? "Host")}
                </span>
                <Select
                  value={segment.speaker}
                  onChange={(event) => updateSegment(segment.id, { speaker: event.target.value })}
                  className="h-7 w-[130px] border-transparent bg-transparent px-1 text-[11.5px] hover:border-border"
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
                    className="h-7 min-w-[120px] flex-1 rounded-md border border-input bg-transparent px-2 text-[11.5px] text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                    placeholder="Segment heading"
                    maxLength={120}
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {segment.heading}
                  </span>
                )}

                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {segment.text.length.toLocaleString()} chars
                </span>

                <div className="flex items-center gap-1">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => save(segment.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        aria-label="Save changes"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50"
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
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-primary disabled:opacity-40"
                        aria-label="Rewrite with AI"
                        title="Rewrite this turn with Sarvam-105B"
                        disabled={rewriting}
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", rewriting && "animate-spin")} />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditing(segment.id, segment.text, segment.heading)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-primary"
                        aria-label="Edit segment"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSegment(segment.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        aria-label="Delete segment"
                        disabled={script.segments.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="px-1 py-2.5">
                {editing ? (
                  <>
                    <Textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={4}
                      maxLength={4000}
                      className="min-h-[92px] border border-input bg-transparent text-[13px] leading-7 outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{draft.length} / 4,000</span>
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
                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {segment.text || (
                      <span className="italic text-muted-foreground">
                        Empty turn — edit to add dialogue.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addSegment}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input py-3 text-[11px] text-muted-foreground transition-colors duration-150 hover:border-ring hover:text-primary"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        Add another turn
      </button>
    </section>
  );
}
