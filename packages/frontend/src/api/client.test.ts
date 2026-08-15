import { describe, expect, it, vi } from "vitest";
import { ApiError, fetchStatus } from "./client.js";

describe("fetchStatus", () => {
  it("returns the parsed status JSON on success", async () => {
    const body = { level: 5, xp: 100 };
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200 }),
    );
    const result = await fetchStatus("https://worker.example.com/api/status", fetchFn);
    expect(result).toEqual(body);
    expect(fetchFn).toHaveBeenCalledWith("https://worker.example.com/api/status");
  });

  it("throws an ApiError with the status code on a non-2xx response", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(new Response("server exploded", { status: 502 }));
    await expect(
      fetchStatus("https://worker.example.com/api/status", fetchFn),
    ).rejects.toMatchObject({ status: 502 });
  });

  it("rejects with an ApiError instance specifically", async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    await expect(
      fetchStatus("https://worker.example.com/api/status", fetchFn),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
