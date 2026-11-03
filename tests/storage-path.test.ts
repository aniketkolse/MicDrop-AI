import { describe, it, expect } from "vitest";
import { storagePath, BUCKETS } from "@/lib/storage-path";

describe("storagePath", () => {
  it("generates correct path for audio", () => {
    const path = storagePath("user-123", "podcast-456", "audio", "final.wav");
    expect(path).toBe("users/user-123/podcasts/podcast-456/audio/final.wav");
  });

  it("generates correct path for documents", () => {
    const path = storagePath("user-123", "podcast-456", "source", "document.pdf");
    expect(path).toBe("users/user-123/podcasts/podcast-456/source/document.pdf");
  });

  it("generates correct path for covers", () => {
    const path = storagePath("user-123", "podcast-456", "cover", "cover.png");
    expect(path).toBe("users/user-123/podcasts/podcast-456/cover/cover.png");
  });
});

describe("BUCKETS", () => {
  it("has the three required buckets", () => {
    expect(BUCKETS.audio).toBe("podcast-audio");
    expect(BUCKETS.documents).toBe("podcast-documents");
    expect(BUCKETS.covers).toBe("podcast-covers");
  });
});
