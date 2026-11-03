import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";
import { z } from "zod";

const paramSchema = z.object({
  segmentId: z.string().uuid(),
});

const updateSegmentSchema = z.object({
  speaker_id: z.string().uuid().optional().nullable(),
  sequence_number: z.number().int().min(1).optional(),
  heading: z.string().max(120).optional(),
  dialogue: z.string().max(4000).optional(),
  audio_path: z.string().max(500).optional(),
  status: z.enum(["pending", "generating", "done", "failed"]).optional(),
  duration_seconds: z.number().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; segmentId: string }> },
) {
  try {
    const { id, segmentId } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const parsed = updateSegmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createServerClient();
    // Verify podcast ownership via segment
    const { data: segment } = await supabase
      .from("podcast_segments")
      .select("podcast_id")
      .eq("id", segmentId)
      .eq("user_id", user.id)
      .single();
    if (!segment || segment.podcast_id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("podcast_segments")
      .update(parsed.data)
      .eq("id", segmentId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ segment: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update segment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; segmentId: string }> },
) {
  try {
    const { id, segmentId } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const supabase = await createServerClient();
    // Verify podcast ownership via segment
    const { data: segment } = await supabase
      .from("podcast_segments")
      .select("podcast_id")
      .eq("id", segmentId)
      .eq("user_id", user.id)
      .single();
    if (!segment || segment.podcast_id !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("podcast_segments")
      .delete()
      .eq("id", segmentId)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete segment" },
      { status: 500 },
    );
  }
}
