import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        autoUpdate: true,
        lines: 86.06,
        functions: 86.61,
        branches: 78.18,
        statements: 86.27,
      },
    },
  },
});
