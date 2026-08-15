import { useCountUp } from "../../hooks/useCountUp.js";
import styles from "./ParameterBar.module.css";

export interface ParameterBarProps {
  label: string;
  value: number;
  max: number;
  /** A RetroPalette CSS variable name, e.g. "--rp-hp". Defaults to HP red. */
  colorVar?: string;
}

/** HP/MP-gauge-style status bar with a count-up animation on value changes. */
export function ParameterBar({ label, value, max, colorVar = "--rp-hp" }: ParameterBarProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(safeMax, Math.max(0, value));
  const displayed = useCountUp(clamped);
  const percent = (displayed / safeMax) * 100;

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
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
