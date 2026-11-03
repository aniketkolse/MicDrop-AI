import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: vi.fn(),
  } as unknown as Response),
);

vi.stubGlobal("fetch", mockFetch);

describe("sarvam client (mocked)", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetch is mocked and callable", async () => {
    await fetch("https://api.sarvam.ai/test");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
