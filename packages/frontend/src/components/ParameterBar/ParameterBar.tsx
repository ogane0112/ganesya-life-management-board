import { useCountUp } from "../../hooks/useCountUp.js";
import styles from "./ParameterBar.module.css";

export interface ParameterBarProps {
  /** Plain-language name of what is being measured, e.g. "継続力". */
  label: string;
  /**
   * One-line description of what the score actually counts. Shown under
   * the label so the meaning is readable without opening the info popover
   * (hidden on narrow screens, where the popover carries it instead).
   */
  hint?: string;
  value: number;
  max: number;
  /** A RetroPalette CSS variable name, e.g. "--rp-hp". Defaults to HP red. */
  colorVar?: string;
}

/** HP/MP-gauge-style status bar with a count-up animation on value changes. */
export function ParameterBar({
  label,
  hint,
  value,
  max,
  colorVar = "--rp-hp",
}: ParameterBarProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(safeMax, Math.max(0, value));
  const displayed = useCountUp(clamped);
  const percent = (displayed / safeMax) * 100;

  return (
    <div className={styles.row}>
      <span className={styles.labelBlock}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        <div
          className={styles.fill}
          style={{ width: `${percent}%`, background: `var(${colorVar})` }}
        />
      </div>
      <span className={styles.value}>
        {displayed} / {safeMax}
      </span>
    </div>
  );
}
