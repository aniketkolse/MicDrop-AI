"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUser() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export async function createPodcastRecord(values: {
  title: string;
  description?: string;
  language: string;
  status?: string;
  script?: unknown;
}) {
  const supabase = await createServerClient();
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
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/episodes");
  return data;
}

export async function listPodcasts() {
  const supabase = await createServerClient();
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("podcasts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updatePodcast(id: string, values: Record<string, unknown>) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("podcasts")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/episodes");
  return data;
}

export async function deletePodcast(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("podcasts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/episodes");
}
