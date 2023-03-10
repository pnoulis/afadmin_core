/// <reference types="vitest" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
  },
  test: {
    // ...
    include: [
      ...configDefaults.include,
      "tests/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
  },
});
