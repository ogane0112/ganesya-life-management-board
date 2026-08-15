import type { Meta, StoryObj } from "@storybook/react";
import { PixelWindow } from "./PixelWindow.js";

const meta: Meta<typeof PixelWindow> = {
  title: "Design System/PixelWindow",
  component: PixelWindow,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PixelWindow>;

export const Default: Story = {
  args: {
    title: "ステータス",
    children: "ウィンドウの中身がここに入ります",
  },
};

export const NoTitle: Story = {
  args: {
    children: "タイトルなしのウィンドウ",
  },
};
