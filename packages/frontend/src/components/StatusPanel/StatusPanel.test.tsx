import type { CharacterStatus } from "@ganesya/stats-engine";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPanel } from "./StatusPanel.js";

function stat(score: number): CharacterStatus["hp"] {
  return { score, max: 100, details: {} };
}

const STATUS: CharacterStatus = {
  level: 12,
  xp: 500,
  hp: stat(80),
  int: stat(40),
  finance: stat(30),
  equipment: stat(20),
  judgement: stat(60),
  bond: stat(70),
};

describe("StatusPanel", () => {
  it("shows the character level", () => {
    render(<StatusPanel status={STATUS} />);
    expect(screen.getByText("Lv. 12")).toBeInTheDocument();
  });

  it("renders a progressbar for every stat category", () => {
    render(<StatusPanel status={STATUS} />);
    for (const label of ["HP", "INT", "財力", "装備", "判断力", "絆"]) {
      expect(screen.getByRole("progressbar", { name: label })).toBeInTheDocument();
    }
  });

  it("defaults the character name when none is given", () => {
    render(<StatusPanel status={STATUS} />);
    expect(screen.getByText("life-management")).toBeInTheDocument();
  });

  it("uses a custom character name when provided", () => {
    render(<StatusPanel status={STATUS} characterName="Kai" />);
    expect(screen.getByText("Kai")).toBeInTheDocument();
  });
});
