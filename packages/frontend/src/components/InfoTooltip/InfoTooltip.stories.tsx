import type { Meta, StoryObj } from "@storybook/react";
import { InfoTooltip } from "./InfoTooltip.js";

const meta: Meta<typeof InfoTooltip> = {
  title: "Design System/InfoTooltip",
  component: InfoTooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "ホバー・クリック・キーボードフォーカスのいずれでも開く情報ポップオーバー。クリックで固定でき（タッチ端末用）、Escapeか外側クリックで閉じる。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InfoTooltip>;

export const Default: Story = {
  args: {
    label: "HP の説明",
    children: "logs/ の記録から、連続日数と直近の記録件数をもとに算出されます。",
  },
  render: (args) => (
    <div style={{ padding: 80 }}>
      <InfoTooltip {...args} />
    </div>
  ),
};
