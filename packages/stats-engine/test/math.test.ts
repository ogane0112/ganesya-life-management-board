import { describe, expect, it } from "vitest";
import {
  clamp,
  computeStreakDays,
  countWithinWindow,
  daysBetween,
  saturatingScore,
  xpToLevel,
} from "../src/math.js";

describe("clamp", () => {
  it("passes through values inside range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
  it("clamps below min", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });
  it("clamps above max", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

describe("saturatingScore", () => {
  it("returns 0 for zero count", () => {
    expect(saturatingScore(0, 10)).toBe(0);
  });
  it("returns 0 for negative count", () => {
    expect(saturatingScore(-3, 10)).toBe(0);
  });
  it("returns exactly 50 when count equals halfPoint", () => {
    expect(saturatingScore(10, 10)).toBe(50);
  });
  it("approaches but never reaches 100", () => {
    const score = saturatingScore(1_000_000, 10);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(99.9);
  });
  it("is monotonically increasing in count", () => {
    expect(saturatingScore(5, 10)).toBeLessThan(saturatingScore(6, 10));
  });
  it("throws for a non-positive halfPoint", () => {
    expect(() => saturatingScore(5, 0)).toThrow();
    expect(() => saturatingScore(5, -1)).toThrow();
  });
});

describe("daysBetween", () => {
  it("computes 0 for the same day", () => {
    expect(daysBetween("2026-08-15", "2026-08-15")).toBe(0);
  });
  it("computes positive diff moving forward", () => {
    expect(daysBetween("2026-08-10", "2026-08-15")).toBe(5);
  });
  it("computes negative diff moving backward", () => {
    expect(daysBetween("2026-08-15", "2026-08-10")).toBe(-5);
  });
  it("ignores time-of-day, only comparing calendar dates", () => {
    expect(daysBetween("2026-08-15T23:59:00Z", "2026-08-16T00:01:00Z")).toBe(
      1,
    );
  });
});

describe("countWithinWindow", () => {
  const now = "2026-08-15";

  it("counts entries on the boundary (inclusive)", () => {
    expect(countWithinWindow(["2026-08-05"], now, 10)).toBe(1);
  });
  it("excludes entries just outside the window", () => {
    expect(countWithinWindow(["2026-08-04"], now, 10)).toBe(0);
  });
  it("excludes future-dated entries", () => {
    expect(countWithinWindow(["2026-08-20"], now, 10)).toBe(0);
  });
  it("returns 0 for an empty list", () => {
    expect(countWithinWindow([], now, 10)).toBe(0);
  });
});

describe("computeStreakDays", () => {
  it("returns 0 when there are no dates", () => {
    expect(computeStreakDays([], "2026-08-15")).toBe(0);
  });

  it("returns 0 when the most recent entry is more than 1 day old", () => {
    expect(computeStreakDays(["2026-08-10"], "2026-08-15")).toBe(0);
  });

  it("counts a single entry logged today as a streak of 1", () => {
    expect(computeStreakDays(["2026-08-15"], "2026-08-15")).toBe(1);
  });

  it("grants a 1-day grace period when today has no entry yet", () => {
    expect(computeStreakDays(["2026-08-14"], "2026-08-15")).toBe(1);
  });

  it("counts consecutive days correctly", () => {
    const dates = ["2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15"];
    expect(computeStreakDays(dates, "2026-08-15")).toBe(4);
  });

  it("stops counting at the first gap", () => {
    const dates = ["2026-08-10", "2026-08-13", "2026-08-14", "2026-08-15"];
    expect(computeStreakDays(dates, "2026-08-15")).toBe(3);
  });

  it("de-duplicates multiple entries on the same day", () => {
    const dates = [
      "2026-08-15T08:00:00Z",
      "2026-08-15T20:00:00Z",
      "2026-08-14T09:00:00Z",
    ];
    expect(computeStreakDays(dates, "2026-08-15T23:00:00Z")).toBe(2);
  });
});

describe("xpToLevel", () => {
  it("returns level 1 for zero xp", () => {
    expect(xpToLevel(0)).toBe(1);
  });
  it("returns level 1 for negative xp", () => {
    expect(xpToLevel(-100)).toBe(1);
  });
  it("increases level as xp grows", () => {
    expect(xpToLevel(50)).toBeGreaterThanOrEqual(xpToLevel(0));
    expect(xpToLevel(500)).toBeGreaterThan(xpToLevel(50));
  });
  it("caps at level 99 for extreme xp", () => {
    expect(xpToLevel(10_000_000)).toBe(99);
  });
});
