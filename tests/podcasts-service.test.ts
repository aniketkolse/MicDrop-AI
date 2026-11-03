import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the Supabase server client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

import { createServerClient } from "@/lib/supabase/server";
import {
  createPodcastRecord,
  listPodcasts,
  getPodcast,
  updatePodcast,
  deletePodcast,
  createGenerationJob,
  updateGenerationJob,
  getGenerationJobs,
} from "@/lib/services/podcasts";

const mockCreateServerClient = createServerClient as unknown as ReturnType<typeof vi.fn>;

describe("podcasts service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateServerClient.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPodcastRecord", () => {
    it("creates a podcast record", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "podcast-1", title: "Test Podcast" },
              error: null,
            }),
          }),
        }),
      });

      const result = await createPodcastRecord({
        title: "Test Podcast",
        language: "en-IN",
        status: "draft",
      });

      expect(result).toEqual({ id: "podcast-1", title: "Test Podcast" });
      expect(mockSupabase.from).toHaveBeenCalledWith("podcasts");
    });

    it("throws when Supabase is not configured", async () => {
      // createServerClient returns null when not configured
      mockCreateServerClient.mockReturnValue(null);
      await expect(createPodcastRecord({ title: "Test", language: "en-IN" })).rejects.toThrow(
        "Supabase is not configured",
      );
    });
  });

  describe("listPodcasts", () => {
    it("returns podcasts for authenticated user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ id: "podcast-1", title: "Test" }],
              error: null,
            }),
          }),
        }),
      });

      const result = await listPodcasts();
      expect(result).toEqual([{ id: "podcast-1", title: "Test" }]);
    });

    it("returns empty array when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      const result = await listPodcasts();
      expect(result).toEqual([]);
    });
  });

  describe("getPodcast", () => {
    it("returns a podcast by ID", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "podcast-1", title: "Test" },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getPodcast("podcast-1");
      expect(result).toEqual({ id: "podcast-1", title: "Test" });
    });
  });

  describe("updatePodcast", () => {
    it("updates a podcast record", async () => {
      mockCreateServerClient.mockReturnValue(mockSupabase);
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "podcast-1", title: "Updated" },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updatePodcast("podcast-1", { title: "Updated" });
      expect(result).toEqual({ id: "podcast-1", title: "Updated" });
    });
  });

  describe("deletePodcast", () => {
    it("deletes a podcast record", async () => {
      mockCreateServerClient.mockReturnValue(mockSupabase);
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      await deletePodcast("podcast-1");
      expect(mockSupabase.from).toHaveBeenCalledWith("podcasts");
    });
  });

  describe("createGenerationJob", () => {
    it("creates a generation job", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "job-1", status: "pending", progress: 0 },
              error: null,
            }),
          }),
        }),
      });

      const result = await createGenerationJob({
        podcastId: "podcast-1",
        jobType: "script",
      });
      expect(result).toEqual({ id: "job-1", status: "pending", progress: 0 });
    });
  });

  describe("updateGenerationJob", () => {
    it("updates a generation job", async () => {
      mockCreateServerClient.mockReturnValue(mockSupabase);
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "job-1", status: "completed", progress: 100 },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateGenerationJob("job-1", {
        status: "completed",
        progress: 100,
      });
      expect(result).toEqual({ id: "job-1", status: "completed", progress: 100 });
    });
  });

  describe("getGenerationJobs", () => {
    it("returns generation jobs for a podcast", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ id: "job-1", status: "completed" }],
              error: null,
            }),
          }),
        }),
      });

      const result = await getGenerationJobs("podcast-1");
      expect(result).toEqual([{ id: "job-1", status: "completed" }]);
    });
  });
});
