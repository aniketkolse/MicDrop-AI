import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";
import { z } from "zod";

const segmentSchema = z.object({
  speaker_id: z.string().uuid().optional().nullable(),
  sequence_number: z.number().int().min(1),
  heading: z.string().max(120).optional(),
  dialogue: z.string().max(4000).optional(),
  audio_path: z.string().max(500).optional(),
  status: z.enum(["pending", "generating", "done", "failed"]).optional(),
  duration_seconds: z.number().optional(),
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
      .from("podcast_segments")
      .select("*, podcast_speakers(speaker_name, speaker_role, voice_id)")
      .eq("podcast_id", id)
      .eq("user_id", user.id)
      .order("sequence_number", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ segments: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch segments" },
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
    const parsed = segmentSchema.safeParse(body);
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
      .from("podcast_segments")
      .insert({ ...parsed.data, podcast_id: id, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ segment: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create segment" },
      { status: 500 },
    );
  }
}
