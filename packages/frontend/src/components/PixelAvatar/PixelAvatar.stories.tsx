import type { Meta, StoryObj } from "@storybook/react";
import { PixelAvatar } from "./PixelAvatar.js";

const meta: Meta<typeof PixelAvatar> = {
  title: "Design System/PixelAvatar",
  component: PixelAvatar,
  tags: ["autodocs"],
  argTypes: {
    level: { control: { type: "number", min: 1, max: 99 } },
  },
};
export default meta;

type Story = StoryObj<typeof PixelAvatar>;

export const Novice: Story = { args: { level: 3 } };
export const Adept: Story = { args: { level: 15 } };
export const Veteran: Story = { args: { level: 40 } };
export const Legend: Story = { args: { level: 90 } };
