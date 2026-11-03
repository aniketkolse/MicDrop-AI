"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudio } from "@/components/studio-provider";
import {
  Sparkles,
  ListMusic,
  Mic2,
  Settings,
  ArrowLeft,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Studio", icon: Sparkles },
  { href: "/episodes", label: "Library", icon: ListMusic },
  { href: "/voices", label: "Voices", icon: Mic2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { resetStudio } = useStudio();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[#D2D2D7] bg-white px-6 py-8 lg:flex">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-2">
            <span className="eq-bar w-[2px] rounded-full bg-[#007AFF]" style={{ height: "12px", animationDelay: "0s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#007AFF]" style={{ height: "18px", animationDelay: "0.12s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#007AFF]" style={{ height: "14px", animationDelay: "0.06s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#007AFF]" style={{ height: "16px", animationDelay: "0.18s" }} />
            <span className="eq-bar w-[2px] rounded-full bg-[#007AFF]" style={{ height: "10px", animationDelay: "0.03s" }} />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">MICDROP<span className="text-[#007AFF]"> AI</span></span>
        </Link>

        <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#86868B] mb-4">
          Studio
        </div>
        <nav className="flex flex-col gap-1">
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
                <Icon className={cn("h-4 w-4", active ? "text-white" : "text-[#1D1D1F]")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 pt-8">
          <Button
            variant="ghost"
            onClick={() => {
              resetStudio();
              // Sign out handled by auth
            }}
            className="w-full justify-start text-[#FF3B30] hover:bg-[#FFF2F2]"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#D2D2D7] bg-white/90 px-4 backdrop-blur-lg lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] px-1.5">
            <Sparkles className="h-4 w-4 text-[#007AFF]" />
          </span>
          <span className="font-bold text-[#1D1D1F]">MICDROP<span className="text-[#007AFF]"> AI</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/login">Get started</Link>
          </Button>
        </div>
      </header>
    </>
  );
}

function Button(props: any) {
  return React.createElement("button", props);
}
