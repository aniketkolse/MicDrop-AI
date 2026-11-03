import { NextResponse } from "next/server";
import { SarvamError } from "@/lib/sarvam";
import { generateScript } from "@/lib/script-generator";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { scriptRequestSchema } from "@/lib/validators";
import type { Audience, Depth, PodcastStyle } from "@/types/podcast";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = rateLimit(`script:${clientKey(request)}`, 12, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many script requests. Retry in ${limit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = scriptRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const hasTopic = input.topic.trim().length >= 3;
  const hasSource = input.sourceText.trim().length >= 20;
  if (input.sourceType === "topic" && !hasTopic) {
    return NextResponse.json({ error: "Add a topic of at least 3 characters." }, { status: 400 });
  }
  if (input.sourceType !== "topic" && !hasSource && !hasTopic) {
    return NextResponse.json(
      { error: "Add a topic or enough source text to work with." },
      { status: 400 },
    );
  }

  try {
    const script = await generateScript({
      sourceType: input.sourceType,
      topic: input.topic.trim(),
      sourceText: input.sourceText.trim(),
      duration: input.duration,
      language: input.language,
      speakerCount: input.speakerCount,
      style: input.style as PodcastStyle,
      audience: input.audience as Audience,
      depth: input.depth as Depth,
      voiceIds: Array.isArray((body as Record<string, unknown>).voiceIds)
        ? ((body as Record<string, unknown>).voiceIds as string[])
        : undefined,
    });

    return NextResponse.json({ script });
  } catch (error) {
    if (error instanceof SarvamError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Script generation failed. Please retry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
