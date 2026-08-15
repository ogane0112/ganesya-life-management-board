export interface BeepStep {
  frequency: number;
  durationMs: number;
}

/** A simple ascending arpeggio standing in for the DQ level-up jingle. */
export const LEVEL_UP_FANFARE: BeepStep[] = [
  { frequency: 523.25, durationMs: 100 }, // C5
  { frequency: 659.25, durationMs: 100 }, // E5
  { frequency: 783.99, durationMs: 100 }, // G5
  { frequency: 1046.5, durationMs: 250 }, // C6
];

/**
 * Synthesizes `steps` as a sequence of square-wave beeps via the Web Audio
 * API. `createContext` is injectable so tests can supply a fake
 * AudioContext instead of relying on jsdom (which doesn't implement one).
 * Any failure (unsupported browser, autoplay policy, etc.) is swallowed —
 * the level-up visuals must work with or without sound.
 */
export function playBeepSequence(
  steps: BeepStep[] = LEVEL_UP_FANFARE,
  createContext: () => AudioContext = () =>
    new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(),
): void {
  try {
    const ctx = createContext();
    let startTime = ctx.currentTime;
    for (const step of steps) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = step.frequency;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, startTime);
      oscillator.start(startTime);
      oscillator.stop(startTime + step.durationMs / 1000);
      startTime += step.durationMs / 1000;
    }
  } catch {
    // Intentionally silent — see doc comment above.
  }
}
