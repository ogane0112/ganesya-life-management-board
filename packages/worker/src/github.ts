import type { RepoFileEntry } from "@ganesya/stats-engine";
import { parseFrontmatterDate } from "./frontmatter.js";

const FILENAME_DATE_RE = /^(\d{4}-\d{2}-\d{2})/;
/** Sentinel for files whose date could not be determined from their name.
 * Old enough to never win a streak/freshness window, but the file still
 * counts toward plain entry-count based scores (equipment/judgement/bond). */
const UNKNOWN_DATE = "1970-01-01";

export class GitHubApiError extends Error {
  constructor(
    public readonly path: string,
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`GitHub API request to "${path}" failed with ${status}: ${body}`);
    this.name = "GitHubApiError";
  }
}

interface ContentsApiEntry {
  type: "file" | "dir" | "symlink" | "submodule";
  name: string;
  path: string;
  size: number;
}

interface ContentsApiFile {
  type: "file";
  content: string;
  encoding: string;
}

export interface ListDirectoryOptions {
  /**
   * When true, files whose name has no leading date are fetched and
   * scanned for a frontmatter `last_updated`/`created` date instead of
   * falling back to the "unknown" sentinel. Costs one extra API request
   * per such file, so only enable it for categories that actually need
   * per-file freshness (e.g. finance/) — categories scored purely by
   * count (equipment/judgement/bond) don't need this.
   */
  resolveDatesFromContent?: boolean;
}

/** Structural interface so callers (and tests) can depend on this instead
 * of the concrete `GitHubClient` implementation. */
export interface GitHubDataSource {
  listDirectory(dirPath: string, options?: ListDirectoryOptions): Promise<RepoFileEntry[]>;
  getFileContent(filePath: string): Promise<string>;
}

export interface GitHubClientOptions {
  owner: string;
  repo: string;
  token: string;
  /** Injectable for tests; defaults to the ambient global `fetch`. */
  fetchFn?: typeof fetch;
}

function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function extractDateFromFilename(name: string): string {
  return FILENAME_DATE_RE.exec(name)?.[1] ?? UNKNOWN_DATE;
}

/**
 * Thin client over the GitHub Contents API, scoped to a single repo.
 * Only reads (never writes) and only exposes the two shapes this project
 * needs: directory listings and single-file text content.
 */
export class GitHubClient implements GitHubDataSource {
  constructor(private readonly opts: GitHubClientOptions) {}

  private async request(path: string): Promise<unknown | null> {
    const fetchFn = this.opts.fetchFn ?? fetch;
    const url = `https://api.github.com/repos/${this.opts.owner}/${this.opts.repo}/${path}`;
    const res = await fetchFn(url, {
      headers: {
        Authorization: `Bearer ${this.opts.token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "life-management-rpg-worker",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new GitHubApiError(path, res.status, await res.text());
    }
    return res.json();
  }

  /** Lists files directly inside `dirPath`. Missing directories yield []. */
  async listDirectory(
    dirPath: string,
    options: ListDirectoryOptions = {},
  ): Promise<RepoFileEntry[]> {
    const json = await this.request(`contents/${dirPath}`);
    if (!Array.isArray(json)) return [];
    const files = (json as ContentsApiEntry[]).filter((entry) => entry.type === "file");

    return Promise.all(
      files.map(async (entry) => {
        const filenameDate = extractDateFromFilename(entry.name);
        let lastModified = filenameDate;
        if (filenameDate === UNKNOWN_DATE && options.resolveDatesFromContent) {
          const content = await this.getFileContent(entry.path);
          lastModified = parseFrontmatterDate(content) ?? UNKNOWN_DATE;
        }
        return {
          path: entry.path,
          name: entry.name,
          size: entry.size,
          lastModified,
        };
      }),
    );
  }

  /** Returns the UTF-8 text content of `filePath`, or "" if it's missing. */
  async getFileContent(filePath: string): Promise<string> {
    const json = await this.request(`contents/${filePath}`);
    if (!json) return "";
    const file = json as ContentsApiFile;
    if (file.encoding !== "base64") {
      throw new Error(`Unsupported content encoding "${file.encoding}" for ${filePath}`);
    }
    return decodeBase64Utf8(file.content);
  }
}
