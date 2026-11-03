"use client";

import * as React from "react";
import {
  CheckCircle2,
  Database,
  ExternalLink,
  HardDrive,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { Badge, Button } from "@/components/ui";
import { deleteEpisode, listEpisodes } from "@/lib/db";

interface Health {
  configured: boolean;
  chatModel: string;
  ttsModel: string;
  baseUrl: string;
  checkedAt: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#26262F] px-4 py-2.5 last:border-0">
      <span className="text-[11px] text-[#7E7E8D]">{label}</span>
      <span className="min-w-0 truncate text-right font-mono text-[10.5px] text-text-secondary">
        {value}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { notify, resetStudio, episodeId } = useStudio();
  const [health, setHealth] = React.useState<Health | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number | null>(null);
  const [clearing, setClearing] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      setHealth((await response.json()) as Health);
      setCount((await listEpisodes()).length);
    } catch {
      notify("error", "Could not read environment status.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const clearLibrary = async () => {
    if (!window.confirm("Delete every episode and rendered audio stored in this browser?")) return;
    setClearing(true);
    try {
      const episodes = await listEpisodes();
      for (const episode of episodes) await deleteEpisode(episode.id);
      if (episodeId) resetStudio();
      setCount(0);
      notify("success", "Local episode library cleared.");
    } catch {
      notify("error", "Could not clear the local library.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 lg:px-9 lg:py-8">
      <header>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6F6F7D]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Configuration
        </div>
        <h1 className="mt-2.5 font-display text-[36px] leading-none text-text-primary sm:text-[42px]">
          Settings
        </h1>
        <p className="mt-2 text-[12px] text-text-secondary">
          Environment status, deployment readiness and local data controls.
        </p>
      </header>

      <section className="mt-6 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-semibold text-text-primary">Sarvam AI connection</h2>
          </div>
          <Button size="sm" variant="secondary" loading={loading} onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <div className="p-4">
          {loading && !health ? (
            <div className="flex items-center gap-2 py-6 text-[12px] text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading server environment…
            </div>
          ) : health ? (
            <>
              <div
                className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 ${
                  health.configured
                    ? "border-[#245844] bg-[#14231D]"
                    : "border-[#5B2B33] bg-[#241A1D]"
                }`}
              >
                {health.configured ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                )}
                <div>
                  <p
                    className={`text-[12px] font-medium ${
                      health.configured ? "text-success" : "text-error"
                    }`}
                  >
                    {health.configured
                      ? "API key detected on the server"
                      : "SARVAM_API_KEY is missing or still the placeholder"}
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-[#9A9AA8]">
                    {health.configured
                      ? "Generation buttons make real Sarvam requests. The key is never sent to the browser. If a call fails, the exact upstream error appears in a toast."
                      : "Add a real key to .env.local locally, or to Vercel Environment Variables before deploying. The app stays fully navigable, and every generate action reports the missing credential honestly."}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <Row label="Environment" value={health.configured ? "configured" : "not configured"} />
                <Row label="Base URL" value={health.baseUrl} />
                <Row label="Chat model" value={health.chatModel} />
                <Row label="TTS model" value={health.ttsModel} />
                <Row label="Last checked" value={new Date(health.checkedAt).toLocaleString()} />
              </div>

              {!health.configured ? (
                <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-[#111116] p-3 font-mono text-[10.5px] leading-relaxed text-[#A9A9B8]">
{`# .env.local
SARVAM_API_KEY=your_real_key
SARVAM_BASE_URL=https://api.sarvam.ai
SARVAM_CHAT_MODEL=sarvam-105b
SARVAM_TTS_MODEL=bulbul:v4-flash`}
                </pre>
              ) : null}
            </>
          ) : (
            <p className="text-[12px] text-error">Environment status unavailable.</p>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <HardDrive className="h-4 w-4 text-primary" />
          <h2 className="text-[13px] font-semibold text-text-primary">Local episode library</h2>
          <Badge tone="neutral" className="ml-auto">
            {count === null ? "…" : `${count} episode${count === 1 ? "" : "s"}`}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="max-w-md text-[10.5px] leading-relaxed text-text-secondary">
            Scripts, settings and rendered WAV audio are stored in IndexedDB on this device. They
            survive refreshes but do not sync across browsers. Vercel&apos;s filesystem is never used
            for storage.
          </p>
          <Button
            size="sm"
            variant="danger"
            loading={clearing}
            disabled={!count}
            onClick={() => void clearLibrary()}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear library
          </Button>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-[13px] font-semibold text-text-primary">Deploy to Vercel</h2>
        </div>
        <ol className="space-y-2 p-4 text-[11px] leading-relaxed text-text-secondary">
          <li>
            <span className="text-text-primary">1.</span> Push this repository to GitHub on{" "}
            <code className="rounded bg-[#111116] px-1 py-0.5 text-[10px]">main</code>.
          </li>
          <li>
            <span className="text-text-primary">2.</span> Import the repo in Vercel — the Next.js
            App Router build is detected automatically.
          </li>
          <li>
            <span className="text-text-primary">3.</span> Add{" "}
            <code className="rounded bg-[#111116] px-1 py-0.5 text-[10px]">SARVAM_API_KEY</code> as a
            Production + Preview environment variable. Never use a NEXT_PUBLIC variable.
          </li>
          <li>
            <span className="text-text-primary">4.</span> Deploy, then generate one short episode to
            verify the live key, TTS and WAV export.
          </li>
        </ol>
        <div className="flex flex-wrap gap-3 border-t border-border px-4 py-3 text-[10.5px]">
          <a
            href="https://docs.sarvam.ai/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Sarvam docs <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Import to Vercel <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </section>

      <p className="mt-6 text-center text-[10px] text-[#5E5E6B]">
        MicDrop AI · Next.js App Router · Sarvam-105B + Bulbul v4 Flash · audio rendered in-browser
      </p>
    </div>
  );
}
