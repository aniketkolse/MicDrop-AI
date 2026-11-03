import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  if (!supabase) {
    return NextResponse.json({ user: null, authenticated: false });
  }
  const { data } = await supabase.auth.getUser();
  return NextResponse.json({
    user: data.user ?? null,
    authenticated: !!data.user,
  });
}
