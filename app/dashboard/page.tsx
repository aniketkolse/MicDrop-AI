import * as React from "react";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, EmptyState } from "@/components/ui";
import { ListMusic, Sparkles, CalendarDays, Users, AudioLines } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let podcasts: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("podcasts")
      .select("*, podcast_speakers(*), podcast_segments(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    podcasts = data ?? [];
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F5F7]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
              Your studio
            </div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">My podcasts</h1>
          </div>
          <a
            href="/dashboard/create"
            className="h-11 px-4 bg-[#007AFF] text-white text-sm font-medium rounded-xl hover:bg-[#0066CC] flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            New podcast
          </a>
        </div>

        {podcasts.length === 0 ? (
          <EmptyState
            icon={<ListMusic className="h-6 w-6 text-[#007AFF]" />}
            title="No podcasts yet"
            description="Create your first AI-generated podcast episode. Choose a topic, upload a document, or paste your own text."
            action={
              <a
                href="/dashboard/create"
                className="bg-[#007AFF] text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-[#0066CC]"
              >
                Create podcast
              </a>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((p) => (
              <article
                key={p.id}
                className="group bg-white rounded-2xl border border-[#D2D2D7] shadow-sm p-6 hover:border-[#007AFF]/50 hover:shadow-md transition-all"
                onClick={() => {
                  window.location.href = `/dashboard/podcasts/${p.id}`;
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] text-[#007AFF]">
                    <ListMusic className="h-4 w-4" />
                  </div>
                  <Badge tone="neutral">{p.status || "draft"}</Badge>
                </div>
                <h2 className="font-semibold text-[#1D1D1F] leading-tight mb-1 group-hover:text-[#007AFF] cursor-pointer">
                  {p.title}
                </h2>
                <p className="text-[#86868B] text-sm line-clamp-2 mb-4">
                  {p.description || "No description yet."}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#86868B] mb-4">
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
    </div>
  );
}
