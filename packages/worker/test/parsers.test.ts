import { describe, expect, it } from "vitest";
import { parseCareerEvents, parseQualifications } from "../src/parsers.js";

describe("parseQualifications", () => {
  it("parses valid rows and normalizes a blank expiry to null", () => {
    const md = [
      "| name | acquiredDate | expiryDate |",
      "|---|---|---|",
      "| 基本情報技術者 | 2020-04-01 |  |",
      "| TOEIC | 2024-06-01 | 2026-06-01 |",
    ].join("\n");

    expect(parseQualifications(md)).toEqual([
      { name: "基本情報技術者", acquiredDate: "2020-04-01", expiryDate: null },
      { name: "TOEIC", acquiredDate: "2024-06-01", expiryDate: "2026-06-01" },
    ]);
  });

  it("returns [] for an empty file", () => {
    expect(parseQualifications("")).toEqual([]);
  });

  it("drops rows without a name", () => {
    const md = ["| name | acquiredDate |", "|---|---|", "|  | 2020-01-01 |"].join(
      "\n",
    );
    expect(parseQualifications(md)).toEqual([]);
  });

  it("treats a malformed date as undefined rather than throwing", () => {
    const md = [
      "| name | acquiredDate | expiryDate |",
      "|---|---|---|",
      "| A | not-a-date | also-bad |",
    ].join("\n");
    expect(parseQualifications(md)).toEqual([
      { name: "A", acquiredDate: undefined, expiryDate: null },
    ]);
  });
});

describe("parseCareerEvents", () => {
  it("parses valid rows", () => {
    const md = [
      "| title | date |",
      "|---|---|",
      "| 入社 | 2019-04-01 |",
      "| 昇進 | 2023-04-01 |",
    ].join("\n");

    expect(parseCareerEvents(md)).toEqual([
      { title: "入社", date: "2019-04-01" },
      { title: "昇進", date: "2023-04-01" },
    ]);
  });

  it("drops rows with a missing or malformed date", () => {
    const md = [
      "| title | date |",
      "|---|---|",
      "| 入社 |  |",
      "| 昇進 | not-a-date |",
      "| 転職 | 2024-01-01 |",
    ].join("\n");

    expect(parseCareerEvents(md)).toEqual([{ title: "転職", date: "2024-01-01" }]);
  });

  it("returns [] for an empty file", () => {
    expect(parseCareerEvents("")).toEqual([]);
  });
});
