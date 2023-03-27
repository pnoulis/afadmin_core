/// <reference types="vitest" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const showEnv = () => ({
  name: "log-config",
  configResolved(resolvedConfig) {
    console.log(resolvedConfig.env);
  },
});

// https:vitejs.dev/config/
export default defineConfig({
  plugins: [react(), showEnv(), svgr()],
  build: {
    outDir: "build",
  },
  test: {
    // ...
    include: [
      ...configDefaults.include,
      "tests.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
  },
});
