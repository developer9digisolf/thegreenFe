import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/app/**",
        "**/pages/**",
        "**/public/**",
        "**/.next/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@afx/utils": path.resolve(__dirname, "./src/utilities"),
      "@afx/interfaces": path.resolve(__dirname, "./src/interfaces"),
      "@afx/services": path.resolve(__dirname, "./src/services"),
      "@afx/components": path.resolve(__dirname, "./src/components"),
      "@afx/views": path.resolve(__dirname, "./src/views"),
      "@afx/contexts": path.resolve(__dirname, "./src/contexts"),
      "@afx/controllers": path.resolve(__dirname, "./src/controllers"),
      "@afx/models": path.resolve(__dirname, "./src/models/configs"),
      "@afx/hooks": path.resolve(__dirname, "./src/hooks"),
      "@afx/styles": path.resolve(__dirname, "./src/assets/css"),
    },
  },
});
