import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { SarvamError, splitForTts, translateText } from "@/lib/sarvam";
import { translateRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = rateLimit(`translate:${clientKey(request)}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Translation is being rate limited. Retry in ${limit.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = translateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid translation request." },
      { status: 400 },
    );
  }

  const { segments, sourceLanguage, targetLanguage } = parsed.data;

  try {
    const translated: { id: string; text: string }[] = [];
    for (const segment of segments) {
      // mayura:v1 accepts 1,000 characters per call; split on sentence edges.
      const chunks = splitForTts(segment.text, 900);
      const pieces: string[] = [];
      for (const chunk of chunks) {
        pieces.push(
          await translateText({
            input: chunk,
            sourceLanguage,
            targetLanguage,
          }),
        );
      }
      translated.push({ id: segment.id, text: pieces.join(" ").trim() });
    }
    return NextResponse.json({ segments: translated, targetLanguage });
  } catch (error) {
    if (error instanceof SarvamError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    return NextResponse.json({ error: "Translation failed. Please retry." }, { status: 500 });
  }
}
