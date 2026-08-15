import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ParameterBar } from "./ParameterBar.js";

describe("ParameterBar", () => {
  it("renders the label and current/max text", async () => {
    render(<ParameterBar label="HP" value={42} max={100} />);
    expect(screen.getByText("HP")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("42 / 100")).toBeInTheDocument());
  });

  it("exposes an accessible progressbar with correct bounds", () => {
    render(<ParameterBar label="INT" value={30} max={100} />);
    const bar = screen.getByRole("progressbar", { name: "INT" });
    expect(bar).toHaveAttribute("aria-valuenow", "30");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps a value above max down to max", () => {
    render(<ParameterBar label="HP" value={999} max={100} />);
    const bar = screen.getByRole("progressbar", { name: "HP" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps a negative value up to 0", () => {
    render(<ParameterBar label="HP" value={-5} max={100} />);
    const bar = screen.getByRole("progressbar", { name: "HP" });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });

  it("treats a max of 0 as 1 to avoid division by zero", () => {
    render(<ParameterBar label="HP" value={0} max={0} />);
    const bar = screen.getByRole("progressbar", { name: "HP" });
    expect(bar).toHaveAttribute("aria-valuemax", "1");
  });
});
