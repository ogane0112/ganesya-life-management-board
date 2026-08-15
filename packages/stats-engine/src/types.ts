/**
 * Normalized view of the `ogane0112/life-management` repository, already
 * flattened out of GitHub's API response shape by the worker layer.
 * Keeping this shape independent of GitHub's REST/GraphQL schema lets the
 * calculation logic be tested with plain fixtures.
 */

export interface RepoFileEntry {
  /** Full path relative to repo root, e.g. "logs/2026-08-14.md" */
  path: string;
  /** File name only, e.g. "2026-08-14.md" */
  name: string;
  /** File size in bytes, as reported by the GitHub Contents API */
  size: number;
  /**
   * Best-known "last touched" date for this file, ISO 8601.
   * Sourced from the latest commit that touched the path.
   */
  lastModified: string;
}

export interface QualificationRecord {
  name: string;
  /** ISO date the qualification was acquired, if known */
  acquiredDate?: string;
  /** ISO date the qualification expires; null/undefined = never expires */
  expiryDate?: string | null;
}

export interface CareerEventRecord {
  title: string;
  /** ISO date of the career event */
  date: string;
}

export interface RepoSnapshot {
  /**
   * ISO timestamp representing "now" for the purpose of this calculation.
   * Always injected explicitly (never read from the system clock inside
   * the pure calculation functions) so that results are deterministic and
   * trivially testable.
   */
  now: string;
  logs: RepoFileEntry[];
  finance: RepoFileEntry[];
  qualifications: QualificationRecord[];
  careerEvents: CareerEventRecord[];
  home: RepoFileEntry[];
  decisions: RepoFileEntry[];
  chatSummaries: RepoFileEntry[];
}

export interface StatScore {
  /** Normalized 0-100 score */
  score: number;
  /** Upper bound of the score scale (always 100, kept explicit for bar components) */
  max: number;
  /** Breakdown values useful for debugging / tooltips, not part of the public contract */
  details: Record<string, number>;
}

export interface CharacterStatus {
  /** Overall character level, derived from career.md */
  level: number;
  /** XP backing `level`, exposed for level-up-delta UI */
  xp: number;
  hp: StatScore;
  int: StatScore;
  finance: StatScore;
  equipment: StatScore;
  judgement: StatScore;
  bond: StatScore;
}
