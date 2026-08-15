import { describe, expect, it, vi } from "vitest";
import { GitHubApiError, GitHubClient } from "../src/github.js";

function jsonFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue(
    new Response(status === 204 ? null : JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

function client(fetchFn: typeof fetch) {
  return new GitHubClient({ owner: "ogane0112", repo: "life-management", token: "t", fetchFn });
}

describe("GitHubClient.listDirectory", () => {
  it("maps file entries and extracts a leading YYYY-MM-DD date from the filename", async () => {
    const fetchFn = jsonFetch(200, [
      { type: "file", name: "2026-08-14.md", path: "logs/2026-08-14.md", size: 120 },
      { type: "dir", name: "archive", path: "logs/archive", size: 0 },
    ]);
    const files = await client(fetchFn).listDirectory("logs");
    expect(files).toEqual([
      { path: "logs/2026-08-14.md", name: "2026-08-14.md", size: 120, lastModified: "2026-08-14" },
    ]);
  });

  it("falls back to a sentinel date when the filename has no date prefix", async () => {
    const fetchFn = jsonFetch(200, [
      { type: "file", name: "notes.md", path: "logs/notes.md", size: 10 },
    ]);
    const files = await client(fetchFn).listDirectory("logs");
    expect(files[0].lastModified).toBe("1970-01-01");
  });

  it("returns [] when the directory does not exist (404)", async () => {
    const fetchFn = jsonFetch(404, { message: "Not Found" });
    const files = await client(fetchFn).listDirectory("does-not-exist");
    expect(files).toEqual([]);
  });

  it("throws a GitHubApiError on non-2xx, non-404 responses", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(new Response("rate limited", { status: 403 }));
    await expect(client(fetchFn).listDirectory("logs")).rejects.toBeInstanceOf(
      GitHubApiError,
    );
  });

  it("sends the expected auth header and API URL", async () => {
    const fetchFn = jsonFetch(200, []);
    await client(fetchFn).listDirectory("logs");
    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.github.com/repos/ogane0112/life-management/contents/logs",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer t" }),
      }),
    );
  });
});

describe("GitHubClient.getFileContent", () => {
  it("base64-decodes UTF-8 file content, including multi-byte characters", async () => {
    const text = "資格名: 基本情報技術者";
    const bytes = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...bytes));
    const fetchFn = jsonFetch(200, { type: "file", encoding: "base64", content: base64 });
    const result = await client(fetchFn).getFileContent("profile/qualifications.md");
    expect(result).toBe(text);
  });

  it("returns an empty string when the file does not exist (404)", async () => {
    const fetchFn = jsonFetch(404, { message: "Not Found" });
    const result = await client(fetchFn).getFileContent("profile/career.md");
    expect(result).toBe("");
  });

  it("throws for an unsupported encoding", async () => {
    const fetchFn = jsonFetch(200, { type: "file", encoding: "utf-8", content: "raw" });
    await expect(
      client(fetchFn).getFileContent("profile/career.md"),
    ).rejects.toThrow(/Unsupported content encoding/);
  });
});
