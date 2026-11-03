'use server';

import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";
import { BUCKETS, storagePath } from "@/lib/storage-path";

export async function ensureBuckets() {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  return BUCKETS;
}

export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  return data;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function downloadFile(bucket: string, path: string) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return data;
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
