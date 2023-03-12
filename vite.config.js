/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import process from 'node:process';

const showEnv = () => ({
  name: "log-config",
  configResolved(resolvedConfig) {
    console.log(resolvedConfig.env);
  },
});

// https:vitejs.dev/config/
export default defineConfig({
  plugins: [react(), showEnv()],
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
