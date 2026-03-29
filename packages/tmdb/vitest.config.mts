import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		coverage: {
			enabled: true,
			reporter: ["text", "json", "html", "clover"],
			exclude: ["src/types/**", "dist/**", "vitest.config.mts", "eslint.config.mjs", ".eslintrc.js", "src/index.ts"],
		},
		setupFiles: ["dotenv/config"],
	},
});
