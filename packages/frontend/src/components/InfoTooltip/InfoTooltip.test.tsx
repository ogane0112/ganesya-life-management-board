import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfoTooltip } from "./InfoTooltip.js";

function setup() {
  render(
    <div>
      <InfoTooltip label="HP の説明">中身のせつめい</InfoTooltip>
      <button type="button">外側</button>
    </div>,
  );
  return screen.getByRole("button", { name: "HP の説明" });
}

describe("InfoTooltip", () => {
  it("is closed initially", () => {
    setup();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on hover and closes on mouse leave", () => {
    const trigger = setup();
    fireEvent.mouseEnter(trigger.parentElement!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("中身のせつめい");

    fireEvent.mouseLeave(trigger.parentElement!);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("stays open after a click even when the pointer leaves (touch/pinned)", () => {
    const trigger = setup();
    fireEvent.click(trigger);
    fireEvent.mouseLeave(trigger.parentElement!);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("toggles closed on a second click", () => {
    const trigger = setup();
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on keyboard focus", () => {
    const trigger = setup();
    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("closes a pinned popover on Escape", () => {
    const trigger = setup();
    fireEvent.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("closes a pinned popover when clicking outside", () => {
    const trigger = setup();
    fireEvent.click(trigger);
    fireEvent.mouseDown(screen.getByRole("button", { name: "外側" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not close when interacting inside the popover", () => {
    const trigger = setup();
    fireEvent.click(trigger);
    fireEvent.mouseDown(screen.getByRole("tooltip"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("reflects open state on the trigger for assistive tech", () => {
    const trigger = setup();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders without throwing when layout measurement finds no room (jsdom has zero-size boxes)", () => {
    // jsdom reports 0 for every rect, which exercises the "don't flip"
    // branch; the point here is that measuring never crashes on open.
    const trigger = setup();
    expect(() => fireEvent.click(trigger)).not.toThrow();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
