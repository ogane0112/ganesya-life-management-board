import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project sites are served from /<repo-name>/.
  base: process.env.VITE_BASE_PATH ?? "/ganesya-life-management-board/",
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
