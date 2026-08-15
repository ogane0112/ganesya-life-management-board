import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LevelUpModal } from "./LevelUpModal.js";

describe("LevelUpModal", () => {
  it("shows the level-up headline and the level transition", async () => {
    render(
      <LevelUpModal previousLevel={11} newLevel={12} onClose={vi.fn()} playSound={false} />,
    );
    expect(screen.getByText("レベルが あがった！")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Lv. 11 → Lv. 12")).toBeInTheDocument(),
    );
  });

  it("plays a beep on mount by default", () => {
    const playBeep = vi.fn();
    render(
      <LevelUpModal previousLevel={1} newLevel={2} onClose={vi.fn()} playBeep={playBeep} />,
    );
    expect(playBeep).toHaveBeenCalledTimes(1);
  });

  it("does not play a beep when playSound is false", () => {
    const playBeep = vi.fn();
    render(
      <LevelUpModal
        previousLevel={1}
        newLevel={2}
        onClose={vi.fn()}
        playSound={false}
        playBeep={playBeep}
      />,
    );
    expect(playBeep).not.toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <LevelUpModal previousLevel={1} newLevel={2} onClose={onClose} playSound={false} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "とじる" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked, but not when the panel itself is clicked", () => {
    const onClose = vi.fn();
    render(
      <LevelUpModal previousLevel={1} newLevel={2} onClose={onClose} playSound={false} />,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("level-up-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <LevelUpModal previousLevel={1} newLevel={2} onClose={onClose} playSound={false} />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
