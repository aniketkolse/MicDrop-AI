"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ListMusic, Mic2, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Studio", icon: Sparkles },
  { href: "/episodes", label: "Library", icon: ListMusic },
  { href: "/voices", label: "Voices", icon: Mic2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-[#E7E5E4] bg-white px-6 py-10 lg:flex">
        <Link href="/" className="flex items-center gap-2 mb-16">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] px-2">
            <span className="eq-bar w-[2px] rounded-full bg-[#7C3AED]" style={{ height: "14px", animationDelay: "0s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#7C3AED]" style={{ height: "20px", animationDelay: "0.12s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#7C3AED]" style={{ height: "16px", animationDelay: "0.06s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#7C3AED]" style={{ height: "18px", animationDelay: "0.18s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#7C3AED]" style={{ height: "12px", animationDelay: "0.03s" }} />
          </span>
          <span className="text-2xl font-bold text-[#1C1917] tracking-tight italic font-serif">MICDROP<span className="text-[#7C3AED]"> AI</span></span>
        </Link>

        <div className="px-2 text-[10px] font-semibold text-[#78716C] uppercase tracking-wider mb-6">
          Studio
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "nav-item mb-1",
                  active ? "nav-item.active" : "nav-item.inactive",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-[#7C3AED]" : "text-[#78716C]")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 pt-12">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[#E7E5E4] bg-[#F8F9FC] mb-6">
            <div className="h-8 w-8 rounded-xl border border-[#E7E5E4] bg-white flex items-center justify-center text-[#7C3AED] font-medium text-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1C1917] truncate">Guest</p>
              <p className="text-[10px] text-[#94A3B8]">Not signed in</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/auth/login";
            }}
            className="w-full justify-start text-[#DC2626] hover:bg-[#FFF5F5] border-[#FCA5A5]"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign in
          </Button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E7E5E4] bg-white/80 backdrop-blur-lg px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] px-1.5">
            <Sparkles className="h-4 w-4 text-[#7C3AED]" />
          </span>
          <span className="font-bold text-[#1C1917] tracking-tight italic font-serif">MICDROP<span className="text-[#7C3AED]"> AI</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/create">Get started</Link>
          </Button>
        </div>
      </header>
    </>
  );
}

function Button(props: any) {
  return React.createElement("button", props);
}
