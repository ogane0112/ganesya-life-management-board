import type { StatExplanation } from "./statExplanations.js";
import styles from "./StatExplanationContent.module.css";

export interface StatExplanationContentProps {
  title: string;
  explanation: StatExplanation;
}

export function StatExplanationContent({
  title,
  explanation,
}: StatExplanationContentProps) {
  return (
    <span className={styles.root}>
      <span className={styles.title}>{title}</span>
      <span className={styles.summary}>{explanation.summary}</span>

      <span className={styles.sectionLabel}>データ元</span>
      <code className={styles.source}>{explanation.source}</code>

      <span className={styles.sectionLabel}>算出方法</span>
      <ul className={styles.list}>
        {explanation.formula.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {explanation.breakdown.length > 0 && (
        <>
          <span className={styles.sectionLabel}>いまの内訳</span>
          <dl className={styles.breakdown}>
            {explanation.breakdown.map(({ label, value }) => (
              <div className={styles.breakdownRow} key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </span>
  );
}
