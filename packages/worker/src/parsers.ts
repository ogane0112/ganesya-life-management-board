import type { CareerEventRecord, QualificationRecord } from "@ganesya/stats-engine";
import { extractSection, parseMarkdownTable, tableToKeyValue } from "./markdown-table.js";

const FULL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_MONTH_RE = /^(\d{4}-\d{2})$/;
const NEVER_EXPIRES_VALUES = new Set(["", "-", "無期限", "none", "なし"]);

/** Accepts a full YYYY-MM-DD date or a YYYY-MM (normalized to the 1st).
 * Anything else (e.g. "-", blank, free text) is treated as "no date yet"
 * rather than thrown on, since most fields in a real life-management repo
 * start out as placeholders. */
function normalizeDate(value: string): string | undefined {
  const v = value.trim();
  if (FULL_DATE_RE.test(v)) return v;
  const m = YEAR_MONTH_RE.exec(v);
  return m ? `${m[1]}-01` : undefined;
}

function isNeverExpiring(value: string): boolean {
  return NEVER_EXPIRES_VALUES.has(value.trim().toLowerCase());
}

/**
 * `profile/qualifications.md` in the real life-management repo holds
 * several tables under different headings (held / in-progress /
 * education), each with Japanese column headers, e.g.:
 *
 * ## 取得済み資格・免許
 * | 資格名 | 取得年月 | 有効期限 | 備考 |
 * |---|---|---|---|
 * | 基本情報技術者 | - | 無期限 | - |
 *
 * Only the "held" (取得済み) table counts toward INT — "in progress"
 * qualifications aren't acquired yet. `有効期限` of "-"/"無期限"/blank
 * means the qualification never expires.
 */
const HELD_QUALIFICATIONS_HEADING = /^#{1,6}\s*取得済み/;

export function parseQualifications(content: string): QualificationRecord[] {
  const section = extractSection(content, HELD_QUALIFICATIONS_HEADING);
  return parseMarkdownTable(section)
    .filter((row) => row["資格名"] && row["資格名"] !== "-")
    .map((row) => ({
      name: row["資格名"],
      acquiredDate: normalizeDate(row["取得年月"] ?? ""),
      expiryDate: isNeverExpiring(row["有効期限"] ?? "")
        ? null
        : (normalizeDate(row["有効期限"] ?? "") ?? null),
    }));
}

/**
 * `profile/career.md` holds a "現職" (current job) section as a
 * key/value table (one row per field, not one row per job) plus a
 * "職歴" (job history) section as a normal table with a `期間` (period)
 * column, e.g. "2020-04 - 2023-03". We take the first parseable date out
 * of each as that entry's event date.
 */
const CURRENT_JOB_HEADING = /^#{1,6}\s*現職/;
const JOB_HISTORY_HEADING = /^#{1,6}\s*職歴/;

const DATE_IN_TEXT_RE = /\d{4}-\d{2}(?:-\d{2})?/;

/** Pulls the first YYYY-MM(-DD) out of a free-text range like
 * "2020-04 - 2023-03" or "2020-04〜2023-03". Splitting on "-" as a range
 * separator doesn't work here since dates themselves contain "-". */
function firstDateInRange(value: string): string | undefined {
  const match = DATE_IN_TEXT_RE.exec(value);
  return match ? normalizeDate(match[0]) : undefined;
}

export function parseCareerEvents(content: string): CareerEventRecord[] {
  const events: CareerEventRecord[] = [];

  const currentJob = tableToKeyValue(
    parseMarkdownTable(extractSection(content, CURRENT_JOB_HEADING)),
    "項目",
    "内容",
  );
  const joinDate = normalizeDate(currentJob["入社日"] ?? "");
  if (joinDate) {
    events.push({ title: currentJob["職種"] || "現職", date: joinDate });
  }

  const historyRows = parseMarkdownTable(extractSection(content, JOB_HISTORY_HEADING));
  for (const row of historyRows) {
    if (!row["会社名"] || row["会社名"] === "-") continue;
    const date = firstDateInRange(row["期間"] ?? "");
    if (date) {
      events.push({ title: row["職種"] || row["会社名"], date });
    }
  }

  return events;
}
