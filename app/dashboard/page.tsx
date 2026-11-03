import * as React from "react";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, EmptyState } from "@/components/ui";
import { ListMusic } from "lucide-react";

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

  if (!supabase) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14 lg:px-9 text-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 mb-8">
          <span className="h-2 w-2 rounded-full bg-destructive" />
          <span className="text-sm font-medium text-destructive">Supabase not configured</span>
        </div>
        <h1 className="text-balance font-display text-[32px] leading-[1.12] text-foreground sm:text-[40px]">
          My podcasts
        </h1>
        <p className="mt-2 max-w-lg mx-auto text-lg text-muted-foreground leading-relaxed">
          Add your Supabase project URL and anon key to <code className="rounded bg-secondary px-1.5 py-0.5 text-[11px]">.env.local</code> to enable cloud sync. The app works locally with IndexedDB storage.
        </p>
        <a
          href="/dashboard/create"
          className="mt-8 inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-secondary px-4 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
        >
          <ListMusic className="h-3.5 w-3.5" />
          Create podcast
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10 lg:px-9">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
              Your studio
            </span>
          </div>
          <h1 className="text-balance font-display text-[32px] leading-[1.12] text-foreground sm:text-[40px]">
            My podcasts
          </h1>
          <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
            {user?.email ? `Signed in as {user.email}` : "Sign in to sync across devices"}
          </p>
        </div>
        <a
          href="/dashboard/create"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-secondary px-4 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
        >
          <ListMusic className="h-3.5 w-3.5" />
          New podcast
        </a>
      </div>

      {podcasts.length === 0 ? (
        <EmptyState
          icon={<ListMusic className="h-5 w-5 text-primary" />}
          title="No podcasts yet"
          description="Create your first AI-generated podcast episode. Choose a topic, upload a document, or paste your own text."
          action={
            <a
              href="/dashboard/create"
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-secondary px-4 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
            >
              <ListMusic className="h-3.5 w-3.5" />
              Create podcast
            </a>
          }
        />
      ) : (
        <div className="divide-y divide-accent">
          {podcasts.map((p) => (
            <article
              key={p.id}
              className="flex items-center gap-4 rounded-xl border border-input bg-card shadow p-5 hover:bg-accent/30 transition-colors duration-150 cursor-pointer"
              onClick={() => {
                window.location.href = `/dashboard/podcasts/${p.id}`;
              }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListMusic className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground group-hover:text-primary">
                  {p.title}
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                  {p.description || "No description yet."}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" />
                    {new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="flex h-1.5 w-1.5 items-center justify-center rounded-full border" />
                    {(p.podcast_speakers as any[] | []).length} speakers
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="flex h-1.5 w-1.5 items-center justify-center rounded-full border" />
                    {p.audio_path ? "Audio ready" : "Script only"}
                  </span>
                </div>
              </div>
              <Badge tone={p.status === "completed" ? "primary" : "neutral"} size="sm">
                {p.status || "draft"}
              </Badge>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
