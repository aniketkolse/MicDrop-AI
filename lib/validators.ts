import { z } from "zod";
import { LANGUAGE_CODES } from "@/lib/voices";

export const scriptRequestSchema = z.object({
  sourceType: z.enum(["topic", "prompt", "document", "text"]),
  topic: z.string().max(500).optional().default(""),
  sourceText: z.string().max(60000).optional().default(""),
  duration: z.union([z.literal(2), z.literal(5), z.literal(10), z.literal(15)]),
  language: z.enum(LANGUAGE_CODES as [string, ...string[]]),
  speakerCount: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  style: z.enum(["educational", "casual", "interview", "debate", "news", "storytelling"]),
  audience: z.string().max(60),
  depth: z.enum(["overview", "standard", "deep"]),
});

export const speakerSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(60),
  role: z.string().min(1).max(80),
});

export const segmentSchema = z.object({
  id: z.string().min(1).max(60),
  heading: z.string().min(1).max(120),
  speaker: z.string().min(1).max(40),
  text: z.string().min(1).max(4000),
});

export const scriptSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(1200),
  duration: z.number().positive().optional(),
  language: z.string().optional(),
  speakers: z.array(speakerSchema).min(1).max(3),
  segments: z.array(segmentSchema).min(3).max(120),
});

export type RawScript = z.infer<typeof scriptSchema>;

export const audioRequestSchema = z.object({
  text: z.string().min(1).max(8000),
  language: z.enum(LANGUAGE_CODES as [string, ...string[]]),
  voiceId: z.string().min(1).max(80),
  model: z.string().min(1).max(40).optional(),
  pace: z.number().min(0.5).max(2).default(1),
});

export const translateRequestSchema = z.object({
  segments: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        text: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
  sourceLanguage: z.enum(LANGUAGE_CODES as [string, ...string[]]),
  targetLanguage: z.enum(LANGUAGE_CODES as [string, ...string[]]),
});

export function safeJsonParse<T = unknown>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

export function normalizeVoiceId(voiceId: string): string {
  return voiceId.trim().toLowerCase();
}
