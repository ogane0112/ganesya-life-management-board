import { describe, expect, it } from "vitest";
import type { GitHubDataSource } from "../src/github.js";
import { buildSnapshot } from "../src/snapshot.js";

function fakeClient(overrides: Partial<GitHubDataSource> = {}): GitHubDataSource {
  return {
    listDirectory: async () => [],
    getFileContent: async () => "",
    ...overrides,
  };
}

describe("buildSnapshot", () => {
  it("fetches all seven categories and returns an empty-but-valid snapshot when the repo is empty", async () => {
    const calledPaths: string[] = [];
    const client = fakeClient({
      listDirectory: async (path) => {
        calledPaths.push(path);
        return [];
      },
    });

    const snapshot = await buildSnapshot(client, "2026-08-15T00:00:00Z");

    expect(calledPaths.sort()).toEqual(
      ["chat-summaries", "decisions", "finance", "home", "logs"].sort(),
    );
    expect(snapshot).toEqual({
      now: "2026-08-15T00:00:00Z",
      logs: [],
      finance: [],
      home: [],
      decisions: [],
      chatSummaries: [],
      qualifications: [],
      careerEvents: [],
    });
  });

  it("parses qualifications.md and career.md content into structured records", async () => {
    const client = fakeClient({
      getFileContent: async (path) => {
        if (path === "profile/qualifications.md") {
          return "| name | acquiredDate | expiryDate |\n|---|---|---|\n| A | 2020-01-01 |  |";
        }
        if (path === "profile/career.md") {
          return "| title | date |\n|---|---|\n| 入社 | 2019-04-01 |";
        }
        return "";
      },
    });

    const snapshot = await buildSnapshot(client, "2026-08-15");
    expect(snapshot.qualifications).toEqual([
      { name: "A", acquiredDate: "2020-01-01", expiryDate: null },
    ]);
    expect(snapshot.careerEvents).toEqual([{ title: "入社", date: "2019-04-01" }]);
  });

  it("propagates errors from the underlying client instead of swallowing them", async () => {
    const client = fakeClient({
      listDirectory: async () => {
        throw new Error("boom");
      },
    });
    await expect(buildSnapshot(client, "2026-08-15")).rejects.toThrow("boom");
  });
});
