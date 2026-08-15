import "@testing-library/jest-dom/vitest";

// jsdom's requestAnimationFrame support is inconsistent across versions;
// polyfill with a timer-based shim so count-up animations resolve
// deterministically in tests.
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number =>
    setTimeout(() => cb(performance.now()), 16) as unknown as number;
}
if (typeof globalThis.cancelAnimationFrame !== "function") {
  globalThis.cancelAnimationFrame = (handle: number): void =>
    clearTimeout(handle);
}
