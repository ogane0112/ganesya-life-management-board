import type { CharacterStatus } from "@ganesya/stats-engine";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Fetches the aggregated character status from the Cloudflare Worker proxy. */
export async function fetchStatus(
  workerUrl: string,
  fetchFn: typeof fetch = fetch,
): Promise<CharacterStatus> {
  const res = await fetchFn(workerUrl);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, `status fetch failed (${res.status}): ${body}`);
  }
  return (await res.json()) as CharacterStatus;
}
