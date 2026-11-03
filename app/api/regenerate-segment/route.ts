import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { chatCompletion, SarvamError } from "@/lib/sarvam";
import { safeJsonParse } from "@/lib/validators";
import { getLanguage } from "@/lib/voices";

export const runtime = "nodejs";
export const maxDuration = 45;

const requestSchema = z.object({
  script: z.object({
    title: z.string().max(200),
    description: z.string().max(1200),
    language: z.string().max(10),
    speakers: z
      .array(z.object({ id: z.string(), name: z.string(), role: z.string() }))
      .min(1)
      .max(3),
    segments: z
      .array(
        z.object({
          id: z.string(),
          heading: z.string(),
          speaker: z.string(),
          text: z.string(),
        }),
      )
      .min(1)
      .max(120),
  }),
  segmentId: z.string(),
  style: z.string().optional(),
  audience: z.string().optional(),
  depth: z.string().optional(),
});

const responseSchema = z.object({
  heading: z.string().min(1).max(120),
  text: z.string().min(1).max(4000),
  speaker: z.string().optional(),
});

export async function POST(request: Request) {
  const limit = rateLimit(`rewrite:${clientKey(request)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Rewrite is being rate limited. Retry in ${limit.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rewrite request." }, { status: 400 });
  }

  const { script, segmentId, style, audience, depth } = parsed.data;
  const segmentIndex = script.segments.findIndex((s) => s.id === segmentId);
  const segment = script.segments[segmentIndex];
  if (!segment) {
    return NextResponse.json({ error: "Segment not found." }, { status: 404 });
  }

  const language = getLanguage(script.language);
  const previous = script.segments[segmentIndex - 1];
  const next = script.segments[segmentIndex + 1];
  const contextLines = [
    previous ? `PREVIOUS TURN (${previous.speaker}): ${previous.text}` : "This is the opening turn.",
    `TARGET TURN (${segment.speaker}): ${segment.text}`,
    next ? `NEXT TURN (${next.speaker}): ${next.text}` : "This is the closing turn.",
  ].join("\n\n");

  const speakers = script.speakers.map((s) => `${s.id} = ${s.name} (${s.role})`).join("; ");

  try {
    const content = await chatCompletion(
      [
        {
          role: "system",
          content: `You rewrite a single dialogue turn in a podcast script for MICDROP AI. Return ONLY JSON: {"heading":"short chapter label","text":"spoken dialogue","speaker":"host id"}.
Rules: keep the same speaker unless the turn genuinely belongs to another host; write only speech with no markdown, stage directions or labels; write entirely in ${language.label} (${language.code}) using ${language.native} script; keep the same approximate length and factual content; improve naturalness, specificity and conversational flow; do not invent statistics or quotes. Style: ${style ?? "casual"}. Audience: ${audience ?? "general"}. Depth: ${depth ?? "standard"}.`,
        },
        {
          role: "user",
          content: `Episode: ${script.title}\nSpeakers: ${speakers}\n\n${contextLines}\n\nRewrite the TARGET TURN now. Return JSON only.`,
        },
      ],
      1200,
    );

    const data = safeJsonParse<unknown>(content);
    const validated = responseSchema.safeParse(data);
    if (!validated.success) {
      return NextResponse.json(
        { error: "The model returned an unusable rewrite. Please retry." },
        { status: 502 },
      );
    }

    return NextResponse.json({ segment: validated.data });
  } catch (error) {
    if (error instanceof SarvamError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not rewrite this segment." }, { status: 500 });
  }
}
