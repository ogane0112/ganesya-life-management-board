import type { CharacterStatus } from "@ganesya/stats-engine";
import { describe, expect, it } from "vitest";
import type { StatCategory } from "../CategoryIcon/CategoryIcon.js";
import { buildLevelExplanation, buildStatExplanation } from "./statExplanations.js";

function stat(details: Record<string, number> = {}): CharacterStatus["hp"] {
  return { score: 50, max: 100, details };
}

const ALL_CATEGORIES: StatCategory[] = [
  "hp",
  "int",
  "finance",
  "equipment",
  "judgement",
  "bond",
];

describe("buildStatExplanation", () => {
  it.each(ALL_CATEGORIES)("returns a populated explanation for %s", (category) => {
    const explanation = buildStatExplanation(category, stat());
    expect(explanation.source).not.toBe("");
    expect(explanation.formula.length).toBeGreaterThan(0);
    expect(explanation.breakdown.length).toBeGreaterThan(0);
  });

  it("surfaces the live HP breakdown from details", () => {
    const explanation = buildStatExplanation("hp", stat({ streakDays: 4, recentCount: 12 }));
    expect(explanation.breakdown).toContainEqual({ label: "連続記録日数", value: "4 日" });
    expect(explanation.breakdown).toContainEqual({
      label: "直近30日の記録",
      value: "12 件",
    });
  });

  it("surfaces valid vs total qualifications for INT", () => {
    const explanation = buildStatExplanation("int", stat({ total: 3, validCount: 2 }));
    expect(explanation.breakdown).toContainEqual({ label: "取得済み資格", value: "3 件" });
    expect(explanation.breakdown).toContainEqual({ label: "うち有効", value: "2 件" });
  });

  it("falls back to 0 when a details key is missing", () => {
    const explanation = buildStatExplanation("judgement", stat({}));
    expect(explanation.breakdown).toContainEqual({ label: "意思決定ログ", value: "0 件" });
  });

  it("describes the weights actually used by the engine", () => {
    // stats-engine weights HP as 60% streak / 40% recency; the copy is
    // generated from those constants so it can't drift out of sync.
    const explanation = buildStatExplanation("hp", stat());
    expect(explanation.formula.join(" ")).toContain("60%");
    expect(explanation.formula.join(" ")).toContain("40%");
  });
});

describe("buildLevelExplanation", () => {
  it("reports the current XP", () => {
    const status = {
      level: 5,
      xp: 720,
      hp: stat(),
      int: stat(),
      finance: stat(),
      equipment: stat(),
      judgement: stat(),
      bond: stat(),
    } satisfies CharacterStatus;

    const explanation = buildLevelExplanation(status);
    expect(explanation.breakdown).toContainEqual({ label: "累計XP", value: "720" });
    expect(explanation.source).toContain("career.md");
  });
});
