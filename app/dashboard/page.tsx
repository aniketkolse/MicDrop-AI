import * as React from "react";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, EmptyState } from "@/components/ui";
import { ListMusic, Sparkles, CalendarDays, Users, AudioLines } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  let user: any = null;
  let podcasts: any[] = [];

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
    if (user) {
      const { data: podcastData } = await supabase
        .from("podcasts")
        .select("*, podcast_speakers(*), podcast_segments(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      podcasts = podcastData ?? [];
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAF9]">
      {!supabase ? (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FCA5A5] bg-[#FFF5F5] px-4 py-2 mb-8">
            <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
            <span className="text-sm font-medium text-[#B91C1C]">Supabase not configured</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1C1917] tracking-tight font-serif mb-4">My podcasts</h1>
          <p className="text-[#78716C] text-base mb-10 max-w-lg mx-auto">
            Add your Supabase project URL and anon key to{" "}
            <code className="bg-[#F3F4F6] px-2 py-0.5 rounded text-[#1C1917]">.env.local</code>{" "}
            to enable cloud sync. The app works locally with IndexedDB storage.
          </p>
          <a
            href="/dashboard/create"
            className="flex items-center justify-center gap-2 h-11 px-6 bg-[#7C3AED] text-white text-sm font-medium rounded-xl hover:bg-[#6D28D9] shadow-luxury"
          >
            <Sparkles className="h-4 w-4" />
            Create podcast
          </a>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-[#78716C] uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                Your studio
              </div>
              <h1 className="text-4xl font-bold text-[#1C1917] tracking-tight font-serif mb-2">My podcasts</h1>
              <p className="text-[#78716C] text-sm">
                {user?.email ? `Signed in as {user.email}` : "Sign in to sync across devices"}
              </p>
            </div>
            <a
              href="/dashboard/create"
              className="flex items-center justify-center gap-2 h-11 px-6 bg-[#7C3AED] text-white text-sm font-medium rounded-xl hover:bg-[#6D28D9] shadow-luxury"
            >
              <Sparkles className="h-4 w-4" />
              New podcast
            </a>
          </div>

          {podcasts.length === 0 ? (
            <EmptyState
              icon={<ListMusic className="h-6 w-6 text-[#7C3AED]" />}
              title="No podcasts yet"
              description="Create your first AI-generated podcast episode. Choose a topic, upload a document, or paste your own text."
              action={
                <a
                  href="/dashboard/create"
                  className="flex items-center justify-center gap-2 h-11 px-6 bg-[#7C3AED] text-white text-sm font-medium rounded-xl hover:bg-[#6D28D9] shadow-luxury"
                >
                  Create podcast
                </a>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {podcasts.map((p) => (
                <article
                  key={p.id}
                  className="group bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-8 hover:border-[#7C3AED]/40 hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    window.location.href = `/dashboard/podcasts/${p.id}`;
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E5E4] bg-[#F8F9FC] text-[#7C3AED]">
                      <ListMusic className="h-5 w-5" />
                    </div>
                    <Badge tone={p.status === "completed" ? "success" : "neutral"} size="sm">
                      {p.status || "draft"}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-[#1C1917] leading-tight mb-3 group-hover:text-[#7C3AED] font-serif">
                    {p.title}
                  </h2>
                  <p className="text-[#78716C] text-sm line-clamp-2 mb-6">
                    {p.description || "No description yet."}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {(p.podcast_speakers as any[] | []).length}
                    </span>
                    <span className="flex items-center gap-1">
                      <AudioLines className="h-3 w-3" />
                      {p.audio_path ? "Audio ready" : "Script only"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
