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
	deps: {
		// The SDK ships with zero runtime dependencies. chalk is a devDependency bundled into dist/cli.mjs only;
		// the build fails if anything else from node_modules ends up in the output.
		onlyAllowBundle: ["chalk"],
	},
	define: {
		__TMDB_VERSION__: JSON.stringify(version),
	},
});
