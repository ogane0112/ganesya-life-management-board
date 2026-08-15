import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCountUp } from "./useCountUp.js";

describe("useCountUp", () => {
  it("starts already at the initial target (no animation from 0)", () => {
    const { result } = renderHook(() => useCountUp(42));
    expect(result.current).toBe(42);
  });

  it("animates up to a new target when it changes", async () => {
    const { result, rerender } = renderHook(({ value }) => useCountUp(value, { durationMs: 20 }), {
      initialProps: { value: 10 },
    });
    expect(result.current).toBe(10);

    rerender({ value: 50 });

    await waitFor(() => expect(result.current).toBe(50), { timeout: 1000 });
  });

  it("animates down when the target decreases", async () => {
    const { result, rerender } = renderHook(({ value }) => useCountUp(value, { durationMs: 20 }), {
      initialProps: { value: 50 },
    });

    rerender({ value: 5 });

    await waitFor(() => expect(result.current).toBe(5), { timeout: 1000 });
  });
});
