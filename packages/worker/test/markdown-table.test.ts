import { describe, expect, it } from "vitest";
import { extractSection, parseMarkdownTable, tableToKeyValue } from "../src/markdown-table.js";

describe("parseMarkdownTable", () => {
  it("parses a well-formed table into row objects", () => {
    const md = [
      "| name | acquiredDate | expiryDate |",
      "|------|--------------|------------|",
      "| 基本情報技術者 | 2020-04-01 |  |",
      "| TOEIC | 2024-06-01 | 2026-06-01 |",
    ].join("\n");

    expect(parseMarkdownTable(md)).toEqual([
      { name: "基本情報技術者", acquireddate: "2020-04-01", expirydate: "" },
      { name: "TOEIC", acquireddate: "2024-06-01", expirydate: "2026-06-01" },
    ]);
  });

  it("returns [] for content with no table", () => {
    expect(parseMarkdownTable("just some prose\nno pipes here")).toEqual([]);
  });

  it("returns [] for a header-only table (no data rows)", () => {
    const md = "| a | b |\n|---|---|";
    expect(parseMarkdownTable(md)).toEqual([]);
  });

  it("ignores surrounding blank lines and non-table prose", () => {
    const md = [
      "# Qualifications",
      "",
      "| name | acquiredDate | expiryDate |",
      "|---|---|---|",
      "| A | 2020-01-01 |  |",
      "",
      "Some trailing notes.",
    ].join("\n");
    expect(parseMarkdownTable(md)).toHaveLength(1);
  });

  it("handles a missing separator row by treating every non-header line as data", () => {
    const md = ["| name |", "| A |", "| B |"].join("\n");
    expect(parseMarkdownTable(md)).toEqual([{ name: "A" }, { name: "B" }]);
  });
});

describe("extractSection", () => {
  const doc = [
    "# タイトル",
    "",
    "## 取得済み資格・免許",
    "",
    "| 資格名 | 取得年月 |",
    "|---|---|",
    "| A | - |",
    "",
    "## 勉強中・取得予定",
    "",
    "| 資格名 | 状況 |",
    "|---|---|",
    "| B | 勉強中 |",
  ].join("\n");

  it("extracts only the body between a heading and the next same-level heading", () => {
    const section = extractSection(doc, /^##\s*取得済み/);
    expect(section).toContain("A");
    expect(section).not.toContain("B");
  });

  it("stops at the next heading of the same or shallower level", () => {
    const section = extractSection(doc, /^##\s*勉強中/);
    expect(section).toContain("B");
  });

  it("returns an empty string when the heading isn't found", () => {
    expect(extractSection(doc, /^##\s*存在しない見出し/)).toBe("");
  });
});

describe("tableToKeyValue", () => {
  it("pivots a two-column key/value table into a lookup object", () => {
    const rows = [
      { 項目: "会社名", 内容: "-" },
      { 項目: "職種", 内容: "エンジニア" },
    ];
    expect(tableToKeyValue(rows, "項目", "内容")).toEqual({
      会社名: "-",
      職種: "エンジニア",
    });
  });

  it("ignores rows with no key", () => {
    const rows = [{ 項目: "", 内容: "x" }];
    expect(tableToKeyValue(rows, "項目", "内容")).toEqual({});
  });

  it("returns {} for an empty row list", () => {
    expect(tableToKeyValue([], "項目", "内容")).toEqual({});
  });
});
