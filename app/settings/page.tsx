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
  User,
  XCircle,
} from "lucide-react";
import { useStudio } from "@/components/studio-provider";
import { Badge, Button, Input } from "@/components/ui";
import { deleteEpisode, listEpisodes, saveEpisode } from "@/lib/db";
import { signOut } from "@/lib/services/auth";

interface Health {
  configured: boolean;
  chatModel: string;
  ttsModel: string;
  baseUrl: string;
  checkedAt: string;
}

export default function SettingsPage() {
  const {
    notify,
    resetStudio,
    episodeId,
    isAuthenticated,
    user,
    setAuthState,
  } = useStudio();
  const [health, setHealth] = React.useState<Health | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number | null>(null);
  const [clearing, setClearing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState("");
  const [savingProfile, setSavingProfile] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      setHealth((await response.json()) as Health);
      const local = await listEpisodes();
      setCount(local.length);
    } catch {
      notify("error", "Could not read environment status.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthState(null, false);
      notify("success", "Signed out successfully.");
    } catch {
      notify("error", "Could not sign out.");
    }
  };

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

  const saveProfile = async () => {
    if (!displayName.trim()) return;
    setSavingProfile(true);
    try {
      localStorage.setItem("micdrop-display-name", displayName.trim());
      setSavingProfile(false);
      notify("success", "Profile updated.");
    } catch {
      setSavingProfile(false);
      notify("error", "Could not update profile.");
    }
  };

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10 lg:px-9">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
            Configuration
          </span>
        </div>
        <h1 className="text-balance font-display text-[32px] leading-[1.12] text-foreground sm:text-[40px]">
          Settings
        </h1>
        <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
          Environment status, authentication, and data controls.
        </p>
      </header>

      <div className="space-y-6">
        {/* Authentication section */}
        <section className="rounded-xl border border-input bg-card shadow">
          <div className="border-b border-accent px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-input p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className={[
                    "text-sm font-semibold",
                    isAuthenticated ? "text-foreground" : "text-destructive",
                  ].join(" ")}>
                    {isAuthenticated ? "Signed in" : "Not signed in"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {isAuthenticated
                      ? user?.email || "User account"
                      : "Sign in to sync episodes across devices"}
                  </p>
                </div>
              </div>
              {isAuthenticated ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleSignOut}
                  className="mt-4"
                >
                  Sign out
                </Button>
              ) : (
                <a
                  href="/auth/login"
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 text-xs font-medium text-primary hover:bg-accent/50 transition-colors"
                >
                  Sign in
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Sarvam AI connection */}
        <section className="rounded-xl border border-input bg-card shadow">
          <div className="border-b border-accent px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Sarvam AI connection</h2>
              </div>
              <Button size="sm" variant="outline" loading={loading} onClick={() => void refresh()}>
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="p-5">
            {loading && !health ? (
              <div className="flex items-center gap-2 py-6 text-[11px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading server environment…
              </div>
            ) : health ? (
              <>
                <div
                  className={`rounded-lg border p-4 ${
                    health.configured
                      ? "border-green-500/30 bg-green-50/40"
                      : "border-destructive/30 bg-destructive/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {health.configured ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <div>
                      <p className={[
                        "text-sm font-semibold",
                        health.configured ? "text-green-600" : "text-destructive",
                      ].join(" ")}>
                        {health.configured
                          ? "API key detected on the server"
                          : "SARVAM_API_KEY is missing or placeholder"}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {health.configured
                          ? "Generation buttons make real Sarvam requests. The key is never sent to the browser."
                          : "Add a real key to .env.local locally, or to Vercel Environment Variables before deploying."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-input overflow-hidden">
                  <div className="divide-y divide-accent">
                    {[
                      { label: "Environment", value: health.configured ? "configured" : "not configured" },
                      { label: "Base URL", value: health.baseUrl },
                      { label: "Chat model", value: health.chatModel },
                      { label: "TTS model", value: health.ttsModel },
                      { label: "Last checked", value: new Date(health.checkedAt).toLocaleString() },
                    ].map((row, i) => (
                      <div key={row.label} className="px-4 py-3 flex items-center justify-between last:pb-0">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
                          {row.label}
                        </span>
                        <span className="text-[11px] text-right font-mono text-foreground truncate">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!health.configured ? (
                  <pre className="mt-4 overflow-x-auto rounded-lg border border-input bg-secondary p-4 font-mono text-[10.5px] leading-relaxed text-muted-foreground">
                    {`# .env.local
SARVAM_API_KEY=your_real_key
SARVAM_BASE_URL=https://api.sarvam.ai
SARVAM_CHAT_MODEL=sarvam-105b
SARVAM_TTS_MODEL=bulbul:v4-flash`}
                  </pre>
                ) : null}
              </>
            ) : (
              <p className="text-[11px] text-destructive">Environment status unavailable.</p>
            )}
          </div>
        </section>

        {/* Profile section */}
        <section className="rounded-xl border border-input bg-card shadow">
          <div className="border-b border-accent px-5 py-4">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
                  Display name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="h-9"
                />
              </div>
              <Button
                onClick={saveProfile}
                disabled={savingProfile || !displayName.trim()}
                className="w-auto"
                loading={savingProfile}
              >
                Save profile
              </Button>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              Profile settings are stored locally. When connected to Supabase, your profile will sync
              across devices.
            </p>
          </div>
        </section>

        {/* Local episode library */}
        <section className="rounded-xl border border-input bg-card shadow">
          <div className="border-b border-accent px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Local episode library</h2>
              </div>
              <Badge tone="neutral" size="sm" className="text-[11px]">
                {count === null ? "…" : `${count} episode${count === 1 ? "" : "s"}`}
              </Badge>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
                Scripts, settings and rendered WAV audio are stored in IndexedDB on this device. They
                survive refreshes but do not sync across browsers.
              </p>
              <Button
                size="sm"
                variant="danger"
                loading={clearing}
                disabled={!count}
                onClick={() => void clearLibrary()}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear library
              </Button>
            </div>
          </div>
        </section>

        {/* Deploy section */}
        <section className="rounded-xl border border-input bg-card shadow">
          <div className="border-b border-accent px-5 py-4">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Deploy to Vercel</h2>
            </div>
          </div>
          <div className="p-5">
            <ol className="space-y-3 text-[11px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-foreground font-semibold">1.</span>
                Push this repository to GitHub on <code className="rounded bg-secondary px-1 py-0.5 text-[10px]">main</code>.
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-semibold">2.</span>
                Import the repo in Vercel — the Next.js App Router build is detected automatically.
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-semibold">3.</span>
                Add <code className="rounded bg-secondary px-1 py-0.5 text-[10px]">SARVAM_API_KEY</code> as a
                Production + Preview environment variable. Never use a NEXT_PUBLIC variable.
              </li>
              <li className="flex gap-2">
                <span className="text-foreground font-semibold">4.</span>
                Deploy, then generate one short episode to verify the live key, TTS and WAV export.
              </li>
            </ol>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-accent pt-3 text-[11px]">
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
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          MicDrop AI · Next.js App Router · Sarvam-105B + Bulbul v4 Flash · audio rendered in-browser
        </p>
      </div>
    </div>
  );
}
