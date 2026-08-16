import { describe, expect, it } from "vitest";
import { parseCareerEvents, parseQualifications } from "../src/parsers.js";

// Fixtures mirror the *structure* confirmed against the real
// ogane0112/life-management repo (frontmatter, section headings, table
// shapes) with fabricated content — see
// docs/decisions/0007-real-data-format-corrections.md.

const QUALIFICATIONS_MD = `---
title: "資格・免許・学歴"
last_updated: "2026-06-29"
---

# 🏅 資格・免許・学歴

## 学歴

| 期間 | 学校名 | 学部・学科 | 備考 |
|---|---|---|---|
| - | - | - | - |

## 取得済み資格・免許

| 資格名 | 取得年月 | 有効期限 | 備考 |
|---|---|---|---|
| 普通自動車免許（AT限定） | - | 無期限 | - |
| ITパスポート | 2020-04 | 無期限 | - |
| TOEIC | 2024-06-01 | 2026-06-01 | - |

## 勉強中・取得予定

| 資格名 | 状況 | 目標時期 | 備考 |
|---|---|---|---|
| AWS SAA | 勉強中 | - | ⚠️ 取得後3年で更新必要 |
`;

const CAREER_MD_NO_DATES = `---
title: "職歴・現職・目標資格"
last_updated: "2026-06-29"
---

## 現職

| 項目 | 内容 |
|---|---|
| 会社名 | - |
| 職種 | バックエンドエンジニア（見習い） |
| 入社日 | - |

## 職歴

| 期間 | 会社名 | 職種 | 備考 |
|---|---|---|---|
| - | - | - | - |

## 目標資格

| 資格名 | 優先度 | 目標時期 | 備考 |
|---|---|---|---|
| AWS SAA | 高 | - | 勉強中 |
`;

const CAREER_MD_WITH_DATES = `## 現職

| 項目 | 内容 |
|---|---|
| 会社名 | 株式会社サンプル |
| 職種 | バックエンドエンジニア |
| 入社日 | 2024-04-01 |

## 職歴

| 期間 | 会社名 | 職種 | 備考 |
|---|---|---|---|
| 2020-04 - 2023-03 | 前職株式会社 | フロントエンドエンジニア | - |
| - | - | - | - |
`;

describe("parseQualifications", () => {
  it("parses only the 取得済み (held) table, ignoring 学歴 and 勉強中 sections", () => {
    const result = parseQualifications(QUALIFICATIONS_MD);
    expect(result).toHaveLength(3);
    expect(result.map((q) => q.name)).toEqual([
      "普通自動車免許（AT限定）",
      "ITパスポート",
      "TOEIC",
    ]);
  });

  it("treats 無期限/blank/- expiry as never-expiring (null)", () => {
    const result = parseQualifications(QUALIFICATIONS_MD);
    expect(result[0].expiryDate).toBeNull();
    expect(result[1].expiryDate).toBeNull();
  });

  it("parses a real expiry date when present", () => {
    const result = parseQualifications(QUALIFICATIONS_MD);
    expect(result[2].expiryDate).toBe("2026-06-01");
  });

  it("normalizes a YYYY-MM acquiredDate to the 1st of the month", () => {
    const result = parseQualifications(QUALIFICATIONS_MD);
    expect(result[1].acquiredDate).toBe("2020-04-01");
  });

  it("leaves acquiredDate undefined for an unset (-) value", () => {
    const result = parseQualifications(QUALIFICATIONS_MD);
    expect(result[0].acquiredDate).toBeUndefined();
  });

  it("returns [] when the held-qualifications heading is missing entirely", () => {
    expect(parseQualifications("# no matching sections here")).toEqual([]);
  });

  it("returns [] for an empty file", () => {
    expect(parseQualifications("")).toEqual([]);
  });
});

describe("parseCareerEvents", () => {
  it("returns [] when both 現職 and 職歴 are all placeholder (-) values", () => {
    expect(parseCareerEvents(CAREER_MD_NO_DATES)).toEqual([]);
  });

  it("extracts the current job as an event when 入社日 is filled in", () => {
    const events = parseCareerEvents(CAREER_MD_WITH_DATES);
    expect(events).toContainEqual({
      title: "バックエンドエンジニア",
      date: "2024-04-01",
    });
  });

  it("extracts past jobs from 職歴, taking the start of the 期間 range", () => {
    const events = parseCareerEvents(CAREER_MD_WITH_DATES);
    expect(events).toContainEqual({
      title: "フロントエンドエンジニア",
      date: "2020-04-01",
    });
  });

  it("skips 職歴 rows with no company name", () => {
    const events = parseCareerEvents(CAREER_MD_WITH_DATES);
    expect(events).toHaveLength(2);
  });

  it("returns [] for an empty file", () => {
    expect(parseCareerEvents("")).toEqual([]);
  });
});
