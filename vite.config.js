/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

const myPlugin = () => ({
  name: "log-config",
  configResolved(resolvedConfig) {
    console.log(resolvedConfig.env);
  },
  configureServer(server) {
    console.log("what the fuck");
    return () => {
      server.middlewares.use((req, res, next) => {
        console.log("yoloooooooooooooooooooooooooooooooooooo");
        next();
      });
    };
  },
});

const viteConfig = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  env.ruler = "VITE_yolo";
  console.log(process.env);
  return {
    plugins: [react(), myPlugin()],
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
  };
});

export default viteConfig;

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   build: {
//     outDir: "build",
//   },
//   test: {
//     // ...
//     include: [
//       ...configDefaults.include,
//       "tests/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
//     ],
//   },
// });
