import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getAvatarTier, PixelAvatar } from "./PixelAvatar.js";

describe("getAvatarTier", () => {
  it("returns novice below level 10", () => {
    expect(getAvatarTier(1)).toBe("novice");
    expect(getAvatarTier(9)).toBe("novice");
  });
  it("returns adept from level 10 up to 29", () => {
    expect(getAvatarTier(10)).toBe("adept");
    expect(getAvatarTier(29)).toBe("adept");
  });
  it("returns veteran from level 30 up to 59", () => {
    expect(getAvatarTier(30)).toBe("veteran");
    expect(getAvatarTier(59)).toBe("veteran");
  });
  it("returns legend from level 60 and up", () => {
    expect(getAvatarTier(60)).toBe("legend");
    expect(getAvatarTier(99)).toBe("legend");
  });
});

describe("PixelAvatar", () => {
  it("reflects the computed tier in a data attribute", () => {
    render(<PixelAvatar level={45} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-tier", "veteran");
  });

  it("includes the level in its accessible label", () => {
    render(<PixelAvatar level={12} />);
    expect(screen.getByRole("img", { name: /Lv\. 12/ })).toBeInTheDocument();
  });
});
