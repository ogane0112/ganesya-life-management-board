import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "life-management-rpg:last-seen-level";

export interface LevelUpEvent {
  previousLevel: number;
  newLevel: number;
}

/**
 * Compares `currentLevel` against the last level seen on this device
 * (persisted in localStorage) and surfaces a `LevelUpEvent` exactly once
 * per increase. The very first ever load is never treated as a level-up
 * (there's no prior level to compare against).
 */
export function useLevelUpDetection(
  currentLevel: number | null,
): [LevelUpEvent | null, () => void] {
  const [event, setEvent] = useState<LevelUpEvent | null>(null);

  useEffect(() => {
    if (currentLevel === null) return;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const previousLevel = stored === null ? currentLevel : Number(stored);

    if (currentLevel > previousLevel) {
      setEvent({ previousLevel, newLevel: currentLevel });
    }
    window.localStorage.setItem(STORAGE_KEY, String(currentLevel));
  }, [currentLevel]);

  const dismiss = useCallback(() => setEvent(null), []);

  return [event, dismiss];
}
