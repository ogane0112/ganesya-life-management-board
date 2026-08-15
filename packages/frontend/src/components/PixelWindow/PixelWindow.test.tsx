import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelWindow } from "./PixelWindow.js";

describe("PixelWindow", () => {
  it("renders children", () => {
    render(<PixelWindow>hello</PixelWindow>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders a title when provided", () => {
    render(<PixelWindow title="ステータス">body</PixelWindow>);
    expect(screen.getByText("ステータス")).toBeInTheDocument();
  });

  it("omits the title element entirely when not provided", () => {
    render(<PixelWindow>body</PixelWindow>);
    expect(screen.queryByTestId("pixel-window-title")).not.toBeInTheDocument();
  });

  it("exposes an accessible group labeled by the title", () => {
    render(<PixelWindow title="ステータス">body</PixelWindow>);
    expect(screen.getByRole("group", { name: "ステータス" })).toBeInTheDocument();
  });
});
