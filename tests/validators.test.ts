import { describe, it, expect } from "vitest";
import { scriptRequestSchema, audioRequestSchema, translateRequestSchema, safeJsonParse } from "@/lib/validators";
import { getLanguage, defaultVoiceIds, isLanguageCode } from "@/lib/voices";

describe("validators", () => {
  describe("scriptRequestSchema", () => {
    it("accepts a valid topic request", () => {
      const result = scriptRequestSchema.safeParse({
        sourceType: "topic",
        topic: "The future of AI",
        duration: 5,
        language: "en-IN",
        speakerCount: 2,
        style: "casual",
        audience: "general",
        depth: "standard",
      });
      expect(result.success).toBe(true);
    });

    it("accepts any topic length up to 500 chars", () => {
      const result = scriptRequestSchema.safeParse({
        sourceType: "topic",
        topic: "ab",
        duration: 5,
        language: "en-IN",
        speakerCount: 2,
        style: "casual",
        audience: "general",
        depth: "standard",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a topic longer than 500 chars", () => {
      const result = scriptRequestSchema.safeParse({
        sourceType: "topic",
        topic: "x".repeat(501),
        duration: 5,
        language: "en-IN",
        speakerCount: 2,
        style: "casual",
        audience: "general",
        depth: "standard",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid duration", () => {
      const result = scriptRequestSchema.safeParse({
        sourceType: "topic",
        topic: "Valid topic",
        duration: 7,
        language: "en-IN",
        speakerCount: 2,
        style: "casual",
        audience: "general",
        depth: "standard",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("audioRequestSchema", () => {
    it("accepts valid TTS request", () => {
      const result = audioRequestSchema.safeParse({
        text: "Hello world",
        language: "en-IN",
        voiceId: "shubh_en_narration",
        pace: 1,
      });
      expect(result.success).toBe(true);
    });

    it("rejects pace outside range", () => {
      const result = audioRequestSchema.safeParse({
        text: "Hello world",
        language: "en-IN",
        voiceId: "shubh_en_narration",
        pace: 3,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("safeJsonParse", () => {
    it("parses clean JSON", () => {
      expect(safeJsonParse<{ a: number }>('{"a": 1}')).toEqual({ a: 1 });
    });

    it("parses JSON inside markdown fences", () => {
      expect(safeJsonParse('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
    });

    it("returns null for invalid JSON", () => {
      expect(safeJsonParse("not json")).toBeNull();
    });
  });
});

describe("voices", () => {
  describe("getLanguage", () => {
    it("returns English by default", () => {
      expect(getLanguage("en-IN").code).toBe("en-IN");
    });

    it("falls back to English for unknown code", () => {
      expect(getLanguage("xx-XX").code).toBe("en-IN");
    });
  });

  describe("defaultVoiceIds", () => {
    it("returns the correct number of voices", () => {
      expect(defaultVoiceIds("en-IN", 2)).toHaveLength(2);
      expect(defaultVoiceIds("en-IN", 3)).toHaveLength(3);
      expect(defaultVoiceIds("en-IN", 1)).toHaveLength(1);
    });

    it("picks a female lead voice first", () => {
      const ids = defaultVoiceIds("en-IN", 2);
      const language = getLanguage("en-IN");
      const firstVoice = language.voices.find((v) => v.id === ids[0]);
      expect(firstVoice?.gender).toBe("female");
    });
  });

  describe("isLanguageCode", () => {
    it("validates supported codes", () => {
      expect(isLanguageCode("en-IN")).toBe(true);
      expect(isLanguageCode("hi-IN")).toBe(true);
      expect(isLanguageCode("xx-XX")).toBe(false);
    });
  });
});
