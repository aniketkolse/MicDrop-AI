// Server-only module: imported exclusively by route handlers.
export class SarvamError extends Error {
  status: number;
  code: string;
  retryable: boolean;

  constructor(message: string, status = 500, code = "sarvam_error", retryable = false) {
    super(message);
    this.name = "SarvamError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const PLACEHOLDER_KEYS = new Set(["", "YOUR_NEW_SARVAM_API_KEY", "replace-me", "your-api-key"]);

export function sarvamKey(): string | null {
  const key = process.env.SARVAM_API_KEY?.trim();
  if (!key || PLACEHOLDER_KEYS.has(key)) return null;
  return key;
}

export function isSarvamConfigured(): boolean {
  return sarvamKey() !== null;
}

export function sarvamBaseUrl(): string {
  return (process.env.SARVAM_BASE_URL || "https://api.sarvam.ai").replace(/\/$/, "");
}

export function chatModel(): string {
  return process.env.SARVAM_CHAT_MODEL || "sarvam-105b";
}

export function ttsModel(): string {
  return process.env.SARVAM_TTS_MODEL || "bulbul:v4-flash";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateRequestId(): string {
  return `srv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface RequestOptions {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
  requestId?: string;
}

/**
 * Server-only fetch with timeout, bounded retries for transient failures and
 * safe error messages (never leaks the API key or raw upstream payloads).
 */
export async function sarvamRequest<T>(
  path: string,
  body: Record<string, unknown>,
  { timeoutMs = 55000, retries = 2, signal, requestId }: RequestOptions = {},
): Promise<T> {
  const key = sarvamKey();
  if (!key) {
    throw new SarvamError(
      "Sarvam API key is not configured. Add SARVAM_API_KEY to .env.local (or Vercel environment variables).",
      503,
      "missing_api_key",
    );
  }

  const reqId = requestId || generateRequestId();

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Sarvam] ${reqId} POST ${path} attempt=1 body_length=${JSON.stringify(body).length}`);
  }

  let lastError: SarvamError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort, { once: true });

    try {
      const res = await fetch(`${sarvamBaseUrl()}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": key,
          Authorization: `Bearer ${key}`,
          "X-Request-Id": reqId,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });

      const text = await res.text();
      let parsed: unknown = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[Sarvam] ${reqId} POST ${path} status=${res.status} body_length=${text.length}`,
        );
      }

      if (!res.ok) {
        const detail =
          parsed && typeof parsed === "object"
            ? (parsed as Record<string, unknown>).error ??
              (parsed as Record<string, unknown>).message ??
              (parsed as Record<string, unknown>).detail
            : null;
        const message =
          typeof detail === "string" && detail.length < 400
            ? detail
            : res.status === 401 || res.status === 403
              ? "Sarvam rejected the credentials or this model is not enabled for your account."
              : res.status === 429
                ? "Sarvam rate limit reached. Try again in a moment."
                : `Sarvam request failed (HTTP ${res.status}).`;

        lastError = new SarvamError(
          message,
          res.status,
          res.status === 429 ? "rate_limited" : "upstream_error",
          res.status === 429 || res.status >= 500,
        );

        if (lastError.retryable && attempt < retries) {
          await sleep(700 * (attempt + 1));
          continue;
        }
        throw lastError;
      }

      return parsed as T;
    } catch (error) {
      if (error instanceof SarvamError) {
        if (error.retryable && attempt < retries) {
          lastError = error;
          await sleep(700 * (attempt + 1));
          continue;
        }
        throw error;
      }
      const aborted = error instanceof Error && error.name === "AbortError";
      lastError = new SarvamError(
        aborted
          ? "Sarvam took too long to respond. Please retry."
          : "Could not reach Sarvam AI. Check your network and retry.",
        aborted ? 504 : 502,
        aborted ? "timeout" : "network_error",
        true,
      );
      if (attempt < retries) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
  }

  throw lastError ?? new SarvamError("Sarvam request failed.");
}

/** Split dialogue on sentence boundaries without cutting sentences. */
export function splitForTts(text: string, maxChars = 1800): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const sentences = normalized.match(/[^.!?।॥]+[.!?।॥]+["'”’)]?|[^.!?।॥]+$/g) ?? [normalized];
  const chunks: string[] = [];
  let current = "";

  const pushWords = (sentence: string) => {
    if (sentence.length <= maxChars) {
      chunks.push(sentence.trim());
      return;
    }
    let buffer = "";
    for (const word of sentence.split(/\s+/)) {
      if ((buffer + " " + word).trim().length > maxChars && buffer) {
        chunks.push(buffer.trim());
        buffer = word;
      } else {
        buffer = `${buffer} ${word}`.trim();
      }
    }
    if (buffer) chunks.push(buffer.trim());
  };

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if ((current + " " + trimmed).trim().length > maxChars) {
      if (current) chunks.push(current.trim());
      current = "";
      if (trimmed.length > maxChars) pushWords(trimmed);
      else current = trimmed;
    } else {
      current = `${current} ${trimmed}`.trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

/** Bulbul REST returns base64 audio; support both documented shapes. */
export function extractAudioBase64(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const audios = record.audios;
  if (Array.isArray(audios)) {
    return audios.filter((a): a is string => typeof a === "string" && a.length > 0);
  }
  const audio = record.audio;
  if (typeof audio === "string" && audio.length > 0) return [audio];
  return [];
}

export async function textToSpeech(params: {
  text: string;
  languageCode: string;
  speaker: string;
  model: string;
  pace: number;
}): Promise<string[]> {
  const payload = await sarvamRequest<unknown>(
    "/text-to-speech",
    {
      text: params.text,
      language_code: params.languageCode,
      speaker: params.speaker,
      model: params.model,
      pace: Math.min(2, Math.max(0.5, params.pace)),
      speech_sample_rate: 22050,
      output_audio_codec: process.env.SARVAM_AUDIO_CODEC || "mp3",
      enable_preprocessing: true,
    },
    { timeoutMs: 60000, retries: 2, requestId: generateRequestId() },
  );
  const audios = extractAudioBase64(payload);
  if (audios.length === 0) {
    throw new SarvamError("Sarvam returned no audio for this segment.", 502, "empty_audio");
  }
  return audios;
}

export async function translateText(params: {
  input: string;
  sourceLanguage: string;
  targetLanguage: string;
}): Promise<string> {
  const payload = await sarvamRequest<{ translated_text?: string }>(
    "/translate",
    {
      input: params.input,
      source_language_code: params.sourceLanguage,
      target_language_code: params.targetLanguage,
      model: "mayura:v1",
      numerals_format: "international",
    },
    { timeoutMs: 45000, retries: 2, requestId: generateRequestId() },
  );
  if (!payload?.translated_text) {
    throw new SarvamError("Sarvam returned an empty translation.", 502, "empty_translation");
  }
  return payload.translated_text;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatPayload {
  choices?: { message?: { content?: unknown } }[];
}

export async function chatCompletion(messages: ChatMessage[], maxTokens = 6000): Promise<string> {
  let payload: ChatPayload;
  const requestId = generateRequestId();

  try {
    payload = await sarvamRequest<ChatPayload>(
      "/v2/chat/completions",
      {
        model: chatModel(),
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      { timeoutMs: 55000, retries: 2, requestId },
    );
  } catch (error) {
    // V2 requires beta access on some accounts; fall back to the stable V1 route.
    if (error instanceof SarvamError && (error.status === 403 || error.status === 404)) {
      payload = await sarvamRequest<ChatPayload>(
        "/v1/chat/completions",
        {
          model: chatModel(),
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        },
        { timeoutMs: 55000, retries: 2, requestId },
      );
    } else {
      throw error;
    }
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) {
    const text = content
      .map((part) =>
        part && typeof part === "object" && "text" in part
          ? String((part as { text?: unknown }).text ?? "")
          : "",
      )
      .join("");
    if (text.trim()) return text;
  }
  throw new SarvamError("Sarvam returned an empty script. Please retry.", 502, "empty_completion");
}
