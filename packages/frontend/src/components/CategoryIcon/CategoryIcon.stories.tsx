import type { Meta, StoryObj } from "@storybook/react";
import { CategoryIcon } from "./CategoryIcon.js";

const meta: Meta<typeof CategoryIcon> = {
  title: "Design System/CategoryIcon",
  component: CategoryIcon,
  tags: ["autodocs"],
  argTypes: {
    category: {
      control: "select",
      options: ["hp", "int", "finance", "equipment", "judgement", "bond"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof CategoryIcon>;

export const Hp: Story = { args: { category: "hp" } };
export const AllCategories: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      {(["hp", "int", "finance", "equipment", "judgement", "bond"] as const).map((c) => (
        <CategoryIcon key={c} category={c} />
      ))}
    </div>
  ),
};
