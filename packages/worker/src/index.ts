import { computeStatus } from "@ganesya/stats-engine";
import { GitHubApiError, GitHubClient, type GitHubDataSource } from "./github.js";
import { buildSnapshot } from "./snapshot.js";

export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  ALLOWED_ORIGIN: string;
}

function buildCorsHeaders(allowedOrigin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  headers: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

export type ClientFactory = (env: Env) => GitHubDataSource;

const defaultClientFactory: ClientFactory = (env) =>
  new GitHubClient({
    owner: env.GITHUB_OWNER,
    repo: env.GITHUB_REPO,
    token: env.GITHUB_TOKEN,
  });

/**
 * Core request handler, exported separately from the default `fetch`
 * export so tests can inject a fake GitHub client instead of hitting the
 * network. `env` supplies non-secret config directly and the secret token
 * via a Worker Secret binding (`wrangler secret put GITHUB_TOKEN`).
 */
export async function handleRequest(
  request: Request,
  env: Env,
  clientFactory: ClientFactory = defaultClientFactory,
): Promise<Response> {
  const corsHeaders = buildCorsHeaders(env.ALLOWED_ORIGIN);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return jsonResponse({ error: "method not allowed" }, 405, corsHeaders);
  }

  const { pathname } = new URL(request.url);
  if (pathname !== "/" && pathname !== "/api/status") {
    return jsonResponse({ error: "not found" }, 404, corsHeaders);
  }

  if (!env.GITHUB_TOKEN) {
    return jsonResponse(
      { error: "server misconfigured: missing GITHUB_TOKEN" },
      500,
      corsHeaders,
    );
  }

  try {
    const client = clientFactory(env);
    const now = new Date().toISOString();
    const snapshot = await buildSnapshot(client, now);
    const status = computeStatus(snapshot);
    return jsonResponse(status, 200, corsHeaders);
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return jsonResponse(
        { error: "failed to fetch repository data", detail: err.message },
        502,
        corsHeaders,
      );
    }
    return jsonResponse({ error: "internal error" }, 500, corsHeaders);
  }
}

export default {
  fetch: (request: Request, env: Env) => handleRequest(request, env),
};
