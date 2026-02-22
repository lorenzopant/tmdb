import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig({
	test: {
		globals: true,
		environment: "node", // Use node if you don't need a browser environment
		coverage: {
			enabled: true,
			reporter: ["text", "json", "html", "clover"],
			exclude: ["src/types/**", "dist/**", "vitest.config.mts", "eslint.config.mjs", ".eslintrc.js", "src/index.ts"],
		},
		setupFiles: ["dotenv/config"],
		env: loadEnv(process.cwd(), ""),
	},
});
