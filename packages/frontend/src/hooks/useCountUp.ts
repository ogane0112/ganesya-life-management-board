import { useEffect, useRef, useState } from "react";

export interface UseCountUpOptions {
  /** Animation duration in ms. Defaults to 30ms per unit of change, capped at 1200ms. */
  durationMs?: number;
}

/**
 * Animates a displayed integer from its previous value up (or down) to
 * `target` whenever `target` changes, for the DQ-style "parapara"
 * count-up effect on stat numbers.
 */
export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
  const [displayed, setDisplayed] = useState(target);
  const frameRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) {
      setDisplayed(target);
      return;
    }

    const duration = options.durationMs ?? Math.min(1200, Math.abs(delta) * 30);
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      setDisplayed(Math.round(from + delta * progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return displayed;
}
