import { describe, expect, it, vi } from "vitest";
import { LEVEL_UP_FANFARE, playBeepSequence } from "./beep.js";

function fakeAudioContext() {
  const oscillator = {
    type: "",
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const gain = {
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() },
  };
  return {
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gain),
  } as unknown as AudioContext;
}

describe("playBeepSequence", () => {
  it("creates one oscillator per step in the sequence", () => {
    const ctx = fakeAudioContext();
    playBeepSequence(LEVEL_UP_FANFARE, () => ctx);
    expect((ctx.createOscillator as unknown as { mock: { calls: unknown[] } }).mock.calls).toHaveLength(
      LEVEL_UP_FANFARE.length,
    );
  });

  it("does not throw when the AudioContext factory throws (unsupported browser)", () => {
    expect(() =>
      playBeepSequence(LEVEL_UP_FANFARE, () => {
        throw new Error("AudioContext is not defined");
      }),
    ).not.toThrow();
  });

  it("does not throw when oscillator creation itself throws", () => {
    const ctx = {
      currentTime: 0,
      destination: {},
      createOscillator: () => {
        throw new Error("boom");
      },
      createGain: vi.fn(),
    } as unknown as AudioContext;
    expect(() => playBeepSequence(LEVEL_UP_FANFARE, () => ctx)).not.toThrow();
  });
});
