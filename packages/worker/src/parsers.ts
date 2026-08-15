import type { CareerEventRecord, QualificationRecord } from "@ganesya/stats-engine";
import { parseMarkdownTable } from "./markdown-table.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value: string): string | undefined {
  const trimmed = value.trim();
  return DATE_RE.test(trimmed) ? trimmed : undefined;
}

/**
 * Expected shape of `profile/qualifications.md` (see
 * docs/design/status-calculation.md#data-contract):
 *
 * | name | acquiredDate | expiryDate |
 * |------|--------------|------------|
 * | 基本情報技術者 | 2020-04-01 |            |
 * | TOEIC        | 2024-06-01   | 2026-06-01 |
 *
 * `expiryDate` left blank (or containing text like "なし"/"none") means
 * the qualification never expires.
 */
export function parseQualifications(content: string): QualificationRecord[] {
  return parseMarkdownTable(content)
    .filter((row) => row.name)
    .map((row) => ({
      name: row.name,
      acquiredDate: normalizeDate(row.acquireddate ?? ""),
      expiryDate: normalizeDate(row.expirydate ?? "") ?? null,
    }));
}

/**
 * Expected shape of `profile/career.md`:
 *
 * | title | date |
 * |-------|------|
 * | 入社   | 2019-04-01 |
 * | 昇進   | 2023-04-01 |
 */
export function parseCareerEvents(content: string): CareerEventRecord[] {
  return parseMarkdownTable(content)
    .filter((row) => row.title && DATE_RE.test((row.date ?? "").trim()))
    .map((row) => ({
      title: row.title,
      date: row.date.trim(),
    }));
}
