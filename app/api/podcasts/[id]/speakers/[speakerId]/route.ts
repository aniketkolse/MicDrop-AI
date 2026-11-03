import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";
import { z } from "zod";

const paramSchema = z.object({
  speakerId: z.string().uuid(),
  segmentId: z.string().uuid(),
});

const updateSpeakerSchema = z.object({
  speaker_name: z.string().min(1).max(100).optional(),
  speaker_role: z.string().max(100).optional(),
  voice_id: z.string().max(80).optional(),
  language: z.string().max(10).optional(),
  speaking_rate: z.number().min(0.5).max(2).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; speakerId: string }> },
) {
  try {
    const { id, speakerId } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const parsed = updateSpeakerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createServerClient();
    // Verify podcast ownership via speaker
    const { data: speaker } = await supabase
      .from("podcast_speakers")
      .select("podcast_id")
      .eq("id", speakerId)
      .eq("user_id", user.id)
      .single();
    if (!speaker || speaker.podcast_id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("podcast_speakers")
      .update(parsed.data)
      .eq("id", speakerId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ speaker: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update speaker" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; speakerId: string }> },
) {
  try {
    const { id, speakerId } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const supabase = await createServerClient();
    // Verify podcast ownership via speaker
    const { data: speaker } = await supabase
      .from("podcast_speakers")
      .select("podcast_id")
      .eq("id", speakerId)
      .eq("user_id", user.id)
      .single();
    if (!speaker || speaker.podcast_id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("podcast_speakers")
      .delete()
      .eq("id", speakerId)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete speaker" },
      { status: 500 },
    );
  }
}
