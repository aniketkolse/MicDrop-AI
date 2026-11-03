"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  Library,
  Mic2,
  Settings,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Create Episode", icon: Sparkles },
  { href: "/episodes", label: "My Episodes", icon: Library },
  { href: "/voices", label: "Voice Studio", icon: Mic2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className="relative flex h-9 w-9 items-end justify-center gap-[2px] overflow-hidden rounded-[10px] border border-[#3A3450] bg-[#1E1A29] px-2 pb-2">
        {[0.5, 1, 0.65, 0.85, 0.4].map((height, index) => (
          <span
            key={index}
            className="eq-bar w-[2px] rounded-full bg-primary"
            style={{ height: `${height * 16}px`, animationDelay: `${index * 0.12}s` }}
          />
        ))}
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-[0.14em] text-text-primary">
          MICDROP
          <span className="ml-1 text-primary">AI</span>
        </span>
        <span className="mt-1 block text-[9.5px] uppercase tracking-[0.22em] text-[#6E6E7C]">
          Podcast Studio
        </span>
      </span>
    </Link>
  );
}

function ApiStatus() {
  const [status, setStatus] = React.useState<"loading" | "ready" | "missing">("loading");

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => {
        if (!cancelled) setStatus(data.configured ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/settings"
      className="block rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-[#414150]"
    >
      <span className="flex items-center gap-2 text-[11px] font-medium text-text-secondary">
        <CircleDot
          className={cn(
            "h-3 w-3",
            status === "ready"
              ? "text-success"
              : status === "missing"
                ? "text-error"
                : "animate-pulse text-text-secondary",
          )}
        />
        {status === "loading"
          ? "Checking Sarvam…"
          : status === "ready"
            ? "Sarvam connected"
            : "API key required"}
      </span>
      <span className="mt-1 block text-[10px] leading-snug text-[#666674]">
        Bulbul v4 Flash · Sarvam-105B
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-border bg-[#121216] px-4 py-5 lg:flex">
        <Brand />

        <div className="mt-9 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#5B5B68]">
          Studio
        </div>
        <nav className="mt-2 flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[12.5px] transition-colors",
                  active
                    ? "bg-[#211D2C] font-medium text-text-primary"
                    : "text-[#8B8B99] hover:bg-surface hover:text-text-primary",
                )}
              >
                {active ? (
                  <span className="absolute -left-4 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
                ) : null}
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-[#6F6F7D]")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-xl border border-border bg-[#16161C] p-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6E6E7C]">
              <AudioLines className="h-3 w-3 text-primary" />
              Production pipeline
            </div>
            <ol className="mt-2.5 space-y-1.5 text-[10.5px] leading-snug text-[#777785]">
              <li>01 — Research & structure</li>
              <li>02 — Script & dialogue</li>
              <li>03 — Bulbul voice render</li>
              <li>04 — Mix & export WAV</li>
            </ol>
          </div>
          <ApiStatus />
        </div>
      </aside>

      {/* Mobile shell */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-[#121216]/95 px-4 backdrop-blur lg:hidden">
        <Brand />
        <ApiStatusMobile />
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border bg-[#121216]/95 backdrop-blur lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-0.5 text-[9px]",
                active ? "text-primary" : "text-[#6F6F7D]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function ApiStatusMobile() {
  const [ready, setReady] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setReady(Boolean(data.configured)))
      .catch(() => setReady(false));
  }, []);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px]",
        ready
          ? "border-[#1F4A3C] bg-[#142B24] text-success"
          : "border-[#4A3035] bg-[#241A1D] text-error",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", ready ? "bg-success" : "bg-error")} />
      {ready === null ? "Sarvam" : ready ? "Live" : "Key"}
    </span>
  );
}
