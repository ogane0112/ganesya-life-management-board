import type { Preview } from "@storybook/react";
import "../src/tokens/global.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "retro-dark",
      values: [{ name: "retro-dark", value: "#0f0f1b" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
