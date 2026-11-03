'use server';

import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";

export async function createGenerationJob(values: {
  podcastId: string;
  jobType: "script" | "audio" | "translation" | "rewrite";
}) {
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("podcast_id", podcastId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
