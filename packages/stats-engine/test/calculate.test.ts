import { describe, expect, it } from "vitest";
import {
  computeBond,
  computeEquipment,
  computeFinance,
  computeHp,
  computeInt,
  computeJudgement,
  computeLevel,
  computeStatus,
} from "../src/calculate.js";
import type { RepoSnapshot } from "../src/types.js";

const NOW = "2026-08-15";

function file(path: string, lastModified: string, size = 100) {
  return { path, name: path.split("/").pop() ?? path, size, lastModified };
}

function emptySnapshot(now = NOW): RepoSnapshot {
  return {
    now,
    logs: [],
    finance: [],
    qualifications: [],
    careerEvents: [],
    home: [],
    decisions: [],
    chatSummaries: [],
  };
}

describe("computeHp", () => {
  it("is 0 for no logs at all", () => {
    expect(computeHp([], NOW).score).toBe(0);
  });

  it("rewards both an active streak and recent frequency", () => {
    const dailyStreak = Array.from({ length: 14 }, (_, i) => {
      const d = new Date("2026-08-15T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - i);
      return file(`logs/${d.toISOString().slice(0, 10)}.md`, d.toISOString());
    });
    const { score, details } = computeHp(dailyStreak, NOW);
    expect(details.streakDays).toBe(14);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("stays within [0, 100] bounds", () => {
    const many = Array.from({ length: 200 }, (_, i) =>
      file(`logs/${i}.md`, NOW),
    );
    const { score } = computeHp(many, NOW);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("computeInt", () => {
  it("is 0 with no qualifications", () => {
    expect(computeInt([], NOW).score).toBe(0);
  });

  it("scores higher when all qualifications are still valid", () => {
    const allValid = [
      { name: "A", expiryDate: "2030-01-01" },
      { name: "B", expiryDate: null },
    ];
    const halfExpired = [
      { name: "A", expiryDate: "2020-01-01" },
      { name: "B", expiryDate: null },
    ];
    expect(computeInt(allValid, NOW).score).toBeGreaterThan(
      computeInt(halfExpired, NOW).score,
    );
  });

  it("treats a qualification with no expiryDate as never-expiring", () => {
    const result = computeInt([{ name: "A" }], NOW);
    expect(result.details.validCount).toBe(1);
  });

  it("treats expiry exactly on `now` as still valid (inclusive)", () => {
    const result = computeInt([{ name: "A", expiryDate: NOW }], NOW);
    expect(result.details.validCount).toBe(1);
  });
});

describe("computeFinance", () => {
  it("is 0 with no finance records", () => {
    expect(computeFinance([], NOW).score).toBe(0);
  });

  it("scores higher when records were updated recently", () => {
    const fresh = [file("finance/a.md", NOW), file("finance/b.md", NOW)];
    const stale = [
      file("finance/a.md", "2020-01-01"),
      file("finance/b.md", "2020-01-01"),
    ];
    expect(computeFinance(fresh, NOW).score).toBeGreaterThan(
      computeFinance(stale, NOW).score,
    );
  });
});

describe("computeEquipment / computeJudgement / computeBond", () => {
  it("all return 0 for empty folders", () => {
    expect(computeEquipment([]).score).toBe(0);
    expect(computeJudgement([]).score).toBe(0);
    expect(computeBond([]).score).toBe(0);
  });

  it("increase monotonically with entry count", () => {
    const few = [file("home/a.md", NOW)];
    const many = Array.from({ length: 20 }, (_, i) => file(`home/${i}.md`, NOW));
    expect(computeEquipment(many).score).toBeGreaterThan(
      computeEquipment(few).score,
    );
  });
});

describe("computeLevel", () => {
  it("is level 1 with no career events", () => {
    expect(computeLevel([], NOW)).toEqual({ level: 1, xp: 0 });
  });

  it("increases xp with more career events", () => {
    const events = [
      { title: "joined", date: "2024-01-01" },
      { title: "promoted", date: "2025-01-01" },
    ];
    const { xp, level } = computeLevel(events, NOW);
    expect(xp).toBeGreaterThan(0);
    expect(level).toBeGreaterThanOrEqual(1);
  });

  it("accounts for years of experience since the earliest event", () => {
    const recent = [{ title: "joined", date: "2026-08-01" }];
    const veteran = [{ title: "joined", date: "2016-08-01" }];
    expect(computeLevel(veteran, NOW).xp).toBeGreaterThan(
      computeLevel(recent, NOW).xp,
    );
  });

  it("never returns a level below 1 even with a future-dated event", () => {
    const future = [{ title: "joined", date: "2030-01-01" }];
    expect(computeLevel(future, NOW).level).toBeGreaterThanOrEqual(1);
  });
});

describe("computeStatus", () => {
  it("returns a fully-populated status object for an empty snapshot", () => {
    const status = computeStatus(emptySnapshot());
    expect(status.level).toBe(1);
    expect(status.xp).toBe(0);
    for (const key of [
      "hp",
      "int",
      "finance",
      "equipment",
      "judgement",
      "bond",
    ] as const) {
      expect(status[key].score).toBe(0);
      expect(status[key].max).toBe(100);
    }
  });

  it("is deterministic for the same input", () => {
    const snapshot: RepoSnapshot = {
      ...emptySnapshot(),
      logs: [file("logs/2026-08-15.md", NOW)],
      decisions: [file("decisions/2026-08-01.md", NOW)],
    };
    const a = computeStatus(snapshot);
    const b = computeStatus(snapshot);
    expect(a).toEqual(b);
  });
});
