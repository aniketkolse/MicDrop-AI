import { describe, it, expect } from "vitest";
import { nanoid, formatTime, cn } from "@/lib/utils";

describe("utils", () => {
  describe("nanoid", () => {
    it("generates a string of the requested length", () => {
      expect(nanoid(8)).toHaveLength(8);
      expect(nanoid(16)).toHaveLength(16);
    });

    it("uses alphanumeric characters only", () => {
      const id = nanoid(50);
      expect(/^[a-z0-9]+$/.test(id)).toBe(true);
    });

    it("generates unique ids", () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) ids.add(nanoid(12));
      expect(ids.size).toBe(100);
    });
  });

  describe("formatTime", () => {
    it("formats seconds as m:ss", () => {
      expect(formatTime(0)).toBe("0:00");
      expect(formatTime(5)).toBe("0:05");
      expect(formatTime(65)).toBe("1:05");
      expect(formatTime(3661)).toBe("61:01");
    });

    it("handles non-finite values", () => {
      expect(formatTime(NaN)).toBe("0:00");
      expect(formatTime(-1)).toBe("0:00");
    });
  });

  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("a", "b")).toBe("a b");
    });

    it("handles conditionals", () => {
      expect(cn("a", true && "b", false && "c")).toBe("a b");
    });

    it("handles undefined/null", () => {
      expect(cn("a", null, undefined, "b")).toBe("a b");
    });
  });
});
