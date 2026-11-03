'use server';

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function withSupabase<T>(fn: (supabase: any) => Promise<T | null>): Promise<T | null> {
  const supabase = await createServerClient();
  if (!supabase) return null;
  return fn(supabase);
}

export async function signUp(email: string, password: string, displayName?: string) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const cookieStore = await cookies();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName ?? "" },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  });
  if (error) throw error;
  revalidatePath("/auth/login");
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  revalidatePath("/", "layout");
  return data;
}

export async function signOut() {
  const supabase = await createServerClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function getSession() {
  return withSupabase(async (supabase) => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  });
}

export async function getUser() {
  return withSupabase(async (supabase) => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  });
}

export async function updateProfile(displayName: string, avatarUrl?: string) {
  const supabase = await createServerClient();
  if (!supabase) throw new Error("Supabase is not configured. Add your project credentials to .env.local");
  const user = await getUser();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user?.id,
      display_name: displayName,
      avatar_url: avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/settings");
  return data;
}
