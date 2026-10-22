import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        autoUpdate: true,
        lines: 86.56,
        functions: 87.4,
        branches: 78.78,
        statements: 86.76,
      },
    },
  },
});
