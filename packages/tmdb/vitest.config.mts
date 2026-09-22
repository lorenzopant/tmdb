import { readFileSync } from "node:fs";

import { defineConfig } from "vitest/config";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

export default defineConfig({
	define: {
		__TMDB_VERSION__: JSON.stringify(version),
	},
	test: {
		globals: true,
		environment: "node",
		coverage: {
			enabled: true,
			reporter: ["text", "json", "html", "clover"],
			exclude: ["src/types/**", "dist/**", "vitest.config.mts", "src/index.ts", "src/cli/index.ts"],
		},
		setupFiles: ["dotenv/config"],
	},
});
