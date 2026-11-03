"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function withSupabase<T>(fn: (supabase: any) => Promise<T | null>): Promise<T | null> {
  const supabase = await createServerClient();
  if (!supabase) return null;
  return fn(supabase);
}

export async function getUser() {
  return withSupabase(async (supabase) => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  });
}

export async function signOut() {
  const supabase = await createServerClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export async function createPodcastRecord(values: {
  title: string;
  description?: string;
  language: string;
  status?: string;
  script?: unknown;
  original_prompt?: string;
  source_type?: string;
  source_document_path?: string;
}) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("podcasts")
    .insert({
      user_id: user.id,
      title: values.title,
      description: values.description ?? null,
      language: values.language,
      status: values.status ?? "draft",
      script: values.script ?? null,
      original_prompt: values.original_prompt ?? null,
      source_type: values.source_type ?? null,
      source_document_path: values.source_document_path ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/dashboard");
  return data;
}

export async function listPodcasts() {
  return withSupabase(async (supabase) => {
    const user = await getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("podcasts")
      .select("*, podcast_speakers(*), podcast_segments(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

export async function getPodcast(id: string) {
  return withSupabase(async (supabase) => {
    const user = await getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("podcasts")
      .select("*, podcast_speakers(*), podcast_segments(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error) throw error;
    return data;
  });
}

export async function updatePodcast(id: string, values: Record<string, unknown>) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const { data, error } = await supabase
    .from("podcasts")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/dashboard");
  return data;
}

export async function deletePodcast(id: string) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const { error } = await supabase.from("podcasts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function createGenerationJob(values: {
  podcastId: string;
  jobType: "script" | "audio" | "translation" | "rewrite";
}) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("generation_jobs")
    .insert({
      podcast_id: values.podcastId,
      user_id: user.id,
      job_type: values.jobType,
      status: "pending",
      progress: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGenerationJob(jobId: string, values: {
  status?: "pending" | "running" | "completed" | "failed";
  progress?: number;
  errorMessage?: string;
}) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const { data, error } = await supabase
    .from("generation_jobs")
    .update({
      ...(values.status !== undefined ? { status: values.status } : {}),
      ...(values.progress !== undefined ? { progress: values.progress } : {}),
      ...(values.errorMessage !== undefined ? { error_message: values.errorMessage } : {}),
      ...(values.status === "completed" || values.status === "failed"
        ? { completed_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getGenerationJobs(podcastId: string) {
  return withSupabase(async (supabase) => {
    const { data, error } = await supabase
      .from("generation_jobs")
      .select("*")
      .eq("podcast_id", podcastId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}
