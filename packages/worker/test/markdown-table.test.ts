import { describe, expect, it } from "vitest";
import { parseMarkdownTable } from "../src/markdown-table.js";

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
