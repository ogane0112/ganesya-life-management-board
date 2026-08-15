import type { CharacterStatus } from "@ganesya/stats-engine";
import type { Meta, StoryObj } from "@storybook/react";
import { StatusPanel } from "./StatusPanel.js";

function stat(score: number): CharacterStatus["hp"] {
  return { score, max: 100, details: {} };
}

const meta: Meta<typeof StatusPanel> = {
  title: "Design System/StatusPanel",
  component: StatusPanel,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatusPanel>;

export const MidGame: Story = {
  args: {
    characterName: "life-management",
    status: {
      level: 24,
      xp: 1200,
      hp: stat(78),
      int: stat(52),
      finance: stat(35),
      equipment: stat(60),
      judgement: stat(45),
      bond: stat(88),
    },
  },
};

export const FreshStart: Story = {
  args: {
    characterName: "life-management",
    status: {
      level: 1,
      xp: 0,
      hp: stat(0),
      int: stat(0),
      finance: stat(0),
      equipment: stat(0),
      judgement: stat(0),
      bond: stat(0),
    },
  },
};

export const MaxedOut: Story = {
  args: {
    characterName: "life-management",
    status: {
      level: 99,
      xp: 999999,
      hp: stat(99),
      int: stat(97),
      finance: stat(95),
      equipment: stat(98),
      judgement: stat(96),
      bond: stat(99),
    },
  },
};
