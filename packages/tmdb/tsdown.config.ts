import { readFileSync } from "node:fs";

import { defineConfig } from "tsdown";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

export default defineConfig({
	entry: {
		index: "src/index.ts",
		image: "src/image.ts",
		cli: "src/cli/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	treeshake: true,
	minify: true,
	sourcemap: false,
	hash: false,
	define: {
		__TMDB_VERSION__: JSON.stringify(version),
	},
});
