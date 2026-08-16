import type { RepoSnapshot } from "@ganesya/stats-engine";
import type { GitHubDataSource } from "./github.js";
import { parseCareerEvents, parseQualifications } from "./parsers.js";

/** Repo paths this project reads from, per the requirements' status table. */
export const REPO_PATHS = {
  logs: "logs",
  finance: "finance",
  home: "home",
  decisions: "decisions",
  chatSummaries: "chat-summaries",
  qualifications: "profile/qualifications.md",
  career: "profile/career.md",
} as const;

export async function buildSnapshot(
  client: GitHubDataSource,
  now: string,
): Promise<RepoSnapshot> {
  const [logs, finance, home, decisions, chatSummaries, qualificationsRaw, careerRaw] =
    await Promise.all([
      client.listDirectory(REPO_PATHS.logs),
      client.listDirectory(REPO_PATHS.finance, { resolveDatesFromContent: true }),
      client.listDirectory(REPO_PATHS.home),
      client.listDirectory(REPO_PATHS.decisions),
      client.listDirectory(REPO_PATHS.chatSummaries),
      client.getFileContent(REPO_PATHS.qualifications),
      client.getFileContent(REPO_PATHS.career),
    ]);

  return {
    now,
    logs,
    finance,
    home,
    decisions,
    chatSummaries,
    qualifications: parseQualifications(qualificationsRaw),
    careerEvents: parseCareerEvents(careerRaw),
  };
}
