import type { Meta, StoryObj } from "@storybook/react";
import { ParameterBar } from "./ParameterBar.js";

const meta: Meta<typeof ParameterBar> = {
  title: "Design System/ParameterBar",
  component: ParameterBar,
  tags: ["autodocs"],
  argTypes: {
    colorVar: {
      control: "select",
      options: ["--rp-hp", "--rp-mp", "--rp-gold", "--rp-green", "--rp-purple"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof ParameterBar>;

export const Hp: Story = {
  args: { label: "HP", value: 72, max: 100, colorVar: "--rp-hp" },
};

export const Low: Story = {
  args: { label: "INT", value: 8, max: 100, colorVar: "--rp-mp" },
};

export const Full: Story = {
  args: { label: "絆", value: 100, max: 100, colorVar: "--rp-green" },
};
