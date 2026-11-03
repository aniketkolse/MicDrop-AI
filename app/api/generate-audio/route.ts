import { NextResponse } from "next/server";
import { getLanguage } from "@/lib/voices";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { splitForTts, ttsModel, textToSpeech, SarvamError } from "@/lib/sarvam";
import { audioRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = rateLimit(`tts:${clientKey(request)}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Voice generation is being rate limited. Retry in ${limit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = audioRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid audio request." },
      { status: 400 },
    );
  }

  const { text, language, voiceId, pace } = parsed.data;
  const languageOption = getLanguage(language);
  const voice = languageOption.voices.find((v) => v.id === voiceId);

  if (!voice) {
    return NextResponse.json(
      {
        error: `Voice "${voiceId}" is not part of the official ${languageOption.label} catalogue. Pick a voice from the selector.`,
      },
      { status: 400 },
    );
  }

  // Malayalam is only in the v3 catalogue; other languages use the configured
  // v4 Flash model (which also accepts the v3 request shape).
  const model = languageOption.model === "bulbul:v3" ? "bulbul:v3" : ttsModel();
  const chunks = splitForTts(text, 1500);
  if (chunks.length === 0) {
    return NextResponse.json({ error: "Nothing to speak in this segment." }, { status: 400 });
  }
  if (chunks.length > 4) {
    return NextResponse.json(
      { error: "Segment is too long for one audio request. Shorten it in the editor." },
      { status: 400 },
    );
  }

  try {
    const audios: string[] = [];
    for (const chunk of chunks) {
      const result = await textToSpeech({
        text: chunk,
        languageCode: language,
        speaker: voice.id,
        model,
        pace,
      });
      audios.push(...result);
    }
    return NextResponse.json({ audios, model, chunks: chunks.length });
  } catch (error) {
    if (error instanceof SarvamError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    return NextResponse.json(
      { error: "Voice generation failed. Please retry this segment." },
      { status: 500 },
    );
  }
}
