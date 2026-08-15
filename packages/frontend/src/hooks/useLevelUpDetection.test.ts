import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLevelUpDetection } from "./useLevelUpDetection.js";

describe("useLevelUpDetection", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not fire on the very first load (no prior stored level)", () => {
    const { result } = renderHook(() => useLevelUpDetection(10));
    expect(result.current[0]).toBeNull();
    expect(window.localStorage.getItem("life-management-rpg:last-seen-level")).toBe("10");
  });

  it("fires when the level increases across renders", () => {
    const { result, rerender } = renderHook(({ level }) => useLevelUpDetection(level), {
      initialProps: { level: 10 },
    });
    expect(result.current[0]).toBeNull();

    rerender({ level: 12 });
    expect(result.current[0]).toEqual({ previousLevel: 10, newLevel: 12 });
  });

  it("does not fire when the level stays the same", () => {
    const { result, rerender } = renderHook(({ level }) => useLevelUpDetection(level), {
      initialProps: { level: 10 },
    });
    rerender({ level: 10 });
    expect(result.current[0]).toBeNull();
  });

  it("does not fire when the level decreases", () => {
    const { result, rerender } = renderHook(({ level }) => useLevelUpDetection(level), {
      initialProps: { level: 10 },
    });
    rerender({ level: 8 });
    expect(result.current[0]).toBeNull();
  });

  it("clears the event when dismiss() is called", () => {
    const { result, rerender } = renderHook(({ level }) => useLevelUpDetection(level), {
      initialProps: { level: 10 },
    });
    rerender({ level: 11 });
    expect(result.current[0]).not.toBeNull();

    act(() => result.current[1]());
    expect(result.current[0]).toBeNull();
  });

  it("respects a level already stored from a previous session", () => {
    window.localStorage.setItem("life-management-rpg:last-seen-level", "20");
    const { result } = renderHook(() => useLevelUpDetection(21));
    expect(result.current[0]).toEqual({ previousLevel: 20, newLevel: 21 });
  });

  it("does nothing while currentLevel is null (still loading)", () => {
    const { result } = renderHook(() => useLevelUpDetection(null));
    expect(result.current[0]).toBeNull();
    expect(window.localStorage.getItem("life-management-rpg:last-seen-level")).toBeNull();
  });
});
