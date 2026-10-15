import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        autoUpdate: true,
        lines: 82.96,
        functions: 81.39,
        branches: 76.53,
        statements: 83.21,
      },
    },
  },
});