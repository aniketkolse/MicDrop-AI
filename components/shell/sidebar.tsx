"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListMusic,
  Mic2,
  Settings,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudio } from "@/components/studio-provider";
import { signOut } from "@/lib/services/auth";

const NAV = [
  { href: "/", label: "Studio", icon: LayoutDashboard },
  { href: "/dashboard/create", label: "Create podcast", icon: Sparkles },
  { href: "/episodes", label: "Library", icon: ListMusic },
  { href: "/voices", label: "Voice studio", icon: Mic2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setAuthState } = useStudio();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-input bg-card px-5 py-8 lg:flex">
      <div className="flex flex-col">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mic2 className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold text-foreground tracking-tight">MicDrop<span className="text-muted-foreground"> AI</span></span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-accent">
          <div className="flex items-center gap-3 px-2 py-4 rounded-lg border border-input bg-secondary mb-6">
            <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center text-primary font-medium text-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Guest</p>
              <p className="text-[11px] text-muted-foreground">Not signed in</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await signOut();
              } catch {
                // Ignore sign-out errors; still clear local state
              }
              setAuthState(null, false);
              router.push("/auth/login");
            }}
            className="w-full text-destructive hover:bg-destructive/5 border-destructive/20"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign in
          </Button>
        </div>
      </div>
    </aside>
  );
}

function Button(props: any) {
  return React.createElement("button", props);
}
