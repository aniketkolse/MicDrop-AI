import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(1200).optional(),
  language: z.string().max(10),
  status: z.string().optional(),
  script: z.any().optional(),
});

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("podcasts")
      .select("*, podcast_speakers(*), podcast_segments(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ podcasts: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch podcasts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("podcasts")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        language: parsed.data.language,
        status: parsed.data.status ?? "draft",
        script: parsed.data.script ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ podcast: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create podcast" },
      { status: 500 },
    );
  }
}
