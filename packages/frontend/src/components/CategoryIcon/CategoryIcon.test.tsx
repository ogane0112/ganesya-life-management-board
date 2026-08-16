import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryIcon, type StatCategory } from "./CategoryIcon.js";

const CATEGORIES: { category: StatCategory; label: string }[] = [
  { category: "hp", label: "継続力" },
  { category: "int", label: "資格力" },
  { category: "finance", label: "財力" },
  { category: "equipment", label: "生活基盤" },
  { category: "judgement", label: "判断力" },
  { category: "bond", label: "絆" },
];

describe("CategoryIcon", () => {
  it.each(CATEGORIES)("renders an accessible icon for $category", ({ category, label }) => {
    render(<CategoryIcon category={category} />);
    expect(screen.getByRole("img", { name: label })).toBeInTheDocument();
  });
});
