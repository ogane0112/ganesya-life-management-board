import { describe, expect, it } from "vitest";
import { GitHubApiError } from "../src/github.js";
import { handleRequest, type Env } from "../src/index.js";
import type { GitHubDataSource } from "../src/github.js";

const ENV: Env = {
  GITHUB_TOKEN: "test-token",
  GITHUB_OWNER: "ogane0112",
  GITHUB_REPO: "life-management",
  ALLOWED_ORIGIN: "https://ogane0112.github.io",
};

function request(method: string, path = "/api/status") {
  return new Request(`https://worker.example.com${path}`, { method });
}

function factoryFor(client: GitHubDataSource) {
  return () => client;
}

const emptyClient: GitHubDataSource = {
  listDirectory: async () => [],
  getFileContent: async () => "",
};

describe("handleRequest", () => {
  it("answers CORS preflight with 204 and the allowed origin", async () => {
    const res = await handleRequest(request("OPTIONS"), ENV, factoryFor(emptyClient));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ENV.ALLOWED_ORIGIN);
  });

  it("rejects non-GET, non-OPTIONS methods with 405", async () => {
    const res = await handleRequest(request("POST"), ENV, factoryFor(emptyClient));
    expect(res.status).toBe(405);
  });

  it("returns 404 for unknown paths", async () => {
    const res = await handleRequest(request("GET", "/nope"), ENV, factoryFor(emptyClient));
    expect(res.status).toBe(404);
  });

  it("returns 500 when GITHUB_TOKEN is not configured", async () => {
    const res = await handleRequest(
      request("GET"),
      { ...ENV, GITHUB_TOKEN: "" },
      factoryFor(emptyClient),
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 with a computed status payload for a healthy repo snapshot", async () => {
    const res = await handleRequest(request("GET"), ENV, factoryFor(emptyClient));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ENV.ALLOWED_ORIGIN);

    const body = (await res.json()) as any;
    expect(body).toMatchObject({ level: 1, xp: 0 });
    expect(body.hp.score).toBe(0);
  });

  it("maps a GitHubApiError from the client into a 502", async () => {
    const failingClient: GitHubDataSource = {
      listDirectory: async () => {
        throw new GitHubApiError("contents/logs", 403, "rate limited");
      },
      getFileContent: async () => "",
    };
    const res = await handleRequest(request("GET"), ENV, factoryFor(failingClient));
    expect(res.status).toBe(502);
    const body = (await res.json()) as any;
    expect(body.error).toBe("failed to fetch repository data");
  });

  it("maps an unexpected error into a 500 without leaking internals", async () => {
    const failingClient: GitHubDataSource = {
      listDirectory: async () => {
        throw new Error("unexpected boom with secret token xyz");
      },
      getFileContent: async () => "",
    };
    const res = await handleRequest(request("GET"), ENV, factoryFor(failingClient));
    expect(res.status).toBe(500);
    const body = (await res.json()) as any;
    expect(body.error).toBe("internal error");
    expect(JSON.stringify(body)).not.toContain("secret token");
  });

  it("also serves the status payload at the root path", async () => {
    const res = await handleRequest(request("GET", "/"), ENV, factoryFor(emptyClient));
    expect(res.status).toBe(200);
  });
});
