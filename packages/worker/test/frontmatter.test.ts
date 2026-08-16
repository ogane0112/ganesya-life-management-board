import { describe, expect, it } from "vitest";
import { parseFrontmatterDate } from "../src/frontmatter.js";

describe("parseFrontmatterDate", () => {
  it("extracts a quoted last_updated date", () => {
    const content = [
      "---",
      'title: "サブスク管理"',
      'last_updated: "2026-06-29"',
      "---",
      "",
      "# 本文",
    ].join("\n");
    expect(parseFrontmatterDate(content)).toBe("2026-06-29");
  });

  it("falls back to created when last_updated is absent", () => {
    const content = ['---', 'created: "2026-07-12"', "---"].join("\n");
    expect(parseFrontmatterDate(content)).toBe("2026-07-12");
  });

  it("prefers last_updated over created when both are present", () => {
    const content = [
      "---",
      'created: "2026-01-01"',
      'last_updated: "2026-07-12"',
      "---",
    ].join("\n");
    expect(parseFrontmatterDate(content)).toBe("2026-07-12");
  });

  it("returns undefined when there is no frontmatter at all", () => {
    expect(parseFrontmatterDate("# ただの見出し\n本文だけ")).toBeUndefined();
  });

  it("returns undefined for a malformed date value", () => {
    const content = ["---", "last_updated: not-a-date", "---"].join("\n");
    expect(parseFrontmatterDate(content)).toBeUndefined();
  });
});
