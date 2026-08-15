import type { Meta, StoryObj } from "@storybook/react";
import { LevelUpModal } from "./LevelUpModal.js";

const meta: Meta<typeof LevelUpModal> = {
  title: "Design System/LevelUpModal",
  component: LevelUpModal,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof LevelUpModal>;

export const Default: Story = {
  args: {
    previousLevel: 11,
    newLevel: 12,
    playSound: false,
    onClose: () => {},
  },
};
