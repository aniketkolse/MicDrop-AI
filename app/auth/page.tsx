"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/services/auth";
import { Button, Input } from "@/components/ui";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
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
          await signUp(email, password);
        }
        router.push("/dashboard");
      } catch (err: any) {
        setError(err?.message || "Authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode, router],
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F5F7] px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm mb-4">
            <Sparkles className="h-5 w-5 text-[#007AFF]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
            Welcome to MicDrop AI
          </h1>
          <p className="mt-2 text-[#86868B] text-sm">
            {mode === "login"
              ? "Sign in to your podcast studio"
              : "Create your account to start producing"}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#D2D2D7] shadow-sm p-8">
          {error ? (
            <div className="mb-6 p-3 rounded-xl border border-[#FF3B30] bg-[#FFF2F2] text-[#FF3B30] text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#1D1D1F] uppercase tracking-wider">
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
              <label className="block text-xs font-medium text-[#1D1D1F] uppercase tracking-wider">
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
                <label className="block text-xs font-medium text-[#1D1D1F] uppercase tracking-wider">
                  Display name (optional)
                </label>
                <Input placeholder="Your name" />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#007AFF] text-white text-sm font-medium rounded-xl hover:bg-[#0066CC] disabled:opacity-50"
              loading={loading}
            >
              {mode === "login" ? <ArrowRight className="h-4 w-4 ml-1" /> : <Sparkles className="h-4 w-4 ml-1" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#86868B]">
            Don't have an account?{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[#007AFF] font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
