import type { ReactNode } from "react";
import styles from "./PixelWindow.module.css";

export interface PixelWindowProps {
  /** Optional title bar text, e.g. "ステータス" */
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Dragon-Quest-style bordered text window used as the base chrome for
 * every other panel in this app. */
export function PixelWindow({ title, children, className }: PixelWindowProps) {
  return (
    <div className={[styles.window, className].filter(Boolean).join(" ")} role="group" aria-label={title}>
      {title && (
        <div className={styles.title} data-testid="pixel-window-title">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
