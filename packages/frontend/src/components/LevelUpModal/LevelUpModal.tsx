import { useEffect } from "react";
import { playBeepSequence } from "../../audio/beep.js";
import { useCountUp } from "../../hooks/useCountUp.js";
import { PixelWindow } from "../PixelWindow/PixelWindow.js";
import styles from "./LevelUpModal.module.css";

export interface LevelUpModalProps {
  previousLevel: number;
  newLevel: number;
  onClose: () => void;
  /** Set false to skip the Web Audio beep, e.g. in tests or muted mode. */
  playSound?: boolean;
  /** Injectable for tests; defaults to the real Web Audio implementation. */
  playBeep?: () => void;
}

/** "レベルが あがった！" celebration modal: flashing headline, count-up
 * level number, and a synthesized fanfare. */
export function LevelUpModal({
  previousLevel,
  newLevel,
  onClose,
  playSound = true,
  playBeep = playBeepSequence,
}: LevelUpModalProps) {
  const displayedLevel = useCountUp(newLevel);

  useEffect(() => {
    if (playSound) playBeep();
    // Only fire once when the modal mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose} data-testid="level-up-backdrop">
      <div onClick={(e) => e.stopPropagation()}>
        <PixelWindow className={styles.modal}>
          <div role="dialog" aria-modal="true" aria-label="レベルアップ">
            <p className={styles.headline}>レベルが あがった！</p>
            <p className={styles.levelText}>
              Lv. {previousLevel} → Lv. {displayedLevel}
            </p>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              とじる
            </button>
          </div>
        </PixelWindow>
      </div>
    </div>
  );
}
