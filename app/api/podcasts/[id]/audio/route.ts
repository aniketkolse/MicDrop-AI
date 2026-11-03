import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/services/auth";
import { z } from "zod";
import { getSignedUrl, uploadFile } from "@/lib/services/storage";
import { BUCKETS, storagePath } from "@/lib/storage-path";

export async function POST(
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
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!podcast) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate file type
    const allowedTypes = ["audio/wav", "audio/mpeg", "audio/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const path = storagePath(user.id, id, "audio", `final-${Date.now()}.wav`);
    await uploadFile(BUCKETS.audio, path, file);

    // Update podcast with audio path
    const { error } = await supabase
      .from("podcasts")
      .update({ audio_path: path, audio_format: file.type.replace("audio/", ""), status: "completed" })
      .eq("id", id);

    if (error) throw error;

    const signedUrl = await getSignedUrl(BUCKETS.audio, path);
    return NextResponse.json({ audioPath: path, signedUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload audio" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const supabase = await createServerClient();
    const { data: podcast } = await supabase
      .from("podcasts")
      .select("audio_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!podcast || !podcast.audio_path) {
      return NextResponse.json({ error: "No audio found" }, { status: 404 });
    }

    const signedUrl = await getSignedUrl(BUCKETS.audio, podcast.audio_path);
    return NextResponse.json({ signedUrl, audioPath: podcast.audio_path });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get audio URL" },
      { status: 500 },
    );
  }
}
