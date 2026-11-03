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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E7E5E4] px-4 py-2.5 last:border-0">
      <span className="text-[11px] font-semibold text-[#5C5452] uppercase tracking-wider">{label}</span>
      <span className="min-w-0 truncate text-right font-mono text-[10.5px] text-[#1C1917]">
        {value}
      </span>
    </div>
  );
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
      // Save to local storage as profile
      const episodes = await listEpisodes();
      // Update display name in a simple way - store in localStorage
      localStorage.setItem("micdrop-display-name", displayName.trim());
      setSavingProfile(false);
      notify("success", "Profile updated.");
    } catch {
      setSavingProfile(false);
      notify("error", "Could not update profile.");
    }
  };

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 lg:px-9 lg:py-8">
      <header>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#5C5452]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
          Configuration
        </div>
        <h1 className="mt-2.5 font-display text-[36px] leading-none text-[#1C1917] sm:text-[42px]">
          Settings
        </h1>
        <p className="mt-2 text-[#78716C] text-sm">
          Environment status, authentication, and data controls.
        </p>
      </header>

      {/* Authentication section */}
      <section className="mt-6 rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7C3AED]" />
            <h2 className="text-[13px] font-semibold text-[#1C1917]">Authentication</h2>
          </div>
        </div>
        <div className="p-4">
          <div
            className={`rounded-xl border px-4 py-4 ${
              isAuthenticated
                ? "border-[#16A34A]/30 bg-[#F0FDF4]"
                : "border-[#E7E5E4] bg-[#F8F9FC]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E5E4] bg-[#F3F4F6] text-[#7C3AED]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className={[
                  "text-sm font-semibold",
                  isAuthenticated ? "text-[#1C1917]" : "text-[#DC2626]",
                ].join(" ")}>
                  {isAuthenticated ? "Signed in" : "Not signed in"}
                </p>
                <p className="text-[10.5px] text-[#78716C]">
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
                className="mt-4 inline-block h-9 px-3 border border-[#E7E5E4] rounded-xl text-xs font-medium text-[#7C3AED] hover:bg-[#F3F4F6] transition-colors"
              >
                Sign in
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Sarvam AI connection */}
      <section className="mt-6 rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7C3AED]" />
            <h2 className="text-[13px] font-semibold text-[#1C1917]">Sarvam AI connection</h2>
          </div>
          <Button size="sm" variant="secondary" loading={loading} onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <div className="p-4">
          {loading && !health ? (
            <div className="flex items-center gap-2 py-6 text-[12px] text-[#78716C]">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading server environment…
            </div>
          ) : health ? (
            <>
              <div
                className={`rounded-xl border px-4 py-4 ${
                  health.configured
                    ? "border-[#16A34A]/30 bg-[#F0FDF4]"
                    : "border-[#DC2626]/30 bg-[#FEF2F2]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {health.configured ? (
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  ) : (
                    <XCircle className="h-4 w-4 text-[#DC2626]" />
                  )}
                  <div>
                    <p className={[
                      "text-sm font-semibold",
                      health.configured ? "text-[#16A34A]" : "text-[#DC2626]",
                    ].join(" ")}>
                      {health.configured
                        ? "API key detected on the server"
                        : "SARVAM_API_KEY is missing or placeholder"}
                    </p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-[#78716C]">
                      {health.configured
                        ? "Generation buttons make real Sarvam requests. The key is never sent to the browser."
                        : "Add a real key to .env.local locally, or to Vercel Environment Variables before deploying."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#E7E5E4]">
                <Row label="Environment" value={health.configured ? "configured" : "not configured"} />
                <Row label="Base URL" value={health.baseUrl} />
                <Row label="Chat model" value={health.chatModel} />
                <Row label="TTS model" value={health.ttsModel} />
                <Row label="Last checked" value={new Date(health.checkedAt).toLocaleString()} />
              </div>

              {!health.configured ? (
                <pre className="mt-3 overflow-x-auto rounded-xl border border-[#E7E5E4] bg-[#F9F9FA] p-4 font-mono text-[10.5px] leading-relaxed text-[#78716C]">
{`# .env.local
SARVAM_API_KEY=your_real_key
SARVAM_BASE_URL=https://api.sarvam.ai
SARVAM_CHAT_MODEL=sarvam-105b
SARVAM_TTS_MODEL=bulbul:v4-flash`}
                </pre>
              ) : null}
            </>
          ) : (
            <p className="text-[12px] text-[#DC2626]">Environment status unavailable.</p>
          )}
        </div>
      </section>

      {/* Profile section */}
      <section className="mt-6 rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#7C3AED]" />
            <h2 className="text-[13px] font-semibold text-[#1C1917]">Profile</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5C5452] uppercase tracking-wider">
                Display name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="h-10"
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
          <p className="mt-4 text-[10.5px] text-[#78716C]">
            Profile settings are stored locally. When connected to Supabase, your profile will sync
            across devices.
          </p>
        </div>
      </section>

      {/* Local episode library */}
      <section className="mt-6 rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-[#7C3AED]" />
            <h2 className="text-[13px] font-semibold text-[#1C1917]">Local episode library</h2>
          </div>
          <Badge tone="neutral" className="text-[10px]">
            {count === null ? "…" : `${count} episode${count === 1 ? "" : "s"}`}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="max-w-md text-[10.5px] leading-relaxed text-[#78716C]">
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
            <Trash2 className="h-3.5 w-3.5" />
            Clear library
          </Button>
        </div>
      </section>

      {/* Deploy section */}
      <section className="mt-6 rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#7C3AED]" />
            <h2 className="text-[13px] font-semibold text-[#1C1917]">Deploy to Vercel</h2>
          </div>
        </div>
        <ol className="space-y-2 p-4 text-[11px] leading-relaxed text-[#78716C]">
          <li>
            <span className="text-[#1C1917] font-semibold">1.</span> Push this repository to GitHub on
            <code className="rounded bg-[#F3F4F6] px-1 py-0.5 text-[10px]">main</code>.
          </li>
          <li>
            <span className="text-[#1C1917] font-semibold">2.</span> Import the repo in Vercel — the Next.js
            App Router build is detected automatically.
          </li>
          <li>
            <span className="text-[#1C1917] font-semibold">3.</span> Add{" "}
            <code className="rounded bg-[#F3F4F6] px-1 py-0.5 text-[10px]">SARVAM_API_KEY</code> as a
            Production + Preview environment variable. Never use a NEXT_PUBLIC variable.
          </li>
          <li>
            <span className="text-[#1C1917] font-semibold">4.</span> Deploy, then generate one short
            episode to verify the live key, TTS and WAV export.
          </li>
        </ol>
        <div className="flex flex-wrap gap-3 border-t border-[#E7E5E4] px-4 py-3 text-[10.5px]">
          <a
            href="https://docs.sarvam.ai/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#7C3AED] hover:underline"
          >
            Sarvam docs <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#7C3AED] hover:underline"
          >
            Import to Vercel <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </section>

      <p className="mt-6 text-center text-[10px] text-[#78716C]">
        MicDrop AI · Next.js App Router · Sarvam-105B + Bulbul v4 Flash · audio rendered in-browser
      </p>
    </div>
  );
}
