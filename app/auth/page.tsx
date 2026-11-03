"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/services/auth";
import { Input, Button } from "@/components/ui";
import { Sparkles, Mail, Lock, ArrowRight, ChevronLeft } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"login" | "signup">("login");

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        if (mode === "login") {
          await signIn(email, password);
        } else {
          await signUp(email, password, displayName || undefined);
        }
        router.push("/dashboard");
      } catch (err: any) {
        setError(err?.message || "Authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, displayName, mode, router],
  );

  const handleBack = () => router.push("/");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#FAFAF9] px-6">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-2 mb-1">
          <button type="button" onClick={handleBack} className="p-1.5 text-[#78716C] hover:text-[#1C1917]">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] mb-4">
            <Sparkles className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1C1917] tracking-tight font-serif mb-2">
            Welcome to MicDrop AI
          </h1>
          <p className="text-[#78716C] text-sm">
            {mode === "login" ? "Sign in to your studio" : "Create your account to start producing"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7E5E4] bg-white shadow-sm p-8">
          {error ? (
            <div className="mb-6 p-4 rounded-xl border border-[#FCA5A5] bg-[#FFF5F5] text-[#B91C1C] text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5C5452] uppercase tracking-wider">
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5C5452] uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#5C5452] uppercase tracking-wider">
                  Display name (optional)
                </label>
                <Input
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#7C3AED] text-white text-sm font-medium rounded-xl hover:bg-[#6D28D9] disabled:opacity-50 shadow-sm"
              loading={loading}
            >
              {mode === "login" ? <ArrowRight className="h-4 w-4 mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#78716C]">
            Don't have an account?{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[#7C3AED] font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
