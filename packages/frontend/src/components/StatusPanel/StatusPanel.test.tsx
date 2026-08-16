import type { CharacterStatus } from "@ganesya/stats-engine";
import { fireEvent, render, screen } from "@testing-library/react";
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
    for (const label of ["継続力", "資格力", "財力", "生活基盤", "判断力", "絆"]) {
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

  it("offers an info trigger for every stat and for LV", () => {
    render(<StatusPanel status={STATUS} />);
    for (const label of ["継続力", "資格力", "財力", "生活基盤", "判断力", "絆", "LV"]) {
      expect(
        screen.getByRole("button", { name: `${label} の説明` }),
      ).toBeInTheDocument();
    }
  });

  it("explains where a stat comes from when its info trigger is clicked", () => {
    render(<StatusPanel status={STATUS} />);
    fireEvent.click(screen.getByRole("button", { name: "判断力 の説明" }));

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("decisions/");
    expect(tooltip).toHaveTextContent("意思決定ログ");
  });

  it("names what each stat measures without needing the popover", () => {
    render(<StatusPanel status={STATUS} />);
    expect(screen.getByText("日々の記録の続きぐあい")).toBeInTheDocument();
    expect(screen.getByText("AIとの対話ログの数")).toBeInTheDocument();
  });

  it("leads the popover with a plain-language summary", () => {
    render(<StatusPanel status={STATUS} />);
    fireEvent.click(screen.getByRole("button", { name: "生活基盤 の説明" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      /家電・住まいなど生活の基盤/,
    );
  });

  it("shows the live breakdown from the status details", () => {
    const status: CharacterStatus = {
      ...STATUS,
      hp: { score: 18, max: 100, details: { streakDays: 0, recentCount: 12 } },
    };
    render(<StatusPanel status={status} />);
    fireEvent.click(screen.getByRole("button", { name: "継続力 の説明" }));

    expect(screen.getByRole("tooltip")).toHaveTextContent("12 件");
  });
});
