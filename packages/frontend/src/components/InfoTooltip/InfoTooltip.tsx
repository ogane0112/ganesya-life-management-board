import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./InfoTooltip.module.css";

export interface InfoTooltipProps {
  /** Accessible name for the trigger, e.g. "HP の説明". */
  label: string;
  children: ReactNode;
}

/**
 * Pixel-styled info popover.
 *
 * Opens on hover *and* on click/focus deliberately: hover alone is
 * unusable on touch devices and unreachable by keyboard, so the click
 * "pins" it open and Escape / outside-click closes it. The trigger is a
 * real <button> so it lands in the tab order and announces its state.
 */
export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const panelId = useId();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  const open = pinned || hovered;

  // Rows near the bottom of the viewport would have their popover clipped,
  // so measure once it's laid out and flip it above the trigger instead.
  useLayoutEffect(() => {
    if (!open) {
      setFlipUp(false);
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 0;
    // Only flip when there's actually more headroom above than below,
    // otherwise flipping just clips the other end.
    const triggerTop = wrapperRef.current?.getBoundingClientRect().top ?? 0;
    setFlipUp(rect.bottom > viewportHeight && triggerTop > rect.height);
  }, [open]);

  useEffect(() => {
    if (!pinned) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPinned(false);
    }
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setPinned(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [pinned]);

  return (
    <span
      className={styles.wrapper}
      ref={wrapperRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setPinned((v) => !v)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <svg viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
          {/* 8x8 pixel "i" glyph: dot, gap, stem. */}
          <rect x={3} y={0} width={2} height={2} fill="currentColor" />
          <rect x={3} y={3} width={2} height={5} fill="currentColor" />
        </svg>
      </button>
      {open && (
        <span
          ref={panelRef}
          className={`${styles.panel} ${flipUp ? styles.panelUp : ""}`}
          id={panelId}
          role="tooltip"
        >
          {children}
        </span>
      )}
    </span>
  );
}
