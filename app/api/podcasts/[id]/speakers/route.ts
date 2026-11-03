import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";
import { z } from "zod";

const speakerSchema = z.object({
  speaker_name: z.string().min(1).max(100),
  speaker_role: z.string().max(100).optional(),
  voice_id: z.string().max(80).optional(),
  language: z.string().max(10).optional(),
  speaking_rate: z.number().min(0.5).max(2).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const supabase = await createServerClient();
    // Verify podcast ownership
    const { data: podcast } = await supabase
      .from("podcasts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!podcast) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("podcast_speakers")
      .select("*")
      .eq("podcast_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ speakers: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch speakers" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const parsed = speakerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createServerClient();
    // Verify podcast ownership
    const { data: podcast } = await supabase
      .from("podcasts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!podcast) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("podcast_speakers")
      .insert({ ...parsed.data, podcast_id: id, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ speaker: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create speaker" },
      { status: 500 },
    );
  }
}
